import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const BlogHeader = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>10-Jan-2023</span>
            <span>•</span>
            <span>Marketing</span>
            <span>•</span>
            <span>5 min</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BlogHeader;