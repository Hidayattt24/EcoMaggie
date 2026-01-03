/**
 * Supabase Admin Client
 * ===========================================
 * Digunakan untuk operasi administratif yang bypass RLS
 * HANYA gunakan di server-side untuk operasi trusted
 *
 * ⚠️ WARNING: Jangan pernah expose SERVICE_ROLE_KEY ke client
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Admin: Create or update user metadata
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, unknown>
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Admin: Delete user
 */
export async function deleteUser(userId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Admin: List all users (paginated)
 */
export async function listUsers(page = 1, perPage = 50) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.listUsers({
    page,
    perPage,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Admin: Invite user by email
 */
export async function inviteUser(email: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

  if (error) {
    throw error;
  }

  return data;
}
