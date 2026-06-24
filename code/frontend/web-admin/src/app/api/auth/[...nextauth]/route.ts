// Route handler bắt buộc của Auth.js — xử lý mọi request /api/auth/*.
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
