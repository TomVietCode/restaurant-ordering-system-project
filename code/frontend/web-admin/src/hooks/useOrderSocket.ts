/**
 * Reusable hook that subscribes to realtime order events via Socket.IO.
 *
 * Designed for shared use across pages — cashier board, kitchen board, etc.
 * The underlying socket is a singleton (from `@/lib/socket`), so this hook
 * only adds/removes listeners; it never creates duplicate connections.
 *
 * Events handled:
 * ─ `order:new`            → a customer just placed a new order
 * ─ `order:status-changed` → an order transitioned (e.g. NEW → PREPARING)
 *
 * Usage:
 *   useOrderSocket({
 *     onNewOrder: (data) => { ... },
 *     onStatusChanged: (data) => { ... },
 *   });
 */
'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

/** Payload emitted by the backend when a new order is created. */
export interface NewOrderPayload {
  orderId: number;
  tableId: string;
  totalAmount: number;
  status: string;
}

/** Payload emitted by the backend when an order's status changes. */
export interface StatusChangedPayload {
  trackingCode: string;
  orderId: number;
  status: string;
}

interface UseOrderSocketOptions {
  /** Called when a brand-new order is placed by a customer. */
  onNewOrder?: (data: NewOrderPayload) => void;
  /** Called when any order's status changes (prepare, serve, pay, cancel). */
  onStatusChanged?: (data: StatusChangedPayload) => void;
}

/**
 * Subscribe to order WebSocket events.
 *
 * How it works:
 * 1. On mount → get the singleton socket → register event listeners.
 * 2. On unmount → remove ONLY this component's listeners (`.off(event, fn)`).
 *    The socket itself stays alive for other consumers.
 *
 * We store callbacks in refs so the effect doesn't re-run when
 * the parent re-renders with new inline arrow functions.
 */
export function useOrderSocket(options: UseOrderSocketOptions): void {
  // useRef keeps the latest callback without triggering effect re-runs.
  // This prevents the socket from constantly unsubscribing/resubscribing
  // every time the parent component re-renders.
  const onNewOrderRef = useRef(options.onNewOrder);
  const onStatusChangedRef = useRef(options.onStatusChanged);

  // Keep refs up to date with the latest callbacks
  onNewOrderRef.current = options.onNewOrder;
  onStatusChangedRef.current = options.onStatusChanged;

  useEffect(() => {
    const socket = getSocket();

    // Wrapper functions that delegate to the ref —
    // this way we register a stable function with socket.on(),
    // but it always calls the latest callback from the parent.
    const handleNewOrder = (data: NewOrderPayload) => {
      onNewOrderRef.current?.(data);
    };

    const handleStatusChanged = (data: StatusChangedPayload) => {
      onStatusChangedRef.current?.(data);
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:status-changed', handleStatusChanged);

    // Cleanup: remove ONLY these specific listener functions.
    // Other components using the same socket keep their listeners.
    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:status-changed', handleStatusChanged);
    };
  }, []); // Empty deps → runs once on mount, cleans up on unmount
}
