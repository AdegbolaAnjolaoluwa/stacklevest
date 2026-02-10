import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
        <Shield className="w-4 h-4" />
        Generic Internal Workspace
      </div>

      <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
        Welcome to the Team,<br />
        <span className="text-blue-600">Jordan</span>
      </h1>

      <p className="text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed">
        Your secure portal for high-stakes task management and internal collaboration starts here. 
        Let's get you set up.
      </p>

      <Button 
        onClick={onNext}
        size="lg" 
        className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 rounded-xl"
      >
        Start Onboarding <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
}
