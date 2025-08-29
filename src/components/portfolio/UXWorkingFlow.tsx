import ProcessCard from "@/components/ui/process-card";

const UXWorkingFlow = () => {
  return (
    <section className="pt-16 sm:pt-20 md:pt-24 lg:pt-32 pb-12 sm:pb-16 md:pb-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-2">
            <span className="font-light">Working</span>{" "}
            <span className="font-bold">Process</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            An end-to-end approach: starting with user and market research, shaping solutions through design thinking and data insights, and validating with user testing.
          </p>
        </div>

        {/* Process Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto mt-12 sm:mt-16 md:mt-20 lg:mt-24">
          <ProcessCard
            number="01"
            title="Requirement Collection"
            description="Gather inputs from multiple sources, from **chats**, **direct discussions**, **Figma feedback**, and written feedback. Focus on identifying core needs and clarifying business goals."
            variant="info"
            rotation={-3}
          />
          
          <ProcessCard
            number="02"
            title="Market & User Research"
            description="**Market Research**<br>In-depth **competitor analysis** & benchmarking to map industry standards, trends, and detect market gaps.<br><br>**User Research**<br>**understand users' needs** & **behaviors** helps uncover their motivations, expectations, & pain points."
            variant="warning"
            rotation={1}
          />
          
          <ProcessCard
            number="03"
            title="Userflow, Journey, Wireframe & Codevibes"
            description="Spotting potential **friction points** and **hidden cases** early through **User Flows, Journeys, and Wireframes** helps align the team on structure and interactions from the very beginning.<br><br>**Codevibes** — an evolved form of wireframing — enabling the team to **see, click, & feel** the concept in action."
            variant="default"
            rotation={-1}
          />
          
          <ProcessCard
            number="04"
            title="Data Benchmark & Testing"
            description="Define a **Data Benchmarking** that aligns with both business goals and product goals before release.<br><br>• **Internal testing**: gather feedback from team<br>• **Stakeholder demo**: validate alignment with business<br>• **End-user observation**: getting user data for next version."
            variant="success"
            rotation={2}
          />
        </div>
      </div>
    </section>
  );
};

export default UXWorkingFlow;
