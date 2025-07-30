import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { createPortal } from "react-dom";

const projects = [
  {
    name: "Applying Blockchain in Counterfeit Prevention Ideations",
    img: "/projects/project-card1.png",
    link: "/project/1",
  },
  {
    name: "How I Built 6 AI Agents in 3 Months",
    img: "/projects/project-card2.png",
    link: "/project/2",
  },
  {
    name: "Data-inform to decrease the delay in delivery order",
    img: "/projects/project-card3.png",
    link: "/project/3",
  },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Track active section and handle floating header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = currentScrollY + 100;

      // Handle floating header logic
      if (currentScrollY > 100) { // Only start floating after scrolling down 100px
        if (currentScrollY < lastScrollY) {
          // Scrolling up - show header
          setIsVisible(true);
        } else {
          // Scrolling down - hide header
          setIsVisible(false);
        }
      } else {
        // At top - always show header
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);

      // Track active section
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = (section as HTMLElement).offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          setActiveSection(sectionId || "home");
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`bg-card border-b border-border transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } ${lastScrollY > 100 ? 'fixed top-0 left-0 right-0 z-[9999999] shadow-lg' : 'relative'}`}>
      <div className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link to="/portfolio" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="Portfolio Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-semibold text-foreground">
              Portfolio
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8 relative">
            <div className="relative" ref={menuRef}>
              <button
                className={`relative transition-colors cursor-pointer select-none px-2 py-1 rounded-md focus:outline-none ${
                  activeSection === "projects" 
                    ? "text-foreground bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="projects-dropdown"
              >
                Projects
                {activeSection === "projects" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
              {open && createPortal(
                <div
                  id="projects-dropdown"
                  className="fixed top-20 left-1/2 transform -translate-x-1/2 w-80 bg-card border border-border rounded-lg shadow-lg z-[9999999] flex flex-col gap-2 p-4"
                  style={{ zIndex: 9999999 }}
                >
                  {projects.map((project, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 rounded-md hover:bg-muted transition-colors p-2 cursor-pointer"
                      onClick={() => {
                        setOpen(false);
                        navigate(project.link);
                      }}
                    >
                      <img
                        src={project.img}
                        alt={project.name}
                        className="w-14 h-14 object-cover rounded-md border border-border bg-muted"
                      />
                      <span className="text-base text-foreground font-medium">{project.name}</span>
                    </div>
                  ))}
                </div>,
                document.body
              )}
            </div>
            <Link 
              to="/profile" 
              className={`relative transition-colors ${
                activeSection === "profile" 
                  ? "text-foreground bg-primary/10 px-2 py-1 rounded-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Profile
              {activeSection === "profile" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </Link>
          </div>
          <Button 
            variant="default" 
            className="relative bg-white/10 backdrop-blur-md text-black font-medium px-6 py-2.5 rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20 group overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
            onClick={() => {
              const recruiterSection = document.querySelector('[data-section="recruiter-playground"]');
              if (recruiterSection) {
                recruiterSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-300/40 via-purple-300/40 to-blue-300/40 rounded-xl"></div>
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 fill-current" style={{ animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              Play with My AI Brain
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl"></div>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;