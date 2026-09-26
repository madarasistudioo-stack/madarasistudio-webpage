import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignInForm } from "@/components/SignInForm";

export const metadata = { title: "Sign in — Madarasi Studio" };
export const dynamic = "force-dynamic";

// Only offer the sign-in methods whose keys are actually configured.
export default async function SignInPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const callbackUrl = searchParams.callbackUrl?.startsWith("/") ? searchParams.callbackUrl : "/account";
  const session = await getServerSession(authOptions);
  if (session) redirect(callbackUrl);

  const enabled = {
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    apple: Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
    email: Boolean(process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM),
    phone: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SERVICE_SID),
  };
  return <SignInForm enabled={enabled} callbackUrl={callbackUrl} />;
}
