import apiClient from '../lib/apiClient'

export const authService = {
  login(email, password) {
    return apiClient.post('/auth/login', { email, password })
  },
}
