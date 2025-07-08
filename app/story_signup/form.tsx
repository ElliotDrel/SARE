"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signup } from "./actions";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending} disabled={pending}>
      {pending ? "Creating Account..." : "Sign Up"}
    </Button>
  );
}

export function StorytellerSignUpForm({ token }: { token: string | null }) {
  const [state, formAction] = useFormState(signup, initialState);

  return (
    <CardContent>
      <form action={formAction}>
        <input type="hidden" name="token" value={token || ""} />
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.message && (
            <p className="text-sm text-red-500 text-center">{state.message}</p>
          )}
          <SubmitButton />
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </form>
    </CardContent>
  );
} 