const API_BASE_URL = "http://localhost:3000/api";

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  });

  // Get token from localStorage if not provided in options
  const authToken = token || localStorage.getItem("token");
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API Error");
  }

  return response.json();
}

// Re-export all API modules
export * from "./api/auth";
export * from "./api/balance";
export * from "./api/device";
export * from "./api/order";
export * from "./api/social";
export * from "./api/task";
export * from "./api/user";
