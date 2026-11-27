// // Adjust TOKEN_KEY to match your auth storage (e.g. "token", "accessToken")
// const TOKEN_KEY = "token";
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// function getToken() {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem(TOKEN_KEY);
// }

// export async function apiRequest(endpoint, options = {}) {
//   const token = getToken();

//   const res = await fetch(`${API_BASE}${endpoint}`, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//       ...options.headers,
//     },
//   });

//   let data;
//   try {
//     data = await res.json();
//   } catch {
//     data = { success: false, message: `Request failed (${res.status})` };
//   }

//   if (!res.ok) {
//     const err = new Error(data.message || `Request failed (${res.status})`);
//     err.errors = data.errors || [];
//     err.status = res.status;
//     throw err;
//   }
//   return data;
// }

// export const servicesApi = {
//   list: (params = {}) => {
//     const qs = new URLSearchParams();
//     Object.entries(params).forEach(([k, v]) => {
//       if (v !== undefined && v !== null && v !== "") qs.append(k, v);
//     });
//     return apiRequest(`/services?${qs.toString()}`);
//   },
//   getById: (id) => apiRequest(`/services/id/${id}`),
//   create: (payload) =>
//     apiRequest("/services", { method: "POST", body: JSON.stringify(payload) }),
//   update: (id, payload) =>
//     apiRequest(`/services/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
//   toggle: (id) => apiRequest(`/services/${id}/toggle`, { method: "PATCH" }),
//   remove: (id, hard = false) =>
//     apiRequest(`/services/${id}${hard ? "?hard=true" : ""}`, { method: "DELETE" }),
// };

// Adjust TOKEN_KEY to match your auth storage (e.g. "token", "accessToken")
const TOKEN_KEY = "token";
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Backend origin without /api (useful for rendering /uploads/... image URLs)
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

export function resolveImageUrl(url) {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { success: false, message: `Request failed (${res.status})` };
  }

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.errors = data.errors || [];
    err.status = res.status;
    throw err;
  }
  return data;
}

export const servicesApi = {
  // Matches GET /api/services
  list: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const queryString = qs.toString();
    return apiRequest(`/services${queryString ? `?${queryString}` : ""}`);
  },

  // Matches GET /api/services/:slug
  getBySlug: (slug) => apiRequest(`/services/${slug}`),

  // Matches GET /api/services/id/:id
  getById: (id) => apiRequest(`/services/id/${id}`),

  // Matches POST /api/services
  create: (payload) =>
    apiRequest("/services", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Matches PUT /api/services/:id
  update: (id, payload) =>
    apiRequest(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Matches PATCH /api/services/:id/toggle
  toggle: (id) =>
    apiRequest(`/services/${id}/toggle`, {
      method: "PATCH",
    }),

  // Matches DELETE /api/services/:id(?hard=true)
  remove: (id, hard = false) =>
    apiRequest(`/services/${id}${hard ? "?hard=true" : ""}`, {
      method: "DELETE",
    }),

  // Matches POST /api/services/upload
  // Expects multer fields: `heroImage` (single) and `gallery` (multiple)
  uploadImages: ({ heroFile = null, galleryFiles = [] } = {}) => {
    const formData = new FormData();
    if (heroFile) {
      formData.append("heroImage", heroFile);
    }
    galleryFiles.forEach((file) => {
      formData.append("gallery", file);
    });

    return apiRequest("/services/upload", {
      method: "POST",
      body: formData,
    });
  },
};