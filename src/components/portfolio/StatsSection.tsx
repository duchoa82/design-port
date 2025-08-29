import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StatsSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Remove grid, use single column for heading and cards */}
        <div className="w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light mb-6 sm:mb-8 text-center">
            My focus is simple<br />
            <span className="font-semibold">user & business to product</span>
          </h2>
          
          {/* 3 cards in a row, full width, ratio 1:1:2 */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-8 w-full">
            <Card className="bg-card border-border h-[200px] sm:h-[220px] md:h-[240px] flex flex-col justify-between p-4 sm:p-6 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Applying data-informed to improve the conversion rate of the landing page
              </p>
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                  20<span className="text-sm sm:text-lg">%</span>
                </div>
                <p className="text-xs text-muted-foreground">The users booked a demo</p>
              </div>
            </Card>
            
            <Card className="bg-card border-border h-[200px] sm:h-[220px] md:h-[240px] flex flex-col justify-between p-4 sm:p-6 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Improved AI response quality from the user chat up to
              </p>
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                  90<span className="text-sm sm:text-lg">%</span>
                </div>
                <p className="text-xs text-muted-foreground">Correctly with contextual</p>
              </div>
            </Card>
            
            <Card className="bg-[#262626] text-white h-[200px] sm:h-[220px] md:h-[240px] flex flex-col justify-between p-4 sm:p-6 shadow-lg flex-1 lg:flex-[2]">
              <p className="text-xs sm:text-sm text-white">
                Applied JTBD framework and user feedback to build a product from 0 to top-trending in 2 months
              </p>
              <div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                  <span className="text-xs sm:text-base align-bottom">#</span>
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