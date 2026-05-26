"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

type Provider = "google" | "github";

export default function SignInPage() {
  const handleSignIn = async (provider: Provider) => {
    await authClient.signIn.social({
      provider: provider,
      callbackURL: "/",
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <Card className="w-full max-w-sm shadow-lg border-muted">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-10 h-10 rrounded-lg bg-linear-to-br from-cyan-400 to-cyan-300 text-white flex items-center justify-center font-bold text-sm">
            LK
          </div>

          <CardTitle className="text-2xl font-semibold">
            Welcome to Launchkube
          </CardTitle>

          <CardDescription>
            Deploy and manage your apps effortlessly.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => handleSignIn("google")}
            className="w-full h-11 cursor-pointer transition-all"
          >
            <FcGoogle className="size-5 mr-2" />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            onClick={() => handleSignIn("github")}
            className="w-full h-11 cursor-pointer transition-all"
          >
            <FaGithub className="size-5 mr-2" />
            Continue with GitHub
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-2">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
