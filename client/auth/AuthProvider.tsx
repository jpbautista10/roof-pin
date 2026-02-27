import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Database } from "@shared/database.types";

type DbUser = Database["public"]["Tables"]["users"]["Row"];
type Company = Database["public"]["Tables"]["companies"]["Row"];

const DEFAULT_THEME = {
  primary: "217 71% 45%",
  secondary: "220 20% 94%",
  accent: "168 60% 40%",
};

function hexToHslString(hex: string) {
  const cleaned = hex.replace("#", "");
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : cleaned;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  dbUser: DbUser | null;
  company: Company | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery<Session | null>({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        return null;
      }

      return data.session ?? null;
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const user = sessionQuery.data?.user ?? null;

  const profileQuery = useQuery<DbUser | null>({
    queryKey: ["auth", "profile", user?.id],
    enabled: !!user,
    retry: false,
    queryFn: async () => {
      if (!user) {
        return null;
      }

      let { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile && !error) {
        const inserted = await supabase
          .from("users")
          .insert({ id: user.id, email: user.email ?? "" })
          .select("*")
          .single();

        if (inserted.error) {
          return null;
        }

        profile = inserted.data;
      }

      if (error) {
        return null;
      }

      return profile ?? null;
    },
  });

  const dbUser = profileQuery.data ?? null;

  const companyQuery = useQuery<Company | null>({
    queryKey: ["auth", "company", dbUser?.company_id],
    enabled: !!dbUser?.company_id,
    retry: false,
    queryFn: async () => {
      if (!dbUser?.company_id) {
        return null;
      }

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", dbUser.company_id)
        .maybeSingle();

      if (error) {
        return null;
      }

      return data ?? null;
    },
  });

  const company = companyQuery.data ?? null;

  useEffect(() => {
    const root = document.documentElement;

    const primary = company?.brand_primary_color
      ? hexToHslString(company.brand_primary_color)
      : null;
    const secondary = company?.brand_secondary_color
      ? hexToHslString(company.brand_secondary_color)
      : null;
    const accent = company?.brand_accent_color
      ? hexToHslString(company.brand_accent_color)
      : null;

    root.style.setProperty("--primary", primary ?? DEFAULT_THEME.primary);
    root.style.setProperty("--secondary", secondary ?? DEFAULT_THEME.secondary);
    root.style.setProperty("--accent", accent ?? DEFAULT_THEME.accent);
    root.style.setProperty("--ring", primary ?? DEFAULT_THEME.primary);
    root.style.setProperty(
      "--sidebar-primary",
      primary ?? DEFAULT_THEME.primary,
    );
  }, [company]);

  const refreshProfile = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] }),
      queryClient.invalidateQueries({ queryKey: ["auth", "company"] }),
    ]);
  }, [queryClient]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      queryClient.setQueryData(["auth", "session"], nextSession ?? null);
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "company"] });

      if (!nextSession) {
        queryClient.removeQueries({ queryKey: ["auth", "profile"] });
        queryClient.removeQueries({ queryKey: ["auth", "company"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const isLoading =
    sessionQuery.isLoading ||
    (Boolean(user) && profileQuery.isLoading) ||
    (Boolean(dbUser?.company_id) && companyQuery.isLoading);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session: sessionQuery.data ?? null,
      dbUser,
      company,
      isLoading,
      refreshProfile,
    }),
    [user, sessionQuery.data, dbUser, company, isLoading, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
