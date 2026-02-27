import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Database } from "@shared/database.types";

type DbUser = Database['public']['Tables']['users']['Row']
type Company = Database['public']['Tables']['companies']['Row']

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
  const [session, setSession] = useState<Session | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setDbUser(null);
      setCompany(null);
      return;
    }

    let { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", nextUser.id)
      .maybeSingle();

    if (!profile && !error) {
      const inserted = await supabase
        .from("users")
        .insert({ id: nextUser.id, email: nextUser.email ?? "" })
        .select("*")
        .single();

      profile = inserted.data ?? null;
      error = inserted.error;
    }

    if (error || !profile) {
      setDbUser(null);
      setCompany(null);
      return;
    }

    setDbUser(profile);

    if (!profile.company_id) {
      setCompany(null);
      return;
    }

    const companyResult = await supabase
      .from("companies")
      .select(
        "*",
      )
      .eq("id", profile.company_id)
      .maybeSingle();

    if (companyResult.error) {
      setCompany(null);
      return;
    }

    setCompany(companyResult.data ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user ?? null);
  }, [loadProfile, session?.user]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session ?? null);
      await loadProfile(data.session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await loadProfile(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      dbUser,
      company,
      isLoading,
      refreshProfile,
    }),
    [session, dbUser, company, isLoading, refreshProfile],
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
