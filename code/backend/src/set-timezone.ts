/**
 * Pin the Node.js process timezone to UTC.
 *
 * The database stores timestamps in UTC, but node-postgres builds JS `Date`
 * objects from `timestamp without time zone` columns using the process
 * timezone. On production the container ran in Asia/Ho_Chi_Minh (+7), so those
 * timestamps were misread and returned 7 hours behind the real instant.
 *
 * Forcing the process to UTC makes timestamps round-trip correctly regardless
 * of the host/container timezone. The frontend then formats them for display in
 * Vietnam time (Asia/Ho_Chi_Minh).
 *
 * This module MUST be imported before anything that reads dates from the
 * database (i.e. as the very first import in `main.ts`).
 */
process.env.TZ = 'UTC';

export {};
