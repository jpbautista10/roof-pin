import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/auth/AuthProvider";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading } = useAuth();

  const redirectPath = useMemo(() => {
    const fromState = (location.state as { from?: string } | null)?.from;
    const fromQuery = searchParams.get("next");
    const next = fromState || fromQuery;
    if (!next || next.startsWith("/auth")) {
      return "/dashboard";
    }
    return next;
  }, [location.state, searchParams]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
    },
  });

  const emailLinkMutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const redirectBase =
        import.meta.env.VITE_APP_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email.trim().toLowerCase(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${redirectBase}/auth/login?next=${encodeURIComponent(redirectPath)}`,
        },
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: (_, values) => {
      toast.success(`Login link sent to ${values.email.trim().toLowerCase()}.`);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to send login link.";
      toast.error(message);
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await emailLinkMutation.mutateAsync(values);
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
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
        <BrandLogo to="/" className="mx-auto" />

        <Card className="border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/40">
          <CardHeader className="space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl text-slate-900">
              Get your login link
            </CardTitle>
            <CardDescription>
              Enter the email attached to your purchase and we will send you a
              magic link.
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

              <Button
                type="submit"
                className="w-full"
                disabled={emailLinkMutation.isPending}
              >
                {emailLinkMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Email me a login link"
                )}
              </Button>

              <p className="text-center text-xs text-slate-500">
                Need access first?{" "}
                <a href="/get-started" className="font-medium text-primary">
                  Go to checkout
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
