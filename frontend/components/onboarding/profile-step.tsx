import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";

interface ProfileStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export function ProfileStep({ onNext, onPrev }: ProfileStepProps) {
  const { data: session } = useSession();

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
           <div>
             <h2 className="text-2xl font-bold text-slate-900">Verify your profile</h2>
             <p className="text-slate-500 mt-1">Please confirm your professional details set by your administrator.</p>
           </div>
           <div className="text-right">
             <div className="text-sm font-semibold text-slate-900">Step 2 of 3</div>
             <div className="text-xs text-blue-600 font-medium">45% COMPLETE</div>
           </div>
        </div>

        <div className="space-y-8 mb-12">
           <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
             <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-700 uppercase">
               {session?.user?.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900 capitalize">{session?.user?.name || "User"}</h3>
               <p className="text-sm text-slate-500">{session?.user?.email}</p>
             </div>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Official Job Title</Label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Admin Set</span>
                </div>
                <Input 
                  defaultValue={(session?.user as any)?.jobTitle || "Team Member"} 
                  className="bg-slate-50 border-slate-200 text-slate-600" 
                  readOnly 
                  disabled 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Department</Label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Admin Set</span>
                </div>
                <Input 
                  defaultValue={(session?.user as any)?.department || "General"} 
                  className="bg-slate-50 border-slate-200 text-slate-600" 
                  readOnly 
                  disabled 
                />
              </div>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Staff Number</Label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Admin Set</span>
                </div>
                <Input 
                  defaultValue={(session?.user as any)?.staffNumber || "N/A"} 
                  className="bg-slate-50 border-slate-200 text-slate-600" 
                  readOnly 
                  disabled 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Reporting Manager</Label>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Admin Set</span>
                </div>
                <Input 
                  defaultValue={(session?.user as any)?.reportingManager || "Workspace Admin"} 
                  className="bg-slate-50 border-slate-200 text-slate-600" 
                  readOnly 
                  disabled 
                />
              </div>
           </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
           <Button variant="ghost" className="text-slate-400" disabled>Skip for now</Button>
           <div className="flex gap-3">
              <Button variant="outline" onClick={onPrev}>Previous</Button>
              <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">Next Step: Workspace Setup</Button>
           </div>
        </div>
      </div>
    </div>
  );
}
