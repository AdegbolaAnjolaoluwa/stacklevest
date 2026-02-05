"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  channelName?: string;
}

export function DeleteChannelDialog({ open, onOpenChange, onConfirm, channelName }: DeleteChannelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#180e0e] border-[#3a1d1d] sm:max-w-[420px] p-0 overflow-hidden gap-0 shadow-2xl">
        <div className="flex flex-col items-center justify-center p-8 pb-6 text-center">
             {/* Icon */}
             <div className="w-12 h-12 rounded-xl bg-[#2a1212] flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-600" />
             </div>

             {/* Header */}
             <div className="space-y-3">
                 <h4 className="text-[10px] font-bold text-[#8a5e5e] uppercase tracking-widest">
                    Delete Channel Confirmation
                 </h4>
                 <DialogTitle className="text-xl font-bold text-white px-4">
                    Are you sure you want to delete <span className="text-red-500">#{channelName || "this channel"}</span>?
                 </DialogTitle>
                 <DialogDescription className="text-sm text-[#9ca3af] leading-relaxed px-2">
                    This action cannot be undone and the channel data, including messages and files, will be permanently removed from the workspace.
                 </DialogDescription>
             </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-8 pb-8 pt-2">
            <Button 
                variant="ghost" 
                className="flex-1 h-11 bg-[#27272a] hover:bg-[#3f3f46] text-white hover:text-white border-0 font-medium"
                onClick={() => onOpenChange(false)}
            >
                Cancel
            </Button>
            <Button 
                className="flex-1 h-11 bg-[#dc2626] hover:bg-[#b91c1c] text-white border-0 font-medium"
                onClick={() => {
                    onConfirm();
                    onOpenChange(false);
                }}
            >
                Delete Channel
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
