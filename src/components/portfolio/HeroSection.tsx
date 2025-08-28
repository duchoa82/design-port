import Header from '@/components/portfolio/Header';

const HeroSection = () => {

  return (
    <>
      <section className="bg-background text-foreground p-[80px] relative overflow-hidden">
        {/* Glass layer */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
        
        <div className="container mx-auto px-6 text-center flex flex-col justify-center h-[400px] relative z-10">
          <h1 className="text-4xl md:text-5xl font-light mb-4 text-center" style={{ position: 'relative', zIndex: 1 }}>
            Hello! I'm Hoà Trương
          </h1>
          <div className="text-3xl md:text-4xl font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            <p>UX/Product designer - driving impact on</p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <div 
                className="px-6 py-3 text-2xl font-medium relative overflow-hidden"
                style={{ transform: 'rotate(10deg)' }}
              >
                <div className="absolute inset-0 bg-blue-50 rounded-full shadow-sm" style={{ inset: '15%' }} />
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full" style={{ backdropFilter: 'blur(12px)', borderRadius: '100px', border: '2px solid #dbeafe' }} />
                <span className="relative z-10 text-blue-500 font-medium">users</span>
              </div>
              <div 
                className="px-6 py-3 text-2xl font-medium relative overflow-hidden"
                style={{ transform: 'rotate(-5deg)' }}
              >
                <div className="absolute inset-0 bg-green-50 rounded-full shadow-sm" style={{ inset: '15%' }} />
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full" style={{ backdropFilter: 'blur(12px)', borderRadius: '100px', border: '2px solid #dcfce7' }} />
                <span className="relative z-10 text-green-500 font-medium">business</span>
              </div>
              <div 
                className="px-6 py-3 text-2xl font-medium relative overflow-hidden"
                style={{ transform: 'rotate(5deg)' }}
              >
                <div className="absolute inset-0 bg-yellow-50 rounded-full shadow-sm" style={{ inset: '15%' }} />
                <div className="absolute inset-0 bg-white/30 backdrop-blur-md rounded-full" style={{ backdropFilter: 'blur(12px)', borderRadius: '100px', border: '2px solid #fef3c7' }} />
                <span className="relative z-10 text-yellow-500 font-medium">data-driven</span>
              </div>
            </div>
          </div>
        </div>
      </section>



    </>
  );
};

export default HeroSection;