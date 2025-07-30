import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold mb-4">Portfolio Showcase</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Choose a layout to view
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/portfolio')}>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Portfolio Page</h3>
              <p className="text-muted-foreground mb-6">
                Complete portfolio layout with 5 sections: Header, Hero, Stats, Projects, Topics & Footer
              </p>
              <Button className="w-full">View Portfolio</Button>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/blog/brand-positioning')}>
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4">Blog Post</h3>
              <p className="text-muted-foreground mb-6">
                Clean blog post layout with header navigation and detailed content
              </p>
              <Button className="w-full">View Blog Post</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
