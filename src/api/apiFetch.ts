import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8080';

async function request<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {...options, headers});

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

export const api = {
  get: <T>(path: string, auth = true) =>
    request<T>(path, {method: 'GET'}, auth),

  post: <T>(path: string, body: object, auth = true) =>
    request<T>(path, {method: 'POST', body: JSON.stringify(body)}, auth),

  patch: <T>(path: string, body: object, auth = true) =>
    request<T>(path, {method: 'PATCH', body: JSON.stringify(body)}, auth),
};
