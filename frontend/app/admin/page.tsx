"use client";

import { Users, CheckSquare, Activity, UserPlus, Shield, Hash, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWorkspace } from "@/features/workspace/context";

export default function AdminOverviewPage() {
  const { users, tasks, channels } = useWorkspace();

  const activeTasksCount = tasks.filter(t => t.status !== 'done').length;
  const totalMembersCount = users.length;
  const completedTasksCount = tasks.filter(t => t.status === 'done').length;

  // Derive recent activity from actual data
  const completedTasks = tasks
    .filter(t => t.status === 'done')
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    });

  const lastUser = users[users.length - 1];
  const lastChannel = channels[channels.length - 1];

  const activities = [
    // Welcome activity
    lastUser && {
      user: "System",
      action: "welcomed",
      target: lastUser.name,
      context: "to the workspace",
      time: "Recently",
      type: "Member",
      icon: UserPlus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    // Channel activity
    lastChannel && {
      user: "Admin",
      action: "created channel",
      target: `#${lastChannel.name}`,
      context: `(${lastChannel.type})`,
      time: "Recently",
      type: "Channel",
      icon: Hash,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    // Completed tasks activities
    ...completedTasks.map(task => {
      const assignee = users.find(u => task.assigneeIds.includes(u.id))?.name || "Someone";
      return {
        user: assignee,
        action: "completed task:",
        target: task.title.substring(0, 30) + (task.title.length > 30 ? "..." : ""),
        context: "successfully",
        time: task.completedAt ? new Date(task.completedAt).toLocaleString() : "Recently",
        type: "Task",
        icon: CheckCircle2,
        iconBg: "bg-green-100",
        iconColor: "text-green-600"
      };
    })
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Workspace Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time overview of your team's productivity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Members</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalMembersCount}</div>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center">
              Active users in workspace
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{activeTasksCount}</div>
            <p className="text-xs text-slate-500 font-medium mt-1 flex items-center">
              {completedTasksCount} completed tasks
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Status</CardTitle>
            <Activity className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">Healthy</div>
            <p className="text-xs text-slate-400 mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Recent Workspace Activity</h3>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.length > 0 ? activities.map((item: any, i) => (
              <div key={i} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100">
                    <span className="font-semibold">{item.user}</span> {item.action} <span className="font-semibold">{item.target}</span> {item.context}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                </div>
                <Badge variant="outline" className="text-xs font-normal text-slate-500 border-slate-200">
                  {item.type}
                </Badge>
              </div>
            )) : (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">
                No recent activity recorded.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
