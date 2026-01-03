"use server";

/**
 * Auth Server Actions
 * ===========================================
 * Server-side authentication actions using Supabase Auth
 * All sensitive operations are handled securely on the server
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Response types
export type AuthActionResponse = {
  success: boolean;
  message: string;
  error?: string;
  data?: Record<string, unknown>;
};

// Register form data type
export type RegisterFormData = {
  namaLengkap: string;
  email: string;
  nomorWhatsapp: string;
  password: string;
  jenisPengguna: string;
  namaUsaha?: string;
  provinsi: string;
  kabupatenKota: string;
  kodePos?: string;
  alamatLengkap?: string;
};

/**
 * Register new user
 * Uses Supabase's signUp with email verification
 */
export async function registerUser(
  formData: RegisterFormData
): Promise<AuthActionResponse> {
  try {
    console.log("========== REGISTER DEBUG ==========");
    console.log("Form Data received:", JSON.stringify(formData, null, 2));

    // Validate required fields
    if (!formData.namaLengkap?.trim()) {
      return {
        success: false,
        message: "Nama lengkap wajib diisi",
        error: "NAME_REQUIRED",
      };
    }

    if (!formData.email?.trim()) {
      return {
        success: false,
        message: "Email wajib diisi",
        error: "EMAIL_REQUIRED",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        message: "Format email tidak valid",
        error: "INVALID_EMAIL",
      };
    }

    if (!formData.password || formData.password.length < 8) {
      return {
        success: false,
        message: "Kata sandi minimal 8 karakter",
        error: "PASSWORD_TOO_SHORT",
      };
    }

    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Determine user role based on jenisPengguna
    const role = formData.jenisPengguna === "petani" ? "FARMER" : "USER";

    // Prepare user metadata - ensure no undefined values
    const userMetadata = {
      name: formData.namaLengkap || "",
      namaLengkap: formData.namaLengkap || "",
      phone: formData.nomorWhatsapp || "",
      role: role,
      jenisPengguna: formData.jenisPengguna || "",
      namaUsaha: formData.namaUsaha || "",
      provinsi: formData.provinsi || "",
      kabupatenKota: formData.kabupatenKota || "",
      kodePos: formData.kodePos || "",
      alamatLengkap: formData.alamatLengkap || "",
    };

    console.log(
      "User Metadata to send:",
      JSON.stringify(userMetadata, null, 2)
    );
    console.log("Base URL:", baseUrl);
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${baseUrl}/login?verified=true`,
        data: userMetadata,
      },
    });

    console.log("Supabase Response Data:", JSON.stringify(data, null, 2));

    if (error) {
      console.error("Register error details:", {
        message: error.message,
        status: error.status,
        code: "code" in error ? error.code : undefined,
        name: error.name,
      });

      if (error.message.includes("already registered")) {
        return {
          success: false,
          message:
            "Email sudah terdaftar. Silakan login atau gunakan email lain.",
          error: "EMAIL_EXISTS",
        };
      }

      if (error.message.includes("rate limit")) {
        return {
          success: false,
          message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
          error: "RATE_LIMIT",
        };
      }

      return {
        success: false,
        message: `Gagal mendaftar: ${error.message}`,
        error: error.message,
      };
    }

    console.log("========== REGISTER SUCCESS ==========");

    // Check if email confirmation is required
    if (data?.user?.identities?.length === 0) {
      return {
        success: false,
        message:
          "Email sudah terdaftar. Silakan login atau gunakan email lain.",
        error: "EMAIL_EXISTS",
      };
    }

    return {
      success: true,
      message: "Pendaftaran berhasil! Silakan cek email untuk verifikasi.",
      data: {
        userId: data?.user?.id,
        email: formData.email,
      },
    };
  } catch (error) {
    console.error("Register exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
      error: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthActionResponse> {
  try {
    if (!email?.trim()) {
      return {
        success: false,
        message: "Email wajib diisi",
        error: "EMAIL_REQUIRED",
      };
    }

    if (!password) {
      return {
        success: false,
        message: "Kata sandi wajib diisi",
        error: "PASSWORD_REQUIRED",
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);

      if (error.message.includes("Invalid login credentials")) {
        return {
          success: false,
          message: "Email atau kata sandi salah",
          error: "INVALID_CREDENTIALS",
        };
      }

      if (error.message.includes("Email not confirmed")) {
        return {
          success: false,
          message: "Email belum diverifikasi. Silakan cek inbox email Anda.",
          error: "EMAIL_NOT_VERIFIED",
        };
      }

      return {
        success: false,
        message: "Gagal login. Silakan coba lagi.",
        error: error.message,
      };
    }

    // Get user role from metadata or database
    const userRole = data.user?.user_metadata?.role || "USER";

    // Determine redirect URL based on role
    let redirectUrl = "/market/products"; // Default for USER
    if (userRole === "FARMER") {
      redirectUrl = "/farmer/dashboard";
    }

    return {
      success: true,
      message: "Login berhasil!",
      data: {
        userId: data.user?.id,
        email: data.user?.email,
        role: userRole,
        redirectUrl,
      },
    };
  } catch (error) {
    console.error("Login exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
      error: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Resend email verification OTP
 */
export async function resendVerificationEmail(
  email: string
): Promise<AuthActionResponse> {
  try {
    if (!email?.trim()) {
      return {
        success: false,
        message: "Email wajib diisi",
        error: "EMAIL_REQUIRED",
      };
    }

    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${baseUrl}/login?verified=true`,
      },
    });

    if (error) {
      console.error("Resend verification error:", error);

      if (error.message.includes("rate limit")) {
        return {
          success: false,
          message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
          error: "RATE_LIMIT",
        };
      }

      return {
        success: false,
        message: "Gagal mengirim ulang email verifikasi.",
        error: error.message,
      };
    }

    return {
      success: true,
      message: "Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.",
    };
  } catch (error) {
    console.error("Resend verification exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
      error: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Verify OTP code (for email verification)
 */
export async function verifyOTP(
  email: string,
  token: string
): Promise<AuthActionResponse> {
  try {
    if (!email?.trim() || !token?.trim()) {
      return {
        success: false,
        message: "Email dan kode OTP wajib diisi",
        error: "MISSING_FIELDS",
      };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      console.error("Verify OTP error:", error);

      if (error.message.includes("expired")) {
        return {
          success: false,
          message: "Kode OTP telah kedaluwarsa. Silakan minta kode baru.",
          error: "OTP_EXPIRED",
        };
      }

      if (error.message.includes("invalid")) {
        return {
          success: false,
          message: "Kode OTP tidak valid. Silakan periksa kembali.",
          error: "INVALID_OTP",
        };
      }

      return {
        success: false,
        message: "Verifikasi gagal. Silakan coba lagi.",
        error: error.message,
      };
    }

    return {
      success: true,
      message: "Email berhasil diverifikasi!",
      data: {
        userId: data.user?.id,
        email: data.user?.email,
      },
    };
  } catch (error) {
    console.error("Verify OTP exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
      error: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Send password reset email
 * Uses Supabase's resetPasswordForEmail function
 */
export async function forgotPassword(
  email: string
): Promise<AuthActionResponse> {
  try {
    // Validate email
    if (!email || !email.trim()) {
      return {
        success: false,
        message: "Email wajib diisi",
        error: "EMAIL_REQUIRED",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: "Format email tidak valid",
        error: "INVALID_EMAIL",
      };
    }

    const supabase = await createClient();

    // Get the base URL for redirect
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    });

    if (error) {
      console.error("Forgot password error:", error);

      // Handle specific errors
      if (error.message.includes("rate limit")) {
        return {
          success: false,
          message: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
          error: "RATE_LIMIT",
        };
      }

      return {
        success: false,
        message: "Gagal mengirim email pemulihan. Silakan coba lagi.",
        error: error.message,
      };
    }

    return {
      success: true,
      message:
        "Email pemulihan kata sandi telah dikirim. Silakan cek inbox Anda.",
    };
  } catch (error) {
    console.error("Forgot password exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
      error: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Reset password with new password
 * Uses Supabase's updateUser function
 */
export async function resetPassword(
  newPassword: string
): Promise<AuthActionResponse> {
  try {
    // Validate password
    if (!newPassword) {
      return {
        success: false,
        message: "Kata sandi wajib diisi",
        error: "PASSWORD_REQUIRED",
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Kata sandi minimal 8 karakter",
        error: "PASSWORD_TOO_SHORT",
      };
    }

    // Additional password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return {
        success: false,
        message:
          "Kata sandi harus mengandung huruf besar, huruf kecil, dan angka",
        error: "WEAK_PASSWORD",
      };
    }

    const supabase = await createClient();

    // Check if user has a valid session (from email link)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        message:
          "Sesi tidak valid atau telah kedaluwarsa. Silakan minta link pemulihan baru.",
        error: "INVALID_SESSION",
      };
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Reset password error:", error);

      if (error.message.includes("same password")) {
        return {
          success: false,
          message: "Kata sandi baru tidak boleh sama dengan kata sandi lama",
          error: "SAME_PASSWORD",
        };
      }

      return {
        success: false,
        message: "Gagal mengubah kata sandi. Silakan coba lagi.",
        error: error.message,
      };
    }

    // Sign out after password reset for security
    await supabase.auth.signOut();

    return {
      success: true,
      message:
        "Kata sandi berhasil diubah! Silakan login dengan kata sandi baru.",
    };
  } catch (error) {
    console.error("Reset password exception:", error);
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
      error: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Verify if the reset password session is valid
 */
export async function verifyResetSession(): Promise<AuthActionResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      return {
        success: false,
        message:
          "Link pemulihan tidak valid atau telah kedaluwarsa. Silakan minta link baru.",
        error: "INVALID_SESSION",
      };
    }

    return {
      success: true,
      message: "Sesi valid",
      data: {
        email: session.user.email,
      },
    };
  } catch {
    return {
      success: false,
      message: "Terjadi kesalahan. Silakan coba lagi.",
      error: "UNKNOWN_ERROR",
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
