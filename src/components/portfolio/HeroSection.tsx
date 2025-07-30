import { useState } from "react";
import Header from '@/components/portfolio/Header';
import { useEffect } from "react";

// Add gentle floating and pop-in keyframes to the document head if not already present
if (typeof window !== 'undefined' && !document.getElementById('gentle-float-keyframes')) {
  const style = document.createElement('style');
  style.id = 'gentle-float-keyframes';
  style.innerHTML = `
    @keyframes gentleFloatCard {
      0% { transform: translateY(0) rotate(15deg); }
      50% { transform: translateY(-8px) rotate(15deg); }
      100% { transform: translateY(0) rotate(15deg); }
    }
    @keyframes gentleFloatCard2 {
      0% { transform: translateY(0) rotate(-10deg); }
      50% { transform: translateY(8px) rotate(-10deg); }
      100% { transform: translateY(0) rotate(-10deg); }
    }
    @keyframes gentlePopInCard1 {
      0% { opacity: 0; transform: translateY(30px) scale(1) rotate(15deg); }
      100% { opacity: 1; transform: translateY(0) scale(1) rotate(15deg); }
    }
    @keyframes gentlePopInCard2 {
      0% { opacity: 0; transform: translateY(30px) scale(1) rotate(-10deg); }
      100% { opacity: 1; transform: translateY(0) scale(1) rotate(-10deg); }
    }
  `;
  document.head.appendChild(style);
}

// Restore glassCardBase, card1BaseStyle, card2BaseStyle
const glassCardBase = {
  background: 'rgba(255, 255, 255, 0.06)',
  borderRadius: '16px',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(4.5px)',
  WebkitBackdropFilter: 'blur(4.5px)',
  border: '1px solid rgba(255, 255, 255, 0.43)',
  color: '#222',
  padding: '20px',
  width: '320px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  fontSize: 14,
  lineHeight: 1.6,
  position: 'absolute' as 'absolute',
  zIndex: 1,
  textAlign: 'left' as 'left',
  backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,208,171,0.10) 100%)',
  willChange: 'transform',
} as React.CSSProperties;

const card1BaseStyle = {
  ...glassCardBase,
  left: '-340px',
  top: '-40px',
  transform: 'rotate(15deg)',
  opacity: 0,
  animation: 'none',
};

const card2BaseStyle = {
  ...glassCardBase,
  left: '110px',
  top: '60px',
  transform: 'rotate(-10deg)',
  opacity: 0,
  animation: 'none',
};

const HeroSection = () => {
  const [hovered, setHovered] = useState(false);
  const [showCard1, setShowCard1] = useState(false);
  const [showCard2, setShowCard2] = useState(false);

  useEffect(() => {
    if (hovered) {
      setShowCard1(false);
      setShowCard2(false);
      setTimeout(() => setShowCard1(true), 60);
      setTimeout(() => setShowCard2(true), 360);
    } else {
      setShowCard1(false);
      setShowCard2(false);
    }
  }, [hovered]);

  return (
    <section className="bg-gradient-to-br from-portfolio-hero-from to-portfolio-hero-to text-foreground p-[80px]">
      <div className="container mx-auto px-6 text-center flex flex-col justify-center h-[400px]">
        <h1 className="text-4xl md:text-5xl font-light mb-4 flex items-center justify-center gap-2" style={{ position: 'relative', zIndex: 1 }}>
          <span className="inline-block">👋</span> Hello! I'm
          <span
            className="relative flex items-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
          >
            <img
              src="/ava/ava.png"
              alt="Hoà Trương"
              width={80}
              height={40}
              style={{
                borderRadius: 80,
                width: 80,
                height: 40,
                boxShadow: hovered ? '0 4px 24px rgba(96,165,250,0.25)' : 'none',
                transition: 'box-shadow 0.2s',
                objectFit: 'cover',
                margin: '0 8px',
                zIndex: 10,
              }}
            />
            {/* Card 1: pop in, then float gently */}
            {showCard1 && (
              <div
                style={{
                  ...card1BaseStyle,
                  opacity: 1,
                  animation: 'gentlePopInCard1 1s cubic-bezier(0.22, 1, 0.36, 1) forwards, gentleFloatCard 3.5s 1s ease-in-out infinite',
                }}
              >
                Experience in B2C start-ups and B2B SaaS, working across Scrum and Waterfall.
              </div>
            )}
            {/* Card 2: pop in after card 1, then float gently */}
            {showCard2 && (
              <div
                style={{
                  ...card2BaseStyle,
                  opacity: 1,
                  animation: 'gentlePopInCard2 1s cubic-bezier(0.22, 1, 0.36, 1) forwards, gentleFloatCard2 3.5s 1s ease-in-out infinite',
                }}
              >
                My strengths lie in Blockchain, Web3, and AI — with strong user empathy, team bonding, cross-functional collaboration, and process building.
              </div>
            )}
          </span>
          <span style={{ opacity: hovered ? 0.5 : 1, transition: 'opacity 0.2s' }}>Hoà Trương.</span>
        </h1>
        <div className="text-4xl md:text-5xl font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          <p>Product Owner driving impact on</p>
          <p>tech, users & business</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;