import { useState } from "react";
import { Shield, Lock, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SecurityStepProps {
  onFinish: () => void;
}

export function SecurityStep({ onFinish }: SecurityStepProps) {
  const [agreements, setAgreements] = useState({
    privacy: false,
    communication: false,
  });
  const [signature, setSignature] = useState("");

  const isComplete = agreements.privacy && agreements.communication && signature.length > 3;

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
             <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Security Briefing & Accountability</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            As a StackleVest staff member, you handle high-stakes proprietary data. Please review and formally acknowledge the protocols below.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
           <div className="space-y-6">
              <div>
                 <h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
                   <Lock className="w-4 h-4 text-blue-600" />
                   1. StackleVest Data Privacy Policy
                 </h3>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   Our zero-trust tolerance policy ensures that all proprietary data remains within encrypted StackleVest environments. 
                   Any unauthorized disclosure of client information, trade strategies, or internal intellectual property will result 
                   in immediate termination of employment and potential legal action under Section 4A of the Internal Security Act.
                 </p>
                 <p className="text-xs text-slate-500 leading-relaxed mt-2">
                   You are personally responsible for the security of your hardware and login credentials. Two-factor authentication (2FA) 
                   is mandatory for all access points. Sharing of credentials, even within the team, is strictly prohibited.
                 </p>
              </div>

              <div>
                 <h3 className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-2">
                   <FileText className="w-4 h-4 text-blue-600" />
                   2. Internal Communication Guidelines
                 </h3>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   All professional communications must take place through the official StackleVest encrypted channels.
                 </p>
              </div>
           </div>
        </div>

        <div className="space-y-4 mb-8">
           <div className="flex items-start gap-3">
             <Checkbox 
               id="privacy" 
               checked={agreements.privacy}
               onCheckedChange={(c) => setAgreements(prev => ({...prev, privacy: c as boolean}))}
             />
             <Label htmlFor="privacy" className="text-sm text-slate-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-1">
               I have read and understood the <span className="font-semibold text-slate-900">Data Privacy Policy</span> and agree to adhere to all zero-leak protocols.
             </Label>
           </div>
           
           <div className="flex items-start gap-3">
             <Checkbox 
               id="communication"
               checked={agreements.communication}
               onCheckedChange={(c) => setAgreements(prev => ({...prev, communication: c as boolean}))}
             />
             <Label htmlFor="communication" className="text-sm text-slate-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-1">
               I agree to use <span className="font-semibold text-slate-900">Official Internal Channels</span> for all business communications and understand the monitoring protocols.
             </Label>
           </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-100">
           <Label className="text-xs font-bold text-slate-500 uppercase">Digital Signature</Label>
           <div className="relative">
             <Input 
               placeholder="Type your full name to sign" 
               className="font-serif italic text-lg py-6"
               value={signature}
               onChange={(e) => setSignature(e.target.value)}
             />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
               ✍️
             </div>
           </div>
           <p className="text-[10px] text-slate-400">By typing your name, you are executing a legally binding electronic signature.</p>
        </div>

        <div className="mt-8 flex justify-end">
           <Button 
             size="lg" 
             onClick={onFinish}
             disabled={!isComplete}
             className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
           >
             Enter Workspace <ArrowRight className="ml-2 w-4 h-4" />
           </Button>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Security Support</span>
        <span>Download PDF Copy</span>
      </div>
    </div>
  );
}
