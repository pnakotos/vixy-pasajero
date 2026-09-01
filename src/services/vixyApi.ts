/**
 * Cliente HTTP para conectar la app Vixy Pasajero al backend real
 * (mismo servidor PHP que usa el panel administrativo y la app conductor).
 * Usa `client_auth.php` (registro/login propio) y `rides.php` (solicitud de viajes).
 */

function readEnv(key: string): string | undefined {
  return (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[key];
}

const ADMIN_BASE_URL = readEnv('VITE_ADMIN_BASE_URL') || 'https://www.vhixy.site';
const API_KEY = readEnv('VITE_INTERCONNECTION_KEY') || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${ADMIN_BASE_URL.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(API_KEY ? { 'X-Api-Key': API_KEY } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let payload: ApiResponse<T>;
  try {
    payload = text ? (JSON.parse(text) as ApiResponse<T>) : { success: false };
  } catch {
    throw new Error(`El servidor devolvió una respuesta inválida (${response.status}).`);
  }
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || `Solicitud fallida (${response.status})`);
  }
  return payload.data as T;
}

export interface ClientApiRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  balance_usd: string;
  total_trips: number;
  rating: string;
  is_blocked: number;
  registered_at: string;
  avatar_url: string | null;
  cedula: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  auth_token?: string;
}

export function registerClient(body: {
  name: string;
  username?: string;
  email: string;
  phone: string;
  password: string;
  cedula?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}): Promise<ClientApiRecord> {
  return apiRequest<ClientApiRecord>('/api/client_auth.php?action=register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function loginClient(emailOrUsername: string, password: string): Promise<ClientApiRecord> {
  return apiRequest<ClientApiRecord>('/api/client_auth.php?action=login', {
    method: 'POST',
    body: JSON.stringify({ email: emailOrUsername, password }),
  });
}

export function fetchClientSession(token: string): Promise<ClientApiRecord> {
  return apiRequest<ClientApiRecord>(`/api/client_auth.php?action=me&token=${encodeURIComponent(token)}`);
}

export function logoutClient(clientId: string): Promise<{ loggedOut: boolean }> {
  return apiRequest('/api/client_auth.php?action=logout', {
    method: 'POST',
    body: JSON.stringify({ clientId }),
  });
}

export interface CreateRideBody {
  userId: string;
  clientId?: string;
  category: 'moto' | 'auto' | 'delivery';
  pickupAddress: string;
  dropoffAddress: string;
  pickupCoords: [number, number];
  dropoffCoords: [number, number];
  distanceKm?: number;
  durationMins?: number;
  priceUsd: number;
  priceVes: number;
  paymentMethod: string;
  paymentReference?: string;
  notes?: string;
}

export function createRide(body: CreateRideBody): Promise<Record<string, unknown>> {
  return apiRequest('/api/rides.php?action=create', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function fetchRide(rideId: string): Promise<Record<string, unknown>> {
  return apiRequest(`/api/rides.php?action=get&id=${encodeURIComponent(rideId)}`);
}
