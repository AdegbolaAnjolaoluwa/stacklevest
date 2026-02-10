import { io, Socket } from "socket.io-client";

type MessageHandler = (data: unknown) => void;

export class SocketClient {
  private socket: Socket | null = null;
  private url: string;
  private handlers: Set<MessageHandler> = new Set();

  constructor(url: string) {
    this.url = url;
  }

  connect(auth?: { email: string }) {
    if (this.socket?.connected) {
        // If auth provided and differs from current, disconnect and reconnect
        // Note: io.socket.auth isn't directly accessible in all versions, 
        // but we can just disconnect if we want to ensure new auth is used.
        // For now, we'll assume if connect is called, we might want to ensure connection.
        return;
    }

    this.socket = io(this.url, {
      auth: auth,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log('Connected to Socket.IO');
    });

    // Listen for all events and forward to handlers
    // In Socket.io, we typically listen to specific events.
    // To maintain compatibility with our previous "subscribe to everything" model,
    // we might need to listen to specific events we know about.
    // But our backend sends "message", "history", "channels", "channel_created", "channel_deleted".
    
    const events = ["connect", "disconnect", "message", "history", "channels", "users", "tasks", "task_created", "task_updated", "task_deleted", "channel_created", "channel_deleted", "error", "user_status_change", "typing_start", "typing_stop"];
    
    events.forEach(event => {
      this.socket?.on(event, (payload) => {
        // Wrap it in the { type, payload } structure our app expects
        this.handlers.forEach(handler => handler({ type: event, payload }));
      });
    });

    this.socket.on("disconnect", () => {
      console.log('Socket.IO disconnected');
    });

    this.socket.on("connect_error", (err) => {
      console.error(`Socket.IO connection error to ${this.url}:`, err.message);
    });
  }

  send(data: { type: string, payload: any }) {
    if (this.socket?.connected) {
      // In Socket.io, we emit the event name (type) directly
      this.socket.emit(data.type, data.payload);
    } else {
      console.warn('Socket.IO not connected');
    }
  }

  emit(event: string, payload: any) {
    // We shouldn't check connected status here, as Socket.IO buffers events
    // while connecting. This fixes the race condition where we emit 
    // immediately after calling connect().
    if (this.socket) {
      this.socket.emit(event, payload);
    } else {
      console.warn('Socket.IO instance not created');
    }
  }

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8080`;
  }
  return 'http://localhost:8080';
};

export const socket = new SocketClient(getSocketUrl());
