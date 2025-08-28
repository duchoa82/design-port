import React from 'react';
import ProcessCard from '@/components/ui/process-card';

const ProcessCardDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Process Card Demo
        </h1>
        
        <div className="flex justify-center mb-12">
          <ProcessCard
            number="01"
            title="Hero Section"
            description="Address a key problem directly in the headline. Add a video/ demo for instant engagement"
            variant="default"
          />
        </div>

        {/* Different variants showcase */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Color Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProcessCard
              number="01"
              title="Default"
              description="Default orange theme for general process steps"
              variant="default"
            />
            
            <ProcessCard
              number="02"
              title="Success"
              description="Green theme for completed or successful steps"
              variant="success"
            />
            
            <ProcessCard
              number="03"
              title="Warning"
              description="Yellow theme for important or attention steps"
              variant="warning"
            />
            
            <ProcessCard
              number="04"
              title="Info"
              description="Blue theme for informational or learning steps"
              variant="info"
            />
          </div>
        </div>

        {/* Process workflow example */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Process Workflow Example</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProcessCard
              number="01"
              title="Discovery"
              description="Research user needs, market analysis, and technical feasibility"
              variant="info"
            />
            
            <ProcessCard
              number="02"
              title="Design"
              description="Create wireframes, prototypes, and user interface designs"
              variant="warning"
            />
            
            <ProcessCard
              number="03"
              title="Development"
              description="Build the product with clean, maintainable code"
              variant="default"
            />
            
            <ProcessCard
              number="04"
              title="Testing"
              description="Quality assurance and user acceptance testing"
              variant="warning"
            />
            
            <ProcessCard
              number="05"
              title="Launch"
              description="Deploy to production and monitor performance"
              variant="success"
            />
            
            <ProcessCard
              number="06"
              title="Iterate"
              description="Collect feedback and continuously improve"
              variant="info"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessCardDemo;
