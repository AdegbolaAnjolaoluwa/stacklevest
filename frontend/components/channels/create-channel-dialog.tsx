"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "@/features/workspace/context";
import { Lock, Hash, Bold, Italic, List, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChannelDialog({ open, onOpenChange }: CreateChannelDialogProps) {
  const { createChannel } = useWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "private">("public");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createChannel(name, description, type);
    
    // Reset and close
    setName("");
    setDescription("");
    setType("public");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900">
            Create a channel
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Name</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <Input
                  id="name"
                  placeholder="e.g. plan-budget"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="pl-9"
                  maxLength={80}
                />
              </div>
              <p className="text-xs text-slate-500">
                Channels are where your team communicates. They&apos;re best when organized around a topic — #marketing, for example.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <div className="border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2">
                <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="What&apos;s this channel about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-0 rounded-none focus-visible:ring-0 min-h-[120px] resize-none p-3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Visibility</Label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={cn(
                    "relative flex flex-col gap-1 p-3 border rounded-lg cursor-pointer transition-all",
                    type === "public" 
                      ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" 
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                  onClick={() => setType("public")}
                >
                  <div className="flex items-center gap-2">
                    <Hash className={cn("w-4 h-4", type === "public" ? "text-blue-600" : "text-slate-500")} />
                    <span className={cn("font-medium text-sm", type === "public" ? "text-blue-900" : "text-slate-900")}>Public</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    Anyone in the workspace can view and join this channel.
                  </p>
                </div>

                <div 
                  className={cn(
                    "relative flex flex-col gap-1 p-3 border rounded-lg cursor-pointer transition-all",
                    type === "private" 
                      ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" 
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                  onClick={() => setType("private")}
                >
                  <div className="flex items-center gap-2">
                    <Lock className={cn("w-4 h-4", type === "private" ? "text-blue-600" : "text-slate-500")} />
                    <span className={cn("font-medium text-sm", type === "private" ? "text-blue-900" : "text-slate-900")}>Private</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    Only people invited can view and join this channel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 px-8">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!name.trim()}
            >
              Create Channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
