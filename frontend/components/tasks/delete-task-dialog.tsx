"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTaskDialog({ open, onOpenChange, onConfirm }: DeleteTaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-slate-200 sm:max-w-[420px] p-0 overflow-hidden gap-0 shadow-2xl">
        <div className="flex flex-col items-center justify-center p-8 pb-6 text-center">
             {/* Icon */}
             <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-600" />
             </div>

             {/* Header */}
             <div className="space-y-3">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Delete Task Confirmation
                 </h4>
                 <DialogTitle className="text-xl font-bold text-slate-900 px-4">
                    Are you sure you want to delete this task?
                 </DialogTitle>
                 <DialogDescription className="text-sm text-slate-500 leading-relaxed px-2">
                    This action cannot be undone and the task data, including comments and attachments, will be permanently removed from the workspace.
                 </DialogDescription>
             </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-8 pb-8 pt-2">
            <Button 
                variant="outline" 
                className="flex-1 h-11 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                onClick={() => onOpenChange(false)}
            >
                Cancel
            </Button>
            <Button 
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white border-0 font-medium"
                onClick={() => {
                    onConfirm();
                    onOpenChange(false);
                }}
            >
                Delete Task
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
