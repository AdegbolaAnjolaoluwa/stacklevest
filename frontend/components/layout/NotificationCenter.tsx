"use client";

import React from "react";
import { useWorkspace } from "@/features/workspace/context";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const { notifications, removeNotification } = useWorkspace();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            layout
            className={cn(
              "p-4 rounded-lg shadow-lg border flex gap-3 items-start bg-white",
              notification.type === "success" && "border-green-100 bg-green-50/50",
              notification.type === "error" && "border-red-100 bg-red-50/50",
              notification.type === "info" && "border-blue-100 bg-blue-50/50"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {notification.type === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {notification.type === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
              {notification.type === "info" && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900">{notification.title}</h4>
              <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
