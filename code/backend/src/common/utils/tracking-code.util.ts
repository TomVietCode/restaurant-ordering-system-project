import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet(
  '23456789ABCDEFGHJKMNPQRSTUVWXYZ',
  8,
);

export function generateTrackingCode(prefix = 'OD'): string {
  return `${prefix}${nanoid()}`;
}