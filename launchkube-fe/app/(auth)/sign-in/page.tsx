"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function SignInPage() {
  const handleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };
  return (
    <Card className="w-[20rem]">
      <CardHeader>
        <CardTitle>Get started with Launchkube</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-2 mt-4">
        <Button
          variant={"outline"}
          onClick={handleSignIn}
          className="w-full cursor-pointer"
        >
          <FcGoogle className="size-4 mr-2" />
          Sign in with Google
        </Button>
        <Button
          variant={"outline"}
          onClick={handleSignIn}
          className="w-full cursor-pointer"
        >
          <FaGithub className="size-4 mr-2" />
          Sign in with Github
        </Button>
      </CardContent>
    </Card>
  );
}
