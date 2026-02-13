"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Monitor, 
  LogOut, 
  ChevronRight,
  Camera,
  Check
} from "lucide-react";
import { useWorkspace } from "@/features/workspace/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { currentUser, updateProfile } = useWorkspace();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "appearance" | "security">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Local state for form fields
  const [formData, setFormData] = useState({
    name: currentUser.name || "",
    jobTitle: currentUser.jobTitle || "",
    email: currentUser.email || "",
    department: currentUser.department || "",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ] as const;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
      {/* Header */}
      <div className="h-16 px-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        </div>
        <div className="flex items-center gap-3">
          {showSuccess && (
            <span className="text-sm font-medium text-green-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
              <Check className="w-4 h-4" />
              Changes saved
            </span>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 border-r border-slate-100 p-6 flex flex-col gap-1 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <div className="mt-auto pt-6 border-t border-slate-100">
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full">
          {activeTab === "profile" && (
            <div className="space-y-12 animate-in fade-in duration-300">
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Profile Information</h2>
                <div className="flex items-start gap-8">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-2 border-slate-100 ring-2 ring-white">
                      <AvatarImage src={currentUser?.avatar} />
                      <AvatarFallback className="text-2xl font-bold bg-slate-200 text-slate-600">
                        {currentUser?.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Full Name</Label>
                        <Input 
                          id="full-name" 
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input 
                          id="display-name" 
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="How others see you" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Input 
                          id="email" 
                          value={formData.email} 
                          disabled 
                          className="pl-10 bg-slate-50" 
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-[10px] text-slate-400">Email cannot be changed directly. Contact your administrator.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Work Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input 
                      id="title" 
                      value={formData.jobTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      placeholder="Product Designer" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      id="department" 
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Design" 
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Bio</h2>
                <div className="space-y-2">
                  <Label htmlFor="bio">Tell us about yourself</Label>
                  <textarea 
                    id="bio"
                    className="w-full min-h-[120px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Write a short bio..."
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  {[
                    { title: "Desktop Notifications", desc: "Receive alerts on your computer", default: true },
                    { title: "Email Notifications", desc: "Get a summary of missed activity", default: false },
                    { title: "Sound Effects", desc: "Play a sound for incoming messages", default: true },
                    { title: "Mention Alerts", desc: "Only notify me when I'm @mentioned", default: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 cursor-pointer">
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ml-1",
                          item.default ? "translate-x-5 bg-blue-600" : "translate-x-0"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Theme Settings</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', name: 'Light', icon: Palette, color: 'bg-white border-slate-200' },
                    { id: 'dark', name: 'Dark (Coming Soon)', icon: Monitor, color: 'bg-slate-900 border-slate-800 opacity-50' },
                    { id: 'system', name: 'System', icon: Monitor, color: 'bg-gradient-to-br from-white to-slate-200 border-slate-200' },
                  ].map((theme) => (
                    <button 
                      key={theme.id}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        theme.id === 'light' ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn("w-full h-24 rounded-lg border shadow-sm", theme.color)} />
                      <span className="text-sm font-semibold">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div className="p-6 rounded-xl border border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-900">Change Password</h3>
                    <div className="grid gap-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <Button variant="outline" className="w-fit">Update Password</Button>
                    </div>
                  </div>
                  <div className="p-6 rounded-xl border border-red-100 bg-red-50/50 space-y-4">
                    <h3 className="font-bold text-red-900">Danger Zone</h3>
                    <p className="text-sm text-red-700">Once you delete your account, there is no going back. Please be certain.</p>
                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700">Delete Account</Button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
