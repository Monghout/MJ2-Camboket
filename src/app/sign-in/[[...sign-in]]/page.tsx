import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <SignIn
      afterSignInUrl="/page"
      afterSignUpUrl="/page" // Redirect to homepage after sign-in
    />
  );
}
