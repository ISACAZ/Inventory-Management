const API_BASE = import.meta.env.VITE_API_URL || "/api";

// Downloads a CSV report. apiClient assumes JSON responses, so this talks to
// fetch directly and hands the blob to the browser as a file download.
export const reportService = {
  async download(type, { start, end } = {}) {
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    const qs = params.toString();

    let token = null;
    try {
      token = localStorage.getItem("lab_token");
    } catch {
      // localStorage may be unavailable.
    }
    const res = await fetch(`${API_BASE}/reports/${type}${qs ? `?${qs}` : ""}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      let detail = `Request failed with status ${res.status}`;
      try {
        detail = (await res.json())?.detail || detail;
      } catch {
        // non-JSON error body
      }
      throw new Error(detail);
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
