import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const FooterSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-left">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Connecting With Me
          </h3>
          <p className="text-muted-foreground max-w-md mb-6">
            If you've scrolled this far, maybe it's time we talked.
          </p>
          
          {/* Contact Information */}
          <div className="mb-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm text-primary">
                  duchoa201093@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Phone:</span>
                <span className="text-sm text-primary">
                  (084) 939-639-831
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">LinkedIn:</span>
                <a 
                  href="https://www.linkedin.com/in/hoatruong1993/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 hover:text-blue-600 focus:outline-none shadow-none"
                >
                  @hoatruong1993
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterSection;