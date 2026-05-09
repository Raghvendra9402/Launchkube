import HomePage from "@/components/shared/HomePage";
import { requireUnAuth } from "@/lib/auth-utils";

export default async function Home() {
  await requireUnAuth();
  return <HomePage />;
}
