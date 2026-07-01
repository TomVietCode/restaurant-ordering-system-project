/**
 * Shared singleton Socket.IO client for the `/orders` namespace.
 *
 * Why a singleton?
 * ─ Multiple pages (cashier, kitchen) need realtime order events.
 * ─ Creating a new socket per page wastes connections and causes
 *   duplicate event deliveries.
 * ─ A module-level variable ensures only ONE socket is ever created,
 *   regardless of how many components call `getSocket()`.
 *
 * Usage:
 *   import { getSocket } from '@/lib/socket';
 *   const socket = getSocket();
 *   socket.on('order:new', handler);
 */
import { io, Socket } from 'socket.io-client';

/**
 * Derive the WebSocket base URL from the API URL.
 *
 * `API_BASE_URL` is something like `http://localhost:3000/api`.
 * Socket.IO connects to the server root, not the `/api` prefix,
 * so we strip the trailing `/api` path.
 */
const WS_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
).replace(/\/api\/?$/, '');

/** Module-level cache — holds the single socket instance. */
let socket: Socket | null = null;

/**
 * Returns the shared Socket.IO client.
 * Lazily connects on the first call; subsequent calls return the same instance.
 *
 * Key options:
 * - `autoConnect: false` → we call `.connect()` explicitly so the caller
 *   controls when the connection starts.
 * - `reconnection: true` → auto-reconnects if the server drops the connection.
 * - `transports: ['websocket']` → skips the default long-polling upgrade,
 *   which is faster and avoids CORS issues with polling requests.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${WS_BASE_URL}/orders`, {
      autoConnect: false,
      reconnection: true,
      transports: ['websocket'],
    });
  }

  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Cleanly disconnect and destroy the singleton.
 * Call this on app unmount or when the user logs out.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
