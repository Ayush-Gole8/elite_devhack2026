/**
 * Ambient module declaration for socket.io-client.
 * Fixes moduleResolution: bundler not finding the package's own d.ts files.
 */
declare module 'socket.io-client' {
  interface SocketOptions {
    transports?: string[];
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    path?: string;
    auth?: Record<string, unknown>;
    timeout?: number;
  }

  interface Socket {
    id: string;
    connected: boolean;
    disconnected: boolean;
    on(event: string, listener: (...args: unknown[]) => void): this;
    once(event: string, listener: (...args: unknown[]) => void): this;
    off(event: string, listener?: (...args: unknown[]) => void): this;
    emit(event: string, ...args: unknown[]): this;
    connect(): this;
    disconnect(): this;
    close(): this;
  }

  function io(uri: string, opts?: SocketOptions): Socket;

  export { io, Socket, SocketOptions };
}
