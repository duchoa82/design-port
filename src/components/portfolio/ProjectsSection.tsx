import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const projects = [
  {
    title: "Applying Blockchain in Counterfeit Prevention Ideations",
    description: "Blockchain is being used to combat counterfeiting in Vietnam, which prompted me to take the time to research it further.. ",
    category: "Read more",
    icon: "/projects/project-card1.png",
  },
  {
    title: "How I Built 6 AI Agents in 3 Months",
    description: "Over 3 months, I led my teams and launched 6 AI agents specifically for Shopify merchants.",
    category: "Read more", 
    icon: "/projects/project-card2.png",
  },
  {
    title: "Data-inform to decrease the delay in delivery order",
    description: "This is how I analyst the data, making the solution and suggest to have the better solution by using AI in logistic",
    category: "Read more",
    icon: "/projects/project-card3.png",
  },
  {
    title: "Trend tracking",
    description: "Real-time alerts on trending topics to stay relevant",
    category: "Read more",
    icon: "/placeholder.svg",
  },
  {
    title: "Trend tracking",
    description: "Real-time alerts on trending topics to stay relevant", 
    category: "Read more",
    icon: "/placeholder.svg",
  },
  {
    title: "Trend tracking",
    description: "Real-time alerts on trending topics to stay relevant",
    category: "Read more",
    icon: "/placeholder.svg",
  },
];

export default function ProjectsSection() {
  // Use only the first 3 projects for the full-width row
  const rowProjects = projects.slice(0, 3);

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 sm:mb-8 text-center sm:text-left">
            Selected <span className="font-semibold">Projects</span>
          </h2>
        </div>
        
        {/* Full width flex row with responsive layout */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 w-full">
          {rowProjects.map((project, index) => (
            <Link
              key={index}
              to={`/project/${index + 1}`}
              className={
                (index === 0
                  ? "h-[300px] sm:h-[350px] md:h-[400px] rounded-[8px] border border-border bg-portfolio-project-card transition-all duration-200 cursor-pointer flex flex-col flex-1 lg:flex-[2] p-3 sm:p-4 hover:shadow-[0_4px_24px_rgba(96,165,250,0.25)] hover:scale-[1.02] hover:border-primary/50"
                  : "h-[300px] sm:h-[350px] md:h-[400px] rounded-[8px] border border-border bg-portfolio-project-card transition-all duration-200 cursor-pointer flex flex-col flex-1 lg:flex-[1.5] p-3 sm:p-4 hover:shadow-[0_4px_24px_rgba(96,165,250,0.25)] hover:scale-[1.02] hover:border-primary/50") +
                " group block"
              }
            >
              <div className="w-full h-[180px] sm:h-[220px] md:h-[270px] rounded-[4px] overflow-hidden bg-muted flex items-center justify-center mb-3 sm:mb-4">
                <img
                  src={project.icon}
                  alt={project.title}
                  className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                  style={{ borderRadius: 8 }}
                />
              </div>
              <div className="flex-1 flex flex-col justify-between w-full text-left">
                <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base text-left leading-tight group-hover:text-primary transition-colors duration-200">{project.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 text-left leading-relaxed">{project.description}</p>
                <span className="text-xs text-primary uppercase tracking-wide font-medium block transition-colors duration-200 group-hover:text-blue-600 text-left">
                  {project.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}