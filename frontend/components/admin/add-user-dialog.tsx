"use client";

import { useState } from "react";
import { UserPlus, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdd?: (user: any) => void;
}

export function AddUserDialog({ open, onOpenChange, onUserAdd }: AddUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const newUser = {
      name: formData.get("fullName"),
      email: formData.get("email"),
      role: formData.get("role") || "MEMBER",
      department: formData.get("department"),
      status: "ACTIVE", // Default to active for now
      avatar: "",
    };

    if (onUserAdd) {
      await onUserAdd(newUser);
    }
    
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100">
          <DialogTitle className="text-xl">Create New User</DialogTitle>
          <DialogDescription>
            Add a new member to your StackleVest workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" placeholder="e.g. John Doe" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="name@company.com" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select name="department">
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select name="role" defaultValue="member">
                    <SelectTrigger>
                      <SelectValue placeholder="Assign a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="GUEST">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Send Invite Email</Label>
                  <p className="text-xs text-slate-500">Notify the user via email immediately.</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <div className="flex items-center h-5">
                  <input 
                    id="reset-password" 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    defaultChecked
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="reset-password" className="font-medium text-slate-900 block">Require Password Reset</label>
                  <p className="text-slate-500 text-xs">User must change password on their first login.</p>
                </div>
              </div>
            </div>

          </div>

          <DialogFooter className="p-6 pt-2 bg-slate-50/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-white">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-2" disabled={isLoading}>
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create & Invite
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
