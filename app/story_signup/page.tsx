import { redirect } from "next/navigation";
import StorySignupForm from "./story-signup-form";

export default function StorySignupPage({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const token = searchParams.token;

  // Redirect if no token is present in the URL
  if (!token) {
    redirect("/");
  }

  return (
    <div className="container-sare py-12">
      <StorySignupForm token={token} />
    </div>
  );
}

 