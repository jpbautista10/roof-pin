import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, MapPin } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up";

const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const redirectPath = useMemo(() => {
    const next = (location.state as { from?: string } | null)?.from;
    if (!next || next.startsWith("/auth")) {
      return "/dashboard";
    }
    return next;
  }, [location.state]);

  const signInMutation = useMutation({
    mutationFn: async (values: AuthFormValues) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      toast.success("Signed in successfully.");
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Authentication failed";
      toast.error(message);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (values: AuthFormValues) => {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: import.meta.env.VITE_APP_URL
            ? `${import.meta.env.VITE_APP_URL}/auth/login`
            : undefined,
        },
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Account created. You can now sign in.");
      setMode("sign-in");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Authentication failed";
      toast.error(message);
    },
  });

  const isSubmitting = signInMutation.isPending || signUpMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    if (mode === "sign-in") {
      await signInMutation.mutateAsync(values);
      return;
    }

    await signUpMutation.mutateAsync(values);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Checking your session...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-teal-50/30 px-4 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <Link
          to="/"
          className="mx-auto inline-flex items-center gap-2 text-slate-800"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-4 w-4 text-white" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            Neighborhood Proof
          </span>
        </Link>

        <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/40">
          <CardHeader className="space-y-3">
            <div className="inline-flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("sign-in")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === "sign-in"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("sign-up")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === "sign-up"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Create account
              </button>
            </div>
            <CardTitle className="text-2xl text-slate-900">
              {mode === "sign-in" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "sign-in"
                ? "Sign in with your email and password to access your dashboard."
                : "Use your email and password to create a new account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={
                    mode === "sign-in" ? "current-password" : "new-password"
                  }
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "sign-in"
                      ? "Signing in..."
                      : "Creating account..."}
                  </>
                ) : mode === "sign-in" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
