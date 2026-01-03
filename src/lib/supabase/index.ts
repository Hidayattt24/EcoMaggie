/**
 * Supabase Module Exports
 * ===========================================
 * Central export untuk semua Supabase utilities
 */

// Browser client
export { createClient } from "./client";

// Server client & utilities
export {
  createClient as createServerClient,
  getUser,
  getSession,
  getUserProfile,
} from "./server";

// Admin client (server-only)
export {
  createAdminClient,
  updateUserMetadata,
  deleteUser,
  listUsers,
  inviteUser,
} from "./admin";

// Middleware utilities
export { updateSession } from "./middleware";
