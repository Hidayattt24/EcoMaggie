/**
 * VenusConnect Session Manager
 * ========================================
 *
 * Utility untuk manage WhatsApp session di VenusConnect
 */

const VENUSCONNECT_API_URL = "https://whatsapp.venusverse.me/api";
const VENUSCONNECT_API_KEY = process.env.VENUSCONNECT_API_KEY;

interface SessionStatus {
  session_id: string;
  status: string;
  connected: boolean;
  phone_number?: string;
  name?: string;
  hasQr?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get all sessions for current user
 */
export async function getAllSessions(): Promise<ApiResponse<SessionStatus[]>> {
  try {
    if (!VENUSCONNECT_API_KEY) {
      return {
        success: false,
        error: "VENUSCONNECT_API_KEY not configured",
      };
    }

    const response = await fetch(`${VENUSCONNECT_API_URL}/sessions`, {
      method: "GET",
      headers: {
        "x-api-key": VENUSCONNECT_API_KEY,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || "Failed to get sessions",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Get sessions error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get session status by ID
 */
export async function getSessionStatus(sessionId: string): Promise<ApiResponse<SessionStatus>> {
  try {
    if (!VENUSCONNECT_API_KEY) {
      return {
        success: false,
        error: "VENUSCONNECT_API_KEY not configured",
      };
    }

    const response = await fetch(
      `${VENUSCONNECT_API_URL}/session/${sessionId}/status`,
      {
        method: "GET",
        headers: {
          "x-api-key": VENUSCONNECT_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || "Failed to get session status",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Get session status error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create new WhatsApp session and get QR code
 */
export async function createSession(sessionId?: string): Promise<ApiResponse<{
  session_id: string;
  status: string;
  connected: boolean;
  qr?: string;
  message: string;
}>> {
  try {
    if (!VENUSCONNECT_API_KEY) {
      return {
        success: false,
        error: "VENUSCONNECT_API_KEY not configured",
      };
    }

    const response = await fetch(`${VENUSCONNECT_API_URL}/session/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": VENUSCONNECT_API_KEY,
      },
      body: JSON.stringify({
        session_id: sessionId || "default",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || "Failed to create session",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Create session error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get QR code for session authentication
 */
export async function getSessionQR(sessionId: string): Promise<ApiResponse<{
  qr: string;
  session_id: string;
}>> {
  try {
    if (!VENUSCONNECT_API_KEY) {
      return {
        success: false,
        error: "VENUSCONNECT_API_KEY not configured",
      };
    }

    const response = await fetch(
      `${VENUSCONNECT_API_URL}/session/${sessionId}/qr`,
      {
        method: "GET",
        headers: {
          "x-api-key": VENUSCONNECT_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || "Failed to get QR code",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Get QR code error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete/logout session
 */
export async function deleteSession(sessionId: string): Promise<ApiResponse> {
  try {
    if (!VENUSCONNECT_API_KEY) {
      return {
        success: false,
        error: "VENUSCONNECT_API_KEY not configured",
      };
    }

    const response = await fetch(
      `${VENUSCONNECT_API_URL}/session/${sessionId}`,
      {
        method: "DELETE",
        headers: {
          "x-api-key": VENUSCONNECT_API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || data.message || "Failed to delete session",
      };
    }

    return {
      success: true,
      message: "Session deleted successfully",
    };
  } catch (error) {
    console.error("Delete session error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if session is connected and ready to send messages
 */
export async function isSessionReady(sessionId: string): Promise<boolean> {
  const result = await getSessionStatus(sessionId);
  return result.success && result.data?.connected === true;
}
