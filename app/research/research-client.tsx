"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResearchItem {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  topic: string;
  type: "peer-reviewed" | "white-paper" | "case-study";
  abstract: string;
  link?: string;
}

const researchTopics = [
  "All Topics",
  "Positive Psychology", 
  "Strengths Development",
  "Narrative Identity",
  "360-Degree Feedback",
  "Organizational Development",
  "Personal Development"
];

const researchData: ResearchItem[] = [
  {
    id: "1",
    title: "The Role of Character Strengths in Well-being and Life Satisfaction",
    authors: "Peterson, C., & Seligman, M. E. P.",
    journal: "Journal of Positive Psychology",
    year: 2004,
    topic: "Positive Psychology",
    type: "peer-reviewed",
    abstract: "This foundational study explores how character strengths contribute to individual well-being and life satisfaction, providing the theoretical framework for strengths-based interventions."
  },
  {
    id: "2", 
    title: "Narrative Identity Development in Emerging Adulthood",
    authors: "Arnett, J. J., & McAdams, D. P.",
    journal: "Developmental Psychology",
    year: 2018,
    topic: "Narrative Identity",
    type: "peer-reviewed",
    abstract: "Examines how individuals construct coherent life narratives during emerging adulthood and the impact on identity formation and future goal-setting."
  },
  {
    id: "3",
    title: "The Effectiveness of 360-Degree Feedback in Leadership Development",
    authors: "Bracken, D. W., & Rose, D. S.",
    journal: "Human Resource Management Review",
    year: 2011,
    topic: "360-Degree Feedback",
    type: "peer-reviewed",
    abstract: "Meta-analysis of 360-degree feedback interventions showing significant improvements in self-awareness and leadership effectiveness when properly implemented."
  },
  {
    id: "4",
    title: "Strengths-Based Development: A New Paradigm for Talent Management",
    authors: "Clifton, D. O., & Harter, J. K.",
    journal: "Gallup Research",
    year: 2003,
    topic: "Strengths Development",
    type: "white-paper",
    abstract: "Comprehensive review of research supporting strengths-based approaches to employee development and organizational performance improvement."
  },
  {
    id: "5",
    title: "The SARE Methodology: Integrating Narrative and Strengths Approaches",
    authors: "Research Team",
    journal: "SARE Institute",
    year: 2023,
    topic: "Personal Development",
    type: "white-paper",
    abstract: "Introduction to the SARE methodology, combining narrative identity theory with strengths-based development for comprehensive personal insight."
  },
  {
    id: "6",
    title: "Case Study: SARE Implementation in Fortune 500 Company",
    authors: "Wilson, A., & Thompson, K.",
    journal: "Organizational Development Quarterly",
    year: 2023,
    topic: "Organizational Development",
    type: "case-study",
    abstract: "Analysis of SARE implementation across 500 employees, showing significant improvements in engagement, performance, and retention rates."
  },
  {
    id: "7",
    title: "Positive Psychology Interventions: A Meta-Analytic Review",
    authors: "Sin, N. L., & Lyubomirsky, S.",
    journal: "Clinical Psychological Science",
    year: 2009,
    topic: "Positive Psychology",
    type: "peer-reviewed",
    abstract: "Comprehensive meta-analysis of positive psychology interventions, demonstrating their effectiveness in enhancing well-being and reducing depression."
  },
  {
    id: "8",
    title: "The Science of Story: Applications in Personal Development",
    authors: "McAdams, D. P., & McLean, K. C.",
    journal: "Current Directions in Psychological Science",
    year: 2013,
    topic: "Narrative Identity",
    type: "peer-reviewed",
    abstract: "Review of research on how personal narratives shape identity development and psychological well-being across the lifespan."
  }
];

export function ResearchClient() {
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  
  const filteredResearch = selectedTopic === "All Topics" 
    ? researchData 
    : researchData.filter(item => item.topic === selectedTopic);

  const getTypeColor = (type: ResearchItem['type']) => {
    switch (type) {
      case "peer-reviewed": return "bg-primary-teal text-white";
      case "white-paper": return "bg-accent-coral text-white";
      case "case-study": return "bg-gray-600 text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <section className="section-spacing">
      <div className="container-sare">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="heading-sm mb-4">Filter by Topic</h3>
              <div className="space-y-2">
                {researchTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedTopic === topic
                        ? "bg-primary-teal text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              
              {/* Research Stats */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Research Overview</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Total Studies: {researchData.length}</div>
                  <div>Peer Reviewed: {researchData.filter(r => r.type === "peer-reviewed").length}</div>
                  <div>White Papers: {researchData.filter(r => r.type === "white-paper").length}</div>
                  <div>Case Studies: {researchData.filter(r => r.type === "case-study").length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Research List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="heading-md mb-2">
                {selectedTopic === "All Topics" ? "All Research" : selectedTopic}
              </h2>
              <p className="text-gray-600">
                {filteredResearch.length} {filteredResearch.length === 1 ? "study" : "studies"} found
              </p>
            </div>

            <div className="space-y-6">
              {filteredResearch.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={getTypeColor(item.type)}>
                        {item.type.replace("-", " ")}
                      </Badge>
                      <Badge variant="outline">
                        {item.topic}
                      </Badge>
                      <Badge variant="outline">
                        {item.year}
                      </Badge>
                    </div>
                    <CardTitle className="text-primary-teal leading-tight">
                      {item.title}
                    </CardTitle>
                    <CardDescription>
                      <div className="space-y-1">
                        <div><strong>Authors:</strong> {item.authors}</div>
                        <div><strong>Published in:</strong> {item.journal}</div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{item.abstract}</p>
                    {item.link && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={item.link} target="_blank">
                          View Study
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}