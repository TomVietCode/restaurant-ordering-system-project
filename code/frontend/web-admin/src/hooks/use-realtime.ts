'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/constants';

/**
 * Lắng nghe một sự kiện realtime trên namespace `/orders` của backend (Socket.IO).
 * Dùng chung cho mọi trang admin cần realtime (menu, bàn, đơn hàng...).
 *
 * `handler` được giữ trong ref nên có thể truyền hàm inline mà KHÔNG làm
 * socket kết nối lại mỗi lần re-render.
 *
 * @example useRealtime<{ itemId: number; isRemain: boolean }>('menu:item-availability-changed', p => {...})
 */
export function useRealtime<T>(event: string, handler: (payload: T) => void): void {
  const handlerRef = useRef(handler);
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    const url = API_BASE_URL.replace('/api', '');
    const socket = io(`${url}/orders`, { transports: ['websocket'] });
    socket.on(event, (payload: T) => handlerRef.current(payload));
    return () => { socket.disconnect(); };
  }, [event]);
}
