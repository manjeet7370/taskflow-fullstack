import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateTaskLocally } from '../store/slices/tasksSlice';

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => console.log('WebSocket connected');

    ws.onmessage = (event) => {
      try {
        const { event: eventType, data } = JSON.parse(event.data);
        if (eventType === 'task:updated') dispatch(updateTaskLocally(data));
      } catch (e) {
        console.error('WS message error:', e);
      }
    };

    ws.onclose = () => {
      reconnectTimer.current = setTimeout(connect, 5000);
    };

    ws.onerror = (err) => console.error('WebSocket error:', err);
  }, [dispatch]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return wsRef;
};
