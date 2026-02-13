import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocketClient } from './socket';

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  const mSocket = {
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: false,
  };
  return {
    io: vi.fn(() => mSocket),
  };
});

import { io } from 'socket.io-client';

describe('SocketClient', () => {
  let socketClient: SocketClient;
  const url = 'http://localhost:8080';

  beforeEach(() => {
    vi.clearAllMocks();
    socketClient = new SocketClient(url);
  });

  it('should create an instance', () => {
    expect(socketClient).toBeDefined();
  });

  it('should connect to the given url', () => {
    socketClient.connect();
    expect(io).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it('should pass auth options to io', () => {
    const auth = { email: 'test@example.com' };
    socketClient.connect(auth);
    expect(io).toHaveBeenCalledWith(url, expect.objectContaining({ auth }));
  });

  it('should register event handlers on connect', () => {
    socketClient.connect();
    const mockSocket = vi.mocked(io).mock.results[0].value;
    
    // Check if common events are registered
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });

  it('should notify subscribers when events occur', () => {
    const handler = vi.fn();
    socketClient.subscribe(handler);
    socketClient.connect();
    
    const mockSocket = vi.mocked(io).mock.results[0].value;
    // Find the 'message' event handler
    const messageCall = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'message');
    const messageHandler = messageCall[1];
    
    const payload = { text: 'hello' };
    messageHandler(payload);
    
    expect(handler).toHaveBeenCalledWith({ type: 'message', payload });
  });

  it('should emit events via send method', () => {
    socketClient.connect();
    const mockSocket = vi.mocked(io).mock.results[0].value;
    mockSocket.connected = true;
    
    const data = { type: 'chat', payload: 'hello' };
    socketClient.send(data);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('chat', 'hello');
  });

  it('should emit events via emit method even if not connected', () => {
    socketClient.connect();
    const mockSocket = vi.mocked(io).mock.results[0].value;
    mockSocket.connected = false;
    
    socketClient.emit('test', 'data');
    expect(mockSocket.emit).toHaveBeenCalledWith('test', 'data');
  });

  it('should disconnect the socket', () => {
    socketClient.connect();
    const mockSocket = vi.mocked(io).mock.results[0].value;
    
    socketClient.disconnect();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
