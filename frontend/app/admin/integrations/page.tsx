"use client";

import { Github, MessageSquare, Layout, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-500 mt-1">Manage external tools and services connected to your workspace.</p>
      </div>

      <div className="grid gap-4">
        {[
          { name: "GitHub", icon: Github, description: "Sync issues and pull requests", status: "Connected", color: "text-slate-900" },
          { name: "Slack", icon: MessageSquare, description: "Forward notifications to channels", status: "Connect", color: "text-purple-600" },
          { name: "Trello", icon: Layout, description: "Import boards and cards", status: "Connect", color: "text-blue-600" },
          { name: "Gmail", icon: Mail, description: "Send emails from your domain", status: "Connected", color: "text-red-600" }
        ].map((app) => (
          <div key={app.name} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-slate-50 ${app.color}`}>
                <app.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{app.name}</h3>
                <p className="text-sm text-slate-500">{app.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {app.status === "Connected" ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Connected</Badge>
              ) : (
                <Button variant="outline" size="sm">Connect</Button>
              )}
              <Switch checked={app.status === "Connected"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
