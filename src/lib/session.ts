import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// For account pages: returns the signed-in user's id, or sends them to sign in.
export async function requireUser(returnTo: string) {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!session || !id) redirect(`/auth/signin?callbackUrl=${encodeURIComponent(returnTo)}`);
  return { id, session };
}
