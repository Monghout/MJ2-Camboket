import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <SignIn
      afterSignInUrl="/"
      afterSignUpUrl="/" // Redirect to homepage after sign-in
    />
  );
}
