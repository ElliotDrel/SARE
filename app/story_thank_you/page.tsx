import Link from "next/link";

export default function StoryThankYouPage() {
  return (
    <div className="container-sare py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-green-200 p-8 mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h1 className="heading-xl text-green-800 mb-4">
            Thank You for Your Story!
          </h1>
          
          <p className="body-lg text-neutral-600 mb-6">
            Your story has been successfully submitted and will contribute to creating a meaningful SARE report.
          </p>
          
          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h2 className="heading-md text-green-800 mb-3">
              What Happens Next?
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <p className="body-md text-green-700">
                  Your story will be compiled with others as part of the SARE exercise
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <p className="body-md text-green-700">
                  The person who invited you will use these stories for their personal development
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <p className="body-md text-green-700">
                  Together, these stories help reveal signature strengths and best-self qualities
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About SARE Section */}
        <div className="bg-primary-teal/5 border-2 border-primary-teal/20 rounded-lg p-8 mb-8">
          <h2 className="heading-lg text-primary-teal mb-4">
            Learn More About SARE
          </h2>
          <p className="body-md text-neutral-600 mb-6">
            The SARE (See Yourself at Your Best) exercise is a research-backed method for discovering signature strengths and developing personal excellence.
          </p>
          <div className="space-y-4">
            <Link
              href="/about"
              className="inline-flex items-center px-6 py-3 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-colors font-medium mr-4"
            >
              Learn About SARE
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center px-6 py-3 border-2 border-primary-teal text-primary-teal rounded-lg hover:bg-primary-teal/5 transition-colors font-medium"
            >
              View Research
            </Link>
          </div>
        </div>

        {/* Personal Experience Section */}
        <div className="bg-accent-coral/10 border-2 border-accent-coral/30 rounded-lg p-8 mb-8">
          <h2 className="heading-lg text-accent-coral mb-4">
            Want Your Own SARE Experience?
          </h2>
          <p className="body-md text-neutral-600 mb-6">
            Discover your own signature strengths and learn to live from your best self every day.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 bg-accent-coral text-white rounded-lg hover:bg-accent-coral/90 transition-colors font-medium text-lg"
          >
            Start Your SARE Journey
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="body-sm text-neutral-500 mb-4">
            Thank you for contributing to this important personal development exercise.
          </p>
          <Link
            href="/"
            className="text-primary-teal hover:text-primary-teal/80 font-medium"
          >
            Return to SARE Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Thank You - SARE",
  description: "Thank you for submitting your story for the SARE exercise."
}; 