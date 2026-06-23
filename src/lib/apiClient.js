const API_BASE = '/api'

function getToken() {
  try {
    return localStorage.getItem('lab_token')
  } catch {
    return null
  }
}

async function request(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 204) {
    return null
  }

  const data = await res.json()

  if (!res.ok) {
    const message = data?.detail || `Request failed with status ${res.status}`
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  return data
}

export const apiClient = {
  get(endpoint) {
    return request(endpoint, { method: 'GET' })
  },
  post(endpoint, body) {
    return request(endpoint, { method: 'POST', body: JSON.stringify(body) })
  },
  put(endpoint, body) {
    return request(endpoint, { method: 'PUT', body: JSON.stringify(body) })
  },
  patch(endpoint, body) {
    return request(endpoint, { method: 'PATCH', body: JSON.stringify(body) })
  },
  delete(endpoint) {
    return request(endpoint, { method: 'DELETE' })
  },
}

export default apiClient
