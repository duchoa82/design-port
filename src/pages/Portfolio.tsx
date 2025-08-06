import Header from "@/components/portfolio/Header";
import HeroSection from "@/components/portfolio/HeroSection";
import StatsSection from "@/components/portfolio/StatsSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import TopicsSection from "@/components/portfolio/TopicsSection";
import FooterSection from "@/components/portfolio/FooterSection";
import ChatWidget from "@/components/ChatWidget";
import RecruiterPlayground from "@/components/RecruiterPlayground";
import { Link } from "react-router-dom";

const Portfolio = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <ProjectsSection />
      {/* <TopicsSection /> */}
      <RecruiterPlayground />
      <FooterSection />
      <ChatWidget />
    </div>
  );
};

export default Portfolio;