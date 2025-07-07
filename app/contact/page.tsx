import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";
import { ContactMessageInsert } from "@/lib/supabase/types";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Talk to Us",
  description: "Send a message to the SARE team."
};

async function submitContactForm(formData: FormData) {
  "use server";
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // Basic validation
  if (!name || !email || !message) {
    throw new Error("All fields are required");
  }

  const contactData: ContactMessageInsert = {
    name,
    email,
    message,
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .insert(contactData);

  if (error) {
    throw new Error("Failed to send message. Please try again.");
  }

  redirect("/contact?success=true");
}

interface ContactPageProps {
  searchParams?: Promise<{
    success?: string;
  }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const isSuccess = params?.success === "true";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-teal text-white section-spacing">
        <div className="container-sare text-center">
          <h1 className="heading-xl mb-6">
            Talk to Us
          </h1>
          <p className="body-lg max-w-3xl mx-auto text-white/90">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section-spacing">
        <div className="container-sare">
          <div className="max-w-2xl mx-auto">
            {isSuccess ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="text-center">
                  <CardTitle className="text-green-800">Message Sent Successfully!</CardTitle>
                  <CardDescription className="text-green-600">
                    Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button asChild className="bg-primary-teal hover:bg-primary-teal/90">
                    <Link href="/">Return Home</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary-teal">Send us a message</CardTitle>
                  <CardDescription>
                    Whether you have questions about SARE, need support, or want to learn more about our services, we&apos;re here to help.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={submitContactForm} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Your full name"
                          required
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        placeholder="Tell us how we can help you..."
                        required
                        className="resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-accent-coral hover:bg-accent-coral/90"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Additional Contact Info */}
      <section className="section-spacing bg-gray-50">
        <div className="container-sare">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-6">Other Ways to Connect</h2>
            <p className="body-lg text-gray-600 max-w-3xl mx-auto">
              Explore our other resources or connect with us through different channels.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-primary-teal">Research Library</CardTitle>
                <CardDescription>
                  Explore the scientific foundation behind the SARE methodology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/research">View Research</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-primary-teal">About SARE</CardTitle>
                <CardDescription>
                  Learn more about what SARE is and how it was developed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href="/about">Learn More</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-primary-teal">Get Started</CardTitle>
                <CardDescription>
                  Ready to begin your SARE journey and discover your strengths?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="bg-primary-teal hover:bg-primary-teal/90">
                  <Link href="/auth/sign-up">Start Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}