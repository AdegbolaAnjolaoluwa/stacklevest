import { describe, it, expect } from 'vitest';
import { filterTasks, groupTasksByStatus, sortTasksByPriority } from './tasks';
import { Task, User } from '@/types';

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', status: 'todo', priority: 'high', assigneeIds: ['u1'], dueDate: '2024-12-31' },
  { id: '2', title: 'Task 2', description: 'Special task', status: 'in_progress', priority: 'medium', assigneeIds: ['u2'], dueDate: '2024-12-31' },
  { id: '3', title: 'Third Task', status: 'done', priority: 'low', assigneeIds: ['u1', 'u2'], dueDate: '2024-12-31' },
];

const mockUsers: User[] = [
  { id: 'u1', name: 'Alice', email: 'alice@test.com', status: 'online' },
  { id: 'u2', name: 'Bob', email: 'bob@test.com', status: 'offline' },
];

describe('Task Helpers', () => {
  describe('filterTasks', () => {
    it('filters by search query (title)', () => {
      const result = filterTasks(mockTasks, { searchQuery: 'Task 1' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('filters by search query (description)', () => {
      const result = filterTasks(mockTasks, { searchQuery: 'Special' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('filters by status', () => {
      const result = filterTasks(mockTasks, { status: 'todo' });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('todo');
    });

    it('filters by multiple statuses', () => {
      const result = filterTasks(mockTasks, { status: ['todo', 'in_progress'] });
      expect(result).toHaveLength(2);
    });

    it('filters by priority', () => {
      const result = filterTasks(mockTasks, { priority: 'high' });
      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('high');
    });

    it('filters by assignee', () => {
      const result = filterTasks(mockTasks, { assigneeId: 'u2' });
      expect(result).toHaveLength(2); // Task 2 and 3
    });

    it('filters by assignee name when users are provided', () => {
      const result = filterTasks(mockTasks, { searchQuery: 'Alice' }, mockUsers);
      expect(result).toHaveLength(2); // Task 1 and 3 are assigned to Alice
    });
  });

  describe('groupTasksByStatus', () => {
    it('groups tasks correctly', () => {
      const result = groupTasksByStatus(mockTasks);
      expect(result.todo).toHaveLength(1);
      expect(result.in_progress).toHaveLength(1);
      expect(result.done).toHaveLength(1);
    });
  });

  describe('sortTasksByPriority', () => {
    it('sorts tasks high to low', () => {
      const result = sortTasksByPriority(mockTasks);
      expect(result[0].priority).toBe('high');
      expect(result[1].priority).toBe('medium');
      expect(result[2].priority).toBe('low');
    });
  });
});
