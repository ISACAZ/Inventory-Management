import apiClient from '../lib/apiClient'

export const locationService = {
  listLocations() {
    return apiClient.get('/locations?limit=200')
  },

  getLocation(id) {
    return apiClient.get(`/locations/${id}`)
  },

  getLocationItems(id) {
    return apiClient.get(`/locations/${id}/items`)
  },
}
