import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "SARE, See Yourself at Your Best",
  description: "Discover a research backed exercise that reveals your signature strengths and helps you live from your best self every day."
};

const whatRightForYouCards = [
  {
    title: "Individual",
    description: "Personal journey of self-discovery through the SARE exercise",
    features: ["Self-guided experience", "Personal reflection tools", "Individual report generation"]
  },
  {
    title: "Coaching or Team Workshop",
    description: "Facilitated group sessions for teams and organizations",
    features: ["Professional facilitation", "Team building exercises", "Group insights and discussions"]
  },
  {
    title: "Certified In-House Facilitator",
    description: "Train your own team members to facilitate SARE sessions",
    features: ["Comprehensive training program", "Certification credentials", "Internal facilitation capability"]
  },
  {
    title: "Education",
    description: "Academic integration of SARE methodology in educational settings",
    features: ["Curriculum integration", "Student development focus", "Educational research applications"]
  }
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-teal to-primary-teal/90 text-white section-spacing">
        <div className="container-sare text-center">
          <h1 className="heading-xl mb-6">
            WHO ARE YOU AT YOUR BEST?
          </h1>
          <p className="body-lg mb-8 max-w-3xl mx-auto text-white/90">
            Discover a research backed exercise that reveals your signature strengths and helps you live from your best self every day.
          </p>
          {user ? (
            <Button asChild size="lg" className="bg-accent-coral hover:bg-accent-coral/90 text-white">
              <Link href="/protected">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="bg-accent-coral hover:bg-accent-coral/90 text-white">
              <Link href="/auth/sign-up">Begin Your Journey</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Extraordinary Moments Section */}
      <section className="section-spacing">
        <div className="container-sare text-center">
          <h2 className="heading-lg mb-6">Extraordinary Moments</h2>
          <p className="body-lg mb-8 max-w-4xl mx-auto text-gray-600">
            We all have moments when we feel most alive, engaged, and authentic. These are the times when we're operating from our signature strengths - our unique combination of talents, skills, and values that make us who we are at our best.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/about">Learn More About SARE</Link>
          </Button>
        </div>
      </section>

      {/* What's Right for You Section */}
      <section className="section-spacing bg-gray-50">
        <div className="container-sare">
          <h2 className="heading-lg text-center mb-12">What's Right for You?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whatRightForYouCards.map((card, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-primary-teal">{card.title}</CardTitle>
                  <CardDescription className="text-base">{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {card.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-accent-coral rounded-full mr-3"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Discover Your Best Self Banner */}
      <section className="section-spacing bg-accent-coral text-white">
        <div className="container-sare text-center">
          <h2 className="heading-lg mb-6">Discover Your Best Self</h2>
          <p className="body-lg mb-8 max-w-3xl mx-auto">
            Through the SARE exercise, you'll collect stories from people who know you well, reflect on your experiences, and generate insights that help you understand and leverage your signature strengths.
          </p>
          <Button asChild size="lg" variant="outline" className="bg-white text-accent-coral hover:bg-gray-100">
            <Link href="/auth/sign-up">Start Your SARE Journey</Link>
          </Button>
        </div>
      </section>

      {/* Proven and Positive Section */}
      <section className="section-spacing">
        <div className="container-sare text-center">
          <h2 className="heading-lg mb-6">Proven and Positive</h2>
          <p className="body-lg mb-8 max-w-4xl mx-auto text-gray-600">
            The SARE methodology is grounded in decades of research on positive psychology, strengths-based development, and narrative identity. Our approach has been validated through peer-reviewed studies and real-world applications.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/research">Explore Our Research</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}