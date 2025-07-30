import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const topics = [
  {
    title: "Reduce bounce rate with Data-Informed.",
    description: "Apply Data-Informed to reduce the conversion rate for the book a demo page.",
    icon: "🔬",
  },
  {
    title: "Data Benchmarking for Smarter Product Decisions",
    description: "I rely on data to validate assumptions, compare performance, and guide product direction.",
    icon: "🧪",
  },
  {
    title: "Stakeholder Management & Agile Delivery Process",
    description: "I lead a full-cycle process from collecting multi-channel requirements to prioritized releases.",
    icon: "♻️",
  },
];

export default function TopicsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-light mb-8">
            Other <span className="font-semibold">Topics</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {topics.map((topic, index) => (
            <Card key={index} className="bg-card border border-border transition-shadow duration-200 hover:shadow-lg group cursor-pointer">
              <CardContent className="p-6 text-left">
                <h3 className="font-semibold text-foreground mb-4">{topic.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed line-clamp-4">
                  {topic.description}
                </p>
                <span className="text-xs text-primary uppercase tracking-wide font-medium cursor-pointer block mt-auto transition-colors duration-200 group-hover:text-blue-600 text-left">
                  Read more
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}