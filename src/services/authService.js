export const authService = {
  async googleLogin(credential) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      access_token: "mock-token",
      token_type: "bearer",
      user: {
        id: 1,
        email: "student@kmitl.ac.th",
        full_name: "KMITL Student",
        role: "user",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    };
  },
};
