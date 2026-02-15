"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  MessageSquare,
  CheckSquare,
  Hash,
  User,
  Command as CommandIcon,
  X
} from "lucide-react";
import { Command } from "cmdk";
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { useWorkspace } from "@/features/workspace/context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const {
    messages,
    tasks,
    channels,
    users,
    setActiveView,
    setActiveChannel,
    setActiveDm,
    setSelectedTaskId,
    setHighlightedMessageId
  } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const onSelect = (type: 'message' | 'task' | 'channel' | 'user', id: string) => {
    setOpen(false);

    switch (type) {
      case 'channel':
        setActiveChannel(id);
        break;
      case 'user':
        setActiveDm(id);
        break;
      case 'task':
        setActiveView('tasks');
        setSelectedTaskId(id);
        break;
      case 'message':
        const message = messages.find(m => m.id === id);
        if (message) {
          if (message.channelId) {
            setActiveChannel(message.channelId);
          } else if (message.dmId) {
            setActiveDm(message.dmId);
          }
          setHighlightedMessageId(id);
        }
        break;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600 w-full max-w-[200px]"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-slate-400 dark:text-slate-500 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden border-none shadow-2xl sm:max-w-[550px]">
          <Command className="flex h-full w-full flex-col overflow-hidden rounded-md bg-white dark:bg-slate-900">
            <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3" cmdk-input-wrapper="">
              <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
              <Command.Input
                placeholder="Search messages, tasks, channels..."
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button onClick={() => setOpen(false)} className="ml-2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <Command.List className="max-h-[350px] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-6 text-center text-sm text-slate-500">
                No results found.
              </Command.Empty>

              {channels.length > 0 && (
                <Command.Group heading="Channels" className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {channels.map((channel) => (
                    <Command.Item
                      key={channel.id}
                      onSelect={() => onSelect('channel', channel.id)}
                      className="flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2"
                    >
                      <Hash className="h-4 w-4 text-slate-400" />
                      <span>{channel.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {tasks.length > 0 && (
                <Command.Group heading="Tasks" className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {tasks.map((task) => (
                    <Command.Item
                      key={task.id}
                      onSelect={() => onSelect('task', task.id)}
                      className="flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2"
                    >
                      <CheckSquare className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                        <span>{task.title}</span>
                        <span className="text-[10px] text-slate-400">{task.status}</span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {messages.length > 0 && (
                <Command.Group heading="Messages" className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {messages.map((msg) => (
                    <Command.Item
                      key={msg.id}
                      onSelect={() => onSelect('message', msg.id)}
                      className="flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2"
                    >
                      <MessageSquare className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate">{msg.content}</span>
                        <span className="text-[10px] text-slate-400">
                          {users.find(u => u.id === msg.senderId)?.name}
                        </span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {users.length > 0 && (
                <Command.Group heading="People" className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {users.map((user) => (
                    <Command.Item
                      key={user.id}
                      onSelect={() => onSelect('user', user.id)}
                      className="flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 aria-selected:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 gap-2"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>{user.name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>

            <div className="flex items-center border-t border-slate-100 dark:border-slate-800 px-4 py-2 text-[10px] text-slate-400">
              <div className="flex items-center gap-1.5 mr-4">
                <kbd className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-slate-500 dark:text-slate-400">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5 mr-4">
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-500">Enter</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-500">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
