import { getApiUrl } from "../utils";

type RequestConfig = RequestInit & {
  params?: Record<string, string>;
};

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...customConfig } = config;
  const baseUrl = getApiUrl();
  
  let url = `${baseUrl}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const headers = { "Content-Type": "application/json", ...customConfig.headers };

  const finalConfig: RequestInit = {
    ...customConfig,
    headers,
  };

  try {
    const response = await fetch(url, finalConfig);
    const data = await response.json();

    if (response.ok) {
      return data;
    }

    throw new ApiError(response.status, data.error || response.statusText, data);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`[API Error] ${finalConfig.method || "GET"} ${endpoint}:`, error.status, error.message);
      throw error;
    }
    
    console.error(`[Network Error] ${finalConfig.method || "GET"} ${endpoint}:`, error);
    throw new Error("Network error occurred. Please check your connection.");
  }
}

export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) => 
    request<T>(endpoint, { ...config, method: "GET" }),
    
  post: <T>(endpoint: string, body?: any, config?: RequestConfig) => 
    request<T>(endpoint, { ...config, method: "POST", body: JSON.stringify(body) }),
    
  put: <T>(endpoint: string, body?: any, config?: RequestConfig) => 
    request<T>(endpoint, { ...config, method: "PUT", body: JSON.stringify(body) }),
    
  delete: <T>(endpoint: string, config?: RequestConfig) => 
    request<T>(endpoint, { ...config, method: "DELETE" }),
};
