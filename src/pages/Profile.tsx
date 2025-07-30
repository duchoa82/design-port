import React from "react";
import { Download } from "lucide-react";
import Header from "@/components/portfolio/Header";
import FooterSection from "@/components/portfolio/FooterSection";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Trương Đức Hoà
              </h1>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = '/Hoa Truong - CV.pdf';
                  link.download = 'Hoa Truong - CV.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CV
              </button>
            </div>
            <p className="text-xl text-muted-foreground font-medium mb-4">
              Product Owner
            </p>
          </div>

        {/* Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Summary</h2>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <p>
              I have over 3 years of experience in digital product development, especially in emerging domains like Web3 and AI. With a background in UX/Product Design, I specialize in uncovering user insights and turning ideas into real, functional products.
            </p>
            <p>
              I independently built 4 Web3 products within 6 months and developed 8 AI agents—including streamed content and chatbots—in just 3 months. I'm comfortable working in fast-paced, lean startup environments with a strong focus on building from 0 to 1.
            </p>
          </div>
        </div>

        {/* Core Skills */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Core Skills</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Product Delivery & Leadership</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Agile & scrum methodologies
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Cross-functional team leadership
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Partnership & ecosystem building
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Product, Strategy & Data</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Product analysis - JTBD, Design Thinking
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Customer feedback analysis system
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Competitive analysis
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Data-driven, Data-informed analysis
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  User research
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">AI / AI-Agent</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Conversational AI-agent design
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  AI-API integration, workflow document
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Prompt engineering
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Embedding + Vector DB (e.g. Pinecone)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Chatbot deployment & UX
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Blockchain & Web3</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Web3 On-chain/Off-chain integration
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  B2B Wallet UX & Onboarding
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Web3 trading, investment workflow
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Enterprise-grade blockchain network
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Experiences */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Experiences</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-foreground">Product Owner - STVble</h3>
                <a 
                  href="https://stvbleglobal.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Website
                </a>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Aug 2024 - Feb 2025</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Digitalized 100% B2B trading & investment platforms, reducing 70% cognitive load for internal traders
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Led 10-person cross-functional team, delivered 4 product releases on time and within scope
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Built stakeholder request collection flow to maintain 100% planning accuracy
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-foreground">Business Analyst cum Designer - Joblogic</h3>
                <a 
                  href="https://www.joblogic.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Website
                </a>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Aug 2022 - Mar 2024</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Improved booking flow conversion rate by ~10–15%
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Simplified Information Architecture for better UX
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Created B2B product data benchmarks, saving 3 days per tracking setup
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Conducted team training on IA, data, JTBD for 100% team readiness
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="text-lg font-semibold text-foreground">Business Analyst cum Designer - VNG</h3>
                <a 
                  href="https://id.zing.vn/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Main Products VND ID
                </a>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Jun 2021 - Jun 2022</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Improved cross-team communication by 90%
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Created 100% transparent scope via feedback collection system
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Maintained up-to-date documentation for all product releases
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Other Experiences */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Other Experiences</h2>
          <div className="border-l-4 border-primary pl-6">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Product Owner for AI/AI-Agent (Promer Product Description SEO Audit, 3 months contractor)
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Built 6 AI agents and 4 AI chatbots from scratch
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Enhanced AI response quality by 90%
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                Saved 90% of team effort by creating an AI collaboration workflow
              </li>
            </ul>
          </div>
        </div>

        {/* Education */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Education</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              2011 - 2015 | Bachelor of Environmental Science, University of Science – VNU HCMC
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              2015 - 2016 | UX/UI Design Course, DPI
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              2019 | UX & Product Design Course, Coder School
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
              2023 - 2025 | Job-to-be-done, Technical for PM, Product School
            </li>
          </ul>
        </div>

        {/* Additional */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Additional</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Languages:</span> English (conversational, documental), Chinese (updating)
            </p>
            <p className="leading-relaxed">
              <span className="font-semibold text-foreground">Career Goal:</span> Become a leading builder of impactful products that combine emerging technologies — especially blockchain and AI — to solve pressing problems like fraud prevention, anti-counterfeiting, and task automation. I thrive in "play to win" environments and embrace a fail fast, learn fast mindset to push ideas from concept to real-world impact.
            </p>
          </div>
        </div>
      </div>
      </section>
      <FooterSection />
    </div>
  );
} 