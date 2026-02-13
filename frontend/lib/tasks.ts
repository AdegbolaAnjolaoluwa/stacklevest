import { Task, User } from "@/types";

export interface TaskFilters {
  searchQuery?: string;
  status?: string | string[];
  priority?: string | string[];
  assigneeId?: string;
}

/**
 * Filters a list of tasks based on various criteria
 */
export function filterTasks(tasks: Task[], filters: TaskFilters, users: User[] = []): Task[] {
  return tasks.filter(task => {
    // Search filter
    if (filters.searchQuery?.trim()) {
      const search = filters.searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(search);
      const matchesDesc = task.description?.toLowerCase().includes(search);
      
      // Search assignees if users list is provided
      const matchesAssignee = users.length > 0 && task.assigneeIds.some(id => {
        const user = users.find(u => u.id === id);
        return user?.name.toLowerCase().includes(search);
      });
      
      if (!matchesTitle && !matchesDesc && !matchesAssignee) return false;
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      if (Array.isArray(filters.status)) {
        if (!filters.status.includes(task.status)) return false;
      } else {
        if (task.status !== filters.status) return false;
      }
    }

    // Priority filter
    if (filters.priority && filters.priority !== "all") {
      if (Array.isArray(filters.priority)) {
        if (!filters.priority.includes(task.priority)) return false;
      } else {
        if (task.priority !== filters.priority) return false;
      }
    }

    // Assignee filter
    if (filters.assigneeId && !task.assigneeIds.includes(filters.assigneeId)) {
      return false;
    }

    return true;
  });
}

/**
 * Groups tasks by status
 */
export function groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((acc, task) => {
    const status = task.status || 'todo';
    if (!acc[status]) acc[status] = [];
    acc[status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
}

/**
 * Sorts tasks by priority (High -> Medium -> Low)
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder: Record<string, number> = {
    high: 0,
    medium: 1,
    low: 2
  };

  return [...tasks].sort((a, b) => {
    return (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
  });
}
