import { redirect } from "next/navigation";
import StorySignupForm from "./story-signup-form";

// Update prop type: searchParams is now a Promise (per Next.js 15)
type StorySignupPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StorySignupPage({
  searchParams,
}: StorySignupPageProps) {
  // Await the promise to get the actual search params object
  const resolvedSearchParams = await searchParams;
  const token =
    typeof resolvedSearchParams.token === "string"
      ? resolvedSearchParams.token
      : undefined;

  // Redirect if token is missing
  if (!token) {
    redirect("/");
  }

  return (
    <div className="container-sare py-12">
      <StorySignupForm token={token} />
    </div>
  );
}

 