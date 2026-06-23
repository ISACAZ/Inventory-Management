import apiClient from "../lib/apiClient";

export const authService = {
  login(email, password) {
    return apiClient.post("/auth/login", { email, password });
  },

  /**
   * Mock Google Sign-In — validate email domain, simulate backend response.
   * In production, replace with real `POST /api/auth/google` call.
   */
  async loginWithGoogle(credentialResponse) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Decode the JWT credential to extract user info
    const payload = decodeGoogleCredential(credentialResponse.credential);
    if (!payload) {
      throw new Error("Failed to decode Google credential");
    }

    const email = payload.email;

    // Only @kmitl.ac.th emails are allowed
    if (!email || !email.endsWith("@kmitl.ac.th")) {
      throw new Error(
        "Only @kmitl.ac.th email addresses are allowed. Please use your university Google account.",
      );
    }

    // Mock user / token response (simulates backend)
    const mockUser = {
      id: `GOOGLE-${payload.sub?.slice(0, 8) || Date.now().toString(36)}`,
      email,
      full_name: payload.name || email.split("@")[0],
      role: "student",
      is_active: true,
      created_at: new Date().toISOString(),
      picture: payload.picture || null,
    };

    const mockToken = `mock-jwt-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return {
      access_token: mockToken,
      token_type: "bearer",
      user: mockUser,
    };
  },
};

/**
 * Decode a Google JWT credential without verification (mock only).
 * Returns { sub, email, name, picture } or null.
 */
function decodeGoogleCredential(credential) {
  try {
    const parts = credential.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}
