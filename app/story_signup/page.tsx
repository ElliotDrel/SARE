import { redirect } from "next/navigation";
import StorySignupForm from "./story-signup-form";

// Define the standard props for a Next.js page component
type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function StorySignupPage({ searchParams }: Props) {
  // Access the token and handle potential type variations
  const token = searchParams.token;

  // Redirect if no token is present or if it's an array (which is unexpected here)
  if (!token || Array.isArray(token)) {
    redirect("/");
  }

  return (
    <div className="container-sare py-12">
      <StorySignupForm token={token} />
    </div>
  );
}

 