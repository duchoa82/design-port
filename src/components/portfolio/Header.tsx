import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";

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
    } ${lastScrollY > 100 ? 'fixed top-0 left-0 right-0 shadow-lg' : 'relative'} z-[99999999]`}>
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
          <div className="hidden md:flex items-center space-x-8 relative" style={{ zIndex: 99999999 }}>
            <div className="relative" ref={menuRef} style={{ zIndex: 99999999 }}>
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
              {open && (
                <div
                  id="projects-dropdown"
                  className="absolute top-full left-1/2 transform -translate-x-1/2 w-[600px] bg-card border border-border rounded-lg shadow-lg p-4 mt-2"
                  style={{ zIndex: 99999999 }}
                >
                  <div className="flex flex-row gap-4">
                    {projects.map((project, idx) => (
                      <Link
                        key={idx}
                        to={project.link}
                        className="flex-1 flex flex-col rounded-md hover:bg-muted transition-colors p-3 cursor-pointer group"
                        onClick={(e) => {
                          console.log('Link clicked for:', project.link);
                          console.log('Event:', e);
                          setOpen(false);
                          
                          // Fallback navigation if Link doesn't work
                          setTimeout(() => {
                            if (window.location.pathname !== project.link) {
                              console.log('Fallback navigation to:', project.link);
                              window.location.href = project.link;
                            }
                          }, 100);
                        }}
                      >
                        <div className="w-full h-24 rounded-[4px] overflow-hidden bg-muted flex items-center justify-center mb-3">
                          <img
                            src={project.img}
                            alt={project.name}
                            className="object-cover w-full h-full"
                            style={{ borderRadius: 4 }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <h3 className="font-semibold text-foreground mb-2 text-sm text-left leading-tight">{project.name}</h3>
                          <span className="text-xs text-primary uppercase tracking-wide font-medium cursor-pointer block transition-colors duration-200 group-hover:text-blue-600 text-left">
                            Read more
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button 
              className={`relative transition-colors ${
                activeSection === "profile" 
                  ? "text-foreground bg-primary/10 px-2 py-1 rounded-md" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/Hoa Truong - CV.pdf';
                link.download = 'Hoa Truong - CV.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download CV
              {activeSection === "profile" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
              )}
            </button>
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