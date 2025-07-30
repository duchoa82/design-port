import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StatsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Remove grid, use single column for heading and cards */}
        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-light mb-8">
            My focus is simple<br />
            <span className="font-semibold">business to product</span>
          </h2>
          {/* 3 cards in a row, full width, ratio 1:1:2 */}
          <div className="flex flex-row gap-4 mb-8 w-full">
            <Card className="bg-card border-border h-[240px] flex flex-col justify-between p-6 flex-1">
              <p className="text-sm text-muted-foreground">
                Applying data-informed to improve the conversion rate of the landing page
              </p>
              <div>
                <div className="text-4xl font-bold text-foreground mb-1">
                  20<span className="text-lg">%</span>
                </div>
                <p className="text-xs text-muted-foreground">The users booked a demo</p>
              </div>
            </Card>
            <Card className="bg-card border-border h-[240px] flex flex-col justify-between p-6 flex-1">
              <p className="text-sm text-muted-foreground">
                Improved AI response quality from the user chat up to
              </p>
              <div>
                <div className="text-4xl font-bold text-foreground mb-1">
                  90<span className="text-lg">%</span>
                </div>
                <p className="text-xs text-muted-foreground">Correctly with contextual</p>
              </div>
            </Card>
            <Card className="bg-[#262626] text-white h-[240px] flex flex-col justify-between p-6 shadow-lg flex-[2]">
              <p className="text-sm text-white">
                Applied JTBD framework and user feedback to build a product from 0 to top-trending in 2 months
              </p>
              <div>
                <div className="text-4xl font-bold text-white mb-1">
                  <span className="text-base align-bottom">#</span>
                  1
                </div>
                <p className="text-xs text-white">Top-trending in category</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;