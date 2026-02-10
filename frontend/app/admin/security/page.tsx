"use client";

import { Shield, Key, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security Settings</h1>
        <p className="text-slate-500 mt-1">Configure authentication and security policies for your workspace.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Authentication Policy</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Two-Factor Authentication (2FA)</Label>
              <p className="text-sm text-slate-500">Require all users to enable 2FA</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
             <div className="space-y-0.5">
              <Label className="text-base">Single Sign-On (SSO)</Label>
              <p className="text-sm text-slate-500">Allow login via Google/GitHub only</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Key className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-slate-900">Password Requirements</h3>
          </div>

           <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Minimum Length</Label>
              <p className="text-sm text-slate-500">Enforce minimum 12 characters</p>
            </div>
            <Switch defaultChecked />
          </div>
           <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Password Expiration</Label>
              <p className="text-sm text-slate-500">Require reset every 90 days</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
}
