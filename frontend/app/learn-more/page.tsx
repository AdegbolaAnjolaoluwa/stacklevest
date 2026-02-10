"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { 
  MessageSquare, 
  Hash, 
  CheckSquare, 
  Shield, 
  Zap, 
  ArrowRight,
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="font-bold text-xl text-slate-900 flex items-center gap-2">
              <Logo width={140} height={40} />
            </Link>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
                  Where work <span className="text-blue-600">flows</span> naturally.
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  StackleVest brings your team's communication, tasks, and tools together in one place. 
                  Say goodbye to context switching and hello to productivity.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/login">
                    <Button size="lg" className="h-12 px-8 text-lg">
                      Start for free <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to sync</h2>
              <p className="text-slate-600">Powerful features designed for modern teams who want to move fast and stay aligned.</p>
            </div>

            <div className="space-y-24">
              {/* Communication Section */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <Hash className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Organized Channels</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Keep conversations focused by topic, project, or team. Public channels for transparency, private ones for sensitive discussions.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Direct Messages</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Secure 1:1 conversations for quick syncs. Share files, code snippets, and ideas instantly.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
                  <div className="space-y-6 relative z-10">
                     {/* Message 1 */}
                     <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">DS</div>
                       <div className="space-y-1 flex-1">
                         <div className="flex items-center gap-2">
                           <span className="text-sm font-semibold text-slate-900">David Stackle</span>
                           <span className="text-xs text-slate-400">10:42 AM</span>
                         </div>
                         <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                           Hey team, just pushed the latest updates to the main branch. Let me know if you see any issues! 🚀
                         </div>
                       </div>
                     </div>
                     {/* Message 2 */}
                     <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">KM</div>
                       <div className="space-y-1 flex-1">
                         <div className="flex items-center gap-2">
                           <span className="text-sm font-semibold text-slate-900">Karen Marketing</span>
                           <span className="text-xs text-slate-400">10:45 AM</span>
                         </div>
                         <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-900">
                           Awesome! I'll take a look at the new landing page designs now.
                         </div>
                       </div>
                     </div>
                  </div>
                  {/* Decorative blur */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                </div>
              </div>

              {/* Productivity Section */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
                   <div className="flex gap-4 mb-4 relative z-10">
                      {/* Column 1 */}
                      <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-400" />
                          <span className="text-xs font-semibold text-slate-500 uppercase">To Do</span>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm border border-slate-100 mb-2">
                          <div className="h-1.5 w-8 bg-red-100 rounded-full mb-2" />
                          <p className="text-xs font-medium text-slate-700 mb-2">Q4 Financial Review</p>
                          <div className="flex items-center justify-between">
                            <div className="w-5 h-5 rounded-full bg-slate-100" />
                            <div className="h-1 w-8 bg-slate-100 rounded" />
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm border border-slate-100 opacity-60">
                           <div className="h-1.5 w-8 bg-green-100 rounded-full mb-2" />
                           <div className="h-2 w-16 bg-slate-100 rounded mb-2" />
                        </div>
                      </div>
                      {/* Column 2 */}
                      <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-xs font-semibold text-slate-500 uppercase">In Progress</span>
                        </div>
                        <div className="bg-white p-3 rounded shadow-sm border border-slate-100">
                          <div className="h-1.5 w-8 bg-blue-100 rounded-full mb-2" />
                          <p className="text-xs font-medium text-slate-700 mb-2">Update Homepage</p>
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-1">
                               <div className="w-5 h-5 rounded-full bg-blue-100 border-2 border-white" />
                               <div className="w-5 h-5 rounded-full bg-purple-100 border-2 border-white" />
                            </div>
                            <div className="text-[10px] text-slate-400">Due Today</div>
                          </div>
                        </div>
                      </div>
                   </div>
                   {/* Decorative blur */}
                   <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                </div>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <CheckSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Integrated Task Board</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Don't let ideas get lost in chat. Turn messages into tasks and manage them on a built-in Kanban board without leaving the app.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Real-time Sync</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Everything updates instantly across all your devices. See typing indicators, online status, and task movements in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Management Section */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Admin Controls</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Manage your workspace with confidence. Control user roles, invite members, and oversee channel access from a dedicated admin console.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Unified Dashboard</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Get a bird's eye view of your organization. Monitor activity, track project progress, and manage your team from one central hub.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">
                  <div className="space-y-4 relative z-10">
                     <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <h4 className="font-bold text-slate-900">Team Members</h4>
                        <div className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md font-medium">Add Member</div>
                     </div>
                     <div className="space-y-3">
                        {/* Member 1 */}
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">JL</div>
                              <div>
                                 <div className="text-sm font-semibold text-slate-900">Jenny Lee</div>
                                 <div className="text-xs text-slate-500">Product Manager</div>
                              </div>
                           </div>
                           <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Active</span>
                        </div>
                        {/* Member 2 */}
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">MR</div>
                              <div>
                                 <div className="text-sm font-semibold text-slate-900">Mark Ross</div>
                                 <div className="text-xs text-slate-500">Engineering</div>
                              </div>
                           </div>
                           <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full">Offline</span>
                        </div>
                        {/* Member 3 */}
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold text-pink-700">AS</div>
                              <div>
                                 <div className="text-sm font-semibold text-slate-900">Alex Smith</div>
                                 <div className="text-xs text-slate-500">Design Lead</div>
                              </div>
                           </div>
                           <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-full">Admin</span>
                        </div>
                     </div>
                  </div>
                  {/* Decorative blur */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-slate-300 text-lg mb-8">
              Join thousands of teams using StackleVest to communicate better.
            </p>
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 border-none">
                Create your workspace
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-slate-500 text-sm">
          <p>© 2026 StackleVest Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-900">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
