"use client";

import { Users, CheckSquare, Activity, UserPlus, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Workspace Analytics</h1>
        <p className="text-slate-500 mt-1">An overview of your team's productivity and resource usage.</p>
      </div>

      {/* Stats Cards - Removed Storage/Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Members</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">1,284</div>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
              +12% <span className="text-slate-400 ml-1 font-normal">vs. last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">452</div>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
              +5% <span className="text-slate-400 ml-1 font-normal">completion rate</span>
            </p>
          </CardContent>
        </Card>

        {/* Placeholder for future metric if needed, or keeping layout balanced */}
        <Card className="shadow-sm border-slate-200 bg-slate-50/50">
           <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">System Status</CardTitle>
            <Activity className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">Healthy</div>
             <p className="text-xs text-slate-400 mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Recent Admin Activity</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All Log</button>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            {
              user: "Alex Rivera",
              action: "added",
              target: "Jordan Smith",
              context: "to #marketing-strategy",
              time: "Today at 11:42 AM",
              type: "Member",
              icon: UserPlus,
              iconBg: "bg-blue-100",
              iconColor: "text-blue-600"
            },
            {
              user: "Security System",
              action: "policy updated:",
              target: "Mandatory 2FA",
              context: "enabled for all Admin accounts",
              time: "Today at 9:15 AM",
              type: "Critical",
              icon: Shield,
              iconBg: "bg-purple-100",
              iconColor: "text-purple-600"
            },
            {
              user: "Sarah Chen",
              action: "integration connected:",
              target: "GitHub Enterprise",
              context: "",
              time: "Yesterday at 4:30 PM",
              type: "App",
              icon: Activity,
              iconBg: "bg-green-100",
              iconColor: "text-green-600"
            }
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                <item.icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900">
                  <span className="font-semibold">{item.user}</span> {item.action} <span className="font-semibold">{item.target}</span> {item.context}
                </p>
                <p className="text-xs text-slate-500 mt-1">{item.time}</p>
              </div>
              <Badge variant="outline" className="text-xs font-normal text-slate-500 border-slate-200">
                {item.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
