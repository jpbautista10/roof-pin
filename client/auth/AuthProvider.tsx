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
