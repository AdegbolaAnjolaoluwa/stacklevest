import { useState } from "react";
import { Camera, Hash, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export function ProfileStep({ onNext, onPrev }: ProfileStepProps) {
  const [channels, setChannels] = useState(["engineering-main", "tech-strategy-roadmaps"]);

  const toggleChannel = (id: string) => {
    setChannels(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
           <div>
             <h2 className="text-2xl font-bold text-slate-900">Complete your professional profile</h2>
             <p className="text-slate-500 mt-1">Verify your details from HR and choose your initial communication channels.</p>
           </div>
           <div className="text-right">
             <div className="text-sm font-semibold text-slate-900">Step 2 of 3</div>
             <div className="text-xs text-blue-600 font-medium">45% COMPLETE</div>
           </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-12">
           {/* Photo Section */}
           <div className="col-span-1 flex flex-col items-center text-center">
             <div className="relative mb-4">
                <Avatar className="w-32 h-32 border-4 border-slate-50 shadow-inner">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
             </div>
             <p className="text-sm font-medium text-slate-900">Jordan D.</p>
             <p className="text-xs text-slate-500">Product Designer</p>
           </div>

           {/* Form Section */}
           <div className="col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <Label className="text-xs font-bold text-slate-500 uppercase">Official Job Title</Label>
                     <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Admin Set</span>
                   </div>
                   <Input defaultValue="Senior Product Designer" className="bg-slate-100 border-slate-200 text-slate-600" readOnly disabled />
                 </div>
                 <div className="space-y-2">
                   <Label className="text-xs font-bold text-slate-500 uppercase">Internal Extension</Label>
                   <Input defaultValue="893" className="bg-white border-slate-200" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <Label className="text-xs font-bold text-slate-500 uppercase">Reporting Manager</Label>
                     <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Admin Set</span>
                   </div>
                   <div className="flex items-center gap-2 p-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-600 cursor-not-allowed">
                      <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-[10px] font-bold text-purple-700">SJ</div>
                      Sarah Jenkins
                   </div>
                 </div>
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <Label className="text-xs font-bold text-slate-500 uppercase">Primary Department</Label>
                     <span className="text-[10px] text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Admin Set</span>
                   </div>
                   <Select defaultValue="product" disabled>
                     <SelectTrigger className="bg-slate-100 border-slate-200 text-slate-600">
                       <SelectValue placeholder="Select department" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="product">Product & Design</SelectItem>
                       <SelectItem value="engineering">Engineering</SelectItem>
                       <SelectItem value="marketing">Marketing</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>
           </div>
        </div>

        {/* Channels Section */}
        <div className="space-y-4 mb-10">
           <div className="flex justify-between items-center">
             <h3 className="text-sm font-bold text-slate-900">Join Department Channels</h3>
             <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">3 Suggested</span>
           </div>
           
           <div className="space-y-3">
             {[
               { id: "engineering-main", name: "Engineering-main", desc: "General development and tech stack discussions.", icon: "bg-blue-100 text-blue-600" },
               { id: "tech-strategy-roadmaps", name: "Tech-strategy-roadmaps", desc: "High-level goals, quarter planning, and vision.", icon: "bg-purple-100 text-purple-600" },
               { id: "operations-global", name: "Operations-global", desc: "Logistics, office updates, and internal tools.", icon: "bg-orange-100 text-orange-600" }
             ].map(channel => (
               <div 
                 key={channel.id} 
                 className={`flex items-center p-4 border rounded-xl transition-all ${
                   channels.includes(channel.id) ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
                 }`}
               >
                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${channel.icon}`}>
                   <Hash className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <h4 className="font-semibold text-slate-900 text-sm">{channel.name}</h4>
                   <p className="text-xs text-slate-500">{channel.desc}</p>
                 </div>
                 <Checkbox 
                   checked={channels.includes(channel.id)} 
                   onCheckedChange={() => toggleChannel(channel.id)}
                 />
               </div>
             ))}
           </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
           <Button variant="ghost" className="text-slate-500">Skip for now</Button>
           <div className="flex gap-3">
              <Button variant="outline" onClick={onPrev}>Previous</Button>
              <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">Next Step: Workspace Setup</Button>
           </div>
        </div>
      </div>
    </div>
  );
}
