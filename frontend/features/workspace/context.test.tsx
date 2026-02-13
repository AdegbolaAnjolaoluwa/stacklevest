import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Shared handlers for testing
let subscribeHandler: Function | null = null;

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ 
    data: { user: { id: 'u1', email: 'test@test.com', name: 'Test User' } }, 
    status: 'authenticated' 
  })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock SocketClient instance
vi.mock('@/lib/websocket/socket', () => {
  return {
    socket: {
      connect: vi.fn(),
      subscribe: vi.fn((handler) => {
        subscribeHandler = handler;
        return vi.fn(); // unsubscribe
      }),
      emit: vi.fn(),
      disconnect: vi.fn(),
    }
  };
});

describe('WorkspaceProvider', () => {
  let WorkspaceProvider: any;
  let useWorkspace: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    subscribeHandler = null;
    
    // Dynamically import to ensure mocks are applied
    const module = await import('./context');
    WorkspaceProvider = module.WorkspaceProvider;
    useWorkspace = module.useWorkspace;
  });

  // Helper component to access context
  const TestComponent = () => {
    const { channels, messages, activeChannelId } = useWorkspace();
    return (
      <div>
        <div data-testid="active-channel">{activeChannelId}</div>
        <div data-testid="channel-count">{channels.length}</div>
        <div data-testid="message-count">{messages.length}</div>
        <div data-testid="unread-count">
          {channels.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0)}
        </div>
      </div>
    );
  };

  it('provides initial state', async () => {
    render(
      <WorkspaceProvider>
        <TestComponent />
      </WorkspaceProvider>
    );

    expect(screen.getByTestId('channel-count').textContent).toBe('0');
  });

  /*
  it('updates state when receiving history', async () => {
    render(
      <WorkspaceProvider>
        <TestComponent />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(subscribeHandler).not.toBeNull();
    });

    if (subscribeHandler) {
      subscribeHandler({ 
        type: 'history', 
        payload: [{ id: 'm1', content: 'Hello', senderId: 'u2', timestamp: new Date().toISOString() }] 
      });
    }

    await waitFor(() => {
      expect(screen.getByTestId('message-count').textContent).toBe('1');
    });
  });

  it('increments unread count for messages in other channels', async () => {
    render(
      <WorkspaceProvider>
        <TestComponent />
      </WorkspaceProvider>
    );

    await waitFor(() => {
      expect(subscribeHandler).not.toBeNull();
    });

    if (subscribeHandler) {
      // 1. Setup channels
      subscribeHandler({
        type: 'channels',
        payload: [
          { id: 'c1', name: 'General', type: 'public' },
          { id: 'c2', name: 'Random', type: 'public' }
        ]
      });
    }

    await waitFor(() => {
      expect(screen.getByTestId('active-channel').textContent).toBe('c1');
    });

    if (subscribeHandler) {
      // 2. Simulate message in c2 (not active)
      subscribeHandler({
        type: 'message',
        payload: {
          id: 'm2',
          content: 'New message in random',
          senderId: 'u2',
          channelId: 'c2',
          timestamp: new Date().toISOString(),
          user: { id: 'u2', name: 'Bob' }
        }
      });
    }

    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('1');
    });
  });
  */
});
