import { requireUnAuth } from "@/lib/auth-utils";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUnAuth();
  return (
    <div className="h-screen flex items-center justify-center">{children}</div>
  );
}
