"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Eye, FileText, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <Logo width={120} height={40} />
            <span className="ml-2 border-l pl-2 border-slate-200">Privacy</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => router.push('/login')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-slate-50 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            We are committed to protecting your personal data and ensuring transparency in how we handle your information.
          </p>
          <p className="text-sm text-slate-400">Last updated: February 5, 2026</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        {/* Introduction */}
        <section className="space-y-4">
          <p className="text-slate-600 leading-relaxed">
            At StackleVest, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </p>
        </section>

        {/* Information Collection */}
        <section className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">1. Information We Collect</h2>
              <p className="text-slate-600 leading-relaxed">
                We collect information that you provide directly to us when you register for an account, create or modify your profile, set preferences, sign up for or make purchases, or otherwise communicate with us. This information may include:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li><strong className="text-slate-900">Personal Identification:</strong> Name, email address, phone number.</li>
                <li><strong className="text-slate-900">Work Information:</strong> Job title, department, company name.</li>
                <li><strong className="text-slate-900">Content:</strong> Tasks, projects, comments, and files you upload.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Use of Information */}
        <section className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">2. How We Use Your Information</h2>
              <p className="text-slate-600 leading-relaxed">
                We use the information we collect to operate, maintain, and improve our services. Specifically, we use your data to:
              </p>
              <ul className="grid sm:grid-cols-2 gap-4 mt-2">
                {[
                  "Provide and maintain services",
                  "Process transactions",
                  "Send administrative information",
                  "Respond to support requests",
                  "Improve user experience",
                  "Ensure security and fraud prevention"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-600 text-sm bg-slate-50 p-3 rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4 text-green-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">3. Data Security</h2>
              <p className="text-slate-600 leading-relaxed">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-slate-50 rounded-2xl p-8 text-center space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Have questions about our privacy practices?</h3>
          <p className="text-slate-600">
            If you have any questions or concerns, please contact our Data Protection Officer.
          </p>
          <Button variant="outline" className="bg-white">
            Contact Support
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 bg-white">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; 2026 StackleVest Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
