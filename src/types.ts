export type VehicleCategory = 'moto' | 'auto' | 'delivery';

export type PaymentMethod = 'direct_driver' | 'pago_movil' | 'zinli' | 'paypal' | 'binance' | 'wallet';

export type Currency = 'USD' | 'VES';

export interface UserProfile {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  cedula: string; // V-12345678 or E-87654321
  isVerified: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  idPhotoUrl?: string;
  selfieUrl?: string;
  avatarUrl: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface Driver {
  id: string;
  name: string;
  lastName: string;
  rating: number;
  totalTrips: number;
  photoUrl: string;
  vehicleCategory: VehicleCategory;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleColor: string;
  phone: string;
  currentLat: number;
  currentLng: number;
}

export type RideStatus = 
  | 'idle' 
  | 'selecting_destination'
  | 'searching' 
  | 'driver_assigned' 
  | 'driver_arriving' 
  | 'in_trip' 
  | 'completed' 
  | 'cancelled';

export interface RideRequest {
  id: string;
  category: VehicleCategory;
  pickupAddress: string;
  dropoffAddress: string;
  pickupCoords: [number, number]; // [lat, lng]
  dropoffCoords: [number, number];
  distanceKm: number;
  durationMins: number;
  priceUsd: number;
  priceVes: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  driver?: Driver;
  status: RideStatus;
  createdAt: string;
  etaDriverArrivalMins: number;
  etaTripArrivalMins: number;
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'recharge' | 'trip_payment' | 'refund';
  method: PaymentMethod;
  amountUsd: number;
  amountVes: number;
  reference?: string;
  bankName?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  proofImageUrl?: string;
  description: string;
}

export interface ScheduledReservation {
  id: string;
  category: VehicleCategory;
  pickupAddress: string;
  dropoffAddress: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  priceUsd: number;
  priceVes: number;
  paymentMethod: PaymentMethod;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'driver' | 'support' | 'system';
  text: string;
  timestamp: string;
}

export interface TripRating {
  tripId: string;
  driverId: string;
  driverName: string;
  stars: number;
  tags: string[];
  comment: string;
  date: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'trip' | 'payment' | 'security' | 'promo';
  date: string;
  read: boolean;
}
