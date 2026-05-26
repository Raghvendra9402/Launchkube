import { requireUnAuth } from "@/lib/auth-utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUnAuth();
  return (
    <div className="relative h-screen flex items-center justify-center">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Home
      </Link>

      {children}
    </div>
  );
}
