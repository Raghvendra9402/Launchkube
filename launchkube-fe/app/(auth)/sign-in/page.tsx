"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant={"outline"} onClick={handleSignIn}>
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
