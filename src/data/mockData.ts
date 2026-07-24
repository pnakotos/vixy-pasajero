import { Driver, UserProfile, WalletTransaction, ScheduledReservation, AppNotification, TripRating } from '../types';

export const EXCHANGE_RATE_VES = 65.00; // 1 USD = 65.00 Bs.

export const MOCK_USER: UserProfile = {
  id: 'usr_001',
  name: 'Carlos',
  lastName: 'Mendoza',
  email: 'carlos.mendoza@email.ve',
  phone: '+58 412 555 7890',
  cedula: 'V-24.892.110',
  isVerified: true,
  verificationStatus: 'verified',
  idPhotoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  emergencyContact: 'María Mendoza (Madre)',
  emergencyPhone: '+58 414 333 1234',
};

export const MOCK_LOCATIONS = [
  { name: 'Plaza Altamira, Chacao, Caracas', coords: [10.4960, -66.8488] as [number, number] },
  { name: 'C.C. Sambil Chacao, Av. Libertador', coords: [10.4908, -66.8550] as [number, number] },
  { name: 'Calle París, Las Mercedes, Baruta', coords: [10.4795, -66.8592] as [number, number] },
  { name: 'Plaza Venezuela, Los Caobos', coords: [10.4972, -66.8829] as [number, number] },
  { name: 'Ciudad Universitaria UCV, San Pedro', coords: [10.4883, -66.8893] as [number, number] },
  { name: 'C.C. Tolón Fashion Mall, Las Mercedes', coords: [10.4761, -66.8611] as [number, number] },
  { name: 'Aeropuerto Int. Simón Bolívar, Maiquetía', coords: [10.6031, -66.9906] as [number, number] },
  { name: 'Terminal de Pasajeros La Bandera', coords: [10.4735, -66.9110] as [number, number] },
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'drv_moto_1',
    name: 'José Luis',
    lastName: 'García',
    rating: 4.95,
    totalTrips: 1420,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    vehicleCategory: 'moto',
    vehicleModel: 'Empire Keeway Owen 150',
    vehiclePlate: 'AC891X',
    vehicleColor: 'Negro Mate',
    phone: '+58 414 901 2233',
    currentLat: 10.4930,
    currentLng: -66.8510,
  },
  {
    id: 'drv_auto_1',
    name: 'Pedro Antonio',
    lastName: 'Rondón',
    rating: 4.88,
    totalTrips: 890,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    vehicleCategory: 'auto',
    vehicleModel: 'Toyota Yaris Sedan',
    vehiclePlate: 'AB762CV',
    vehicleColor: 'Plata Metalizado',
    phone: '+58 412 888 4455',
    currentLat: 10.4915,
    currentLng: -66.8540,
  },
  {
    id: 'drv_delivery_1',
    name: 'Franklin',
    lastName: 'Torres',
    rating: 4.92,
    totalTrips: 650,
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    vehicleCategory: 'delivery',
    vehicleModel: 'Bera SBR 150 (Con Cajón Vixy)',
    vehiclePlate: 'AD443Y',
    vehicleColor: 'Morado Vixy',
    phone: '+58 424 777 9900',
    currentLat: 10.4980,
    currentLng: -66.8450,
  },
];

export const PAYMENT_ACCOUNTS_INFO = {
  pagoMovil: {
    banco: '0102 - Banco de Venezuela',
    cedula: 'J-501239884 (Vixy Servicios C.A.)',
    telefono: '0412-5550000',
    instrucciones: 'Realiza el pago móvil al cambio oficial BCV o tasa del día y coloca el número de referencia en la sección de Verificación.',
  },
  zinli: {
    email: 'pagos@vixy-taxi.ve',
    nombre: 'Vixy Technologies',
    instrucciones: 'Envía los USD directamente desde tu app Zinli al correo o código QR oficial y registra el ID de transacción.',
  },
  binance: {
    payId: '284910382 (Vixy Pay)',
    email: 'binance@vixy-taxi.ve',
    moneda: 'USDT (Tether)',
    instrucciones: 'Transfiere USDT libre de comisión por Binance Pay y adjunta el Order ID o captura.',
  },
  paypal: {
    email: 'facturacion@vixy-taxi.ve',
    link: 'https://paypal.me/vixytaxi',
    instrucciones: 'Envía el monto neto en USD sin comisiones retenidas e ingresa tu correo registrado de PayPal.',
  }
};

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_001',
    type: 'recharge',
    method: 'pago_movil',
    amountUsd: 15.00,
    amountVes: 975.00,
    reference: '982341',
    bankName: 'Banco de Venezuela',
    status: 'approved',
    date: '2026-07-22 14:30',
    description: 'Recarga aprobada vía Pago Móvil',
  },
  {
    id: 'tx_002',
    type: 'trip_payment',
    method: 'wallet',
    amountUsd: 3.50,
    amountVes: 227.50,
    status: 'approved',
    date: '2026-07-21 18:15',
    description: 'Pago de viaje Moto Taxi - Plaza Altamira a Las Mercedes',
  },
  {
    id: 'tx_003',
    type: 'recharge',
    method: 'zinli',
    amountUsd: 20.00,
    amountVes: 1300.00,
    reference: 'ZN-881923',
    status: 'approved',
    date: '2026-07-19 10:05',
    description: 'Recarga por Zinli Wallet',
  }
];

export const INITIAL_RESERVATIONS: ScheduledReservation[] = [
  {
    id: 'res_101',
    category: 'auto',
    pickupAddress: 'C.C. Tolón Fashion Mall, Las Mercedes',
    dropoffAddress: 'Aeropuerto Int. Simón Bolívar, Maiquetía',
    date: '2026-07-25',
    time: '06:30',
    priceUsd: 25.00,
    priceVes: 1625.00,
    paymentMethod: 'wallet',
    status: 'active',
    createdAt: '2026-07-22 20:00',
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    title: '¡Recarga Aprobada!',
    body: 'Se han acreditado $15.00 (975.00 Bs.) a tu Billetera Vixy vía Pago Móvil.',
    type: 'payment',
    date: 'Hace 10 min',
    read: false,
  },
  {
    id: 'notif_2',
    title: 'Seguridad Vixy Taxi 💜',
    body: 'Tu cuenta ha sido verificada exitosamente con tu Cédula V-24.892.110. ¡Viaja tranquilo!',
    type: 'security',
    date: 'Ayer',
    read: true,
  },
  {
    id: 'notif_3',
    title: 'Promoción Delivery Vixy 📦',
    body: 'Usa el cupón VIXYENVIO para un 20% de descuento en tu próximo paquete.',
    type: 'promo',
    date: 'Hace 2 días',
    read: true,
  }
];

export const MOCK_TRIP_HISTORY = [
  {
    id: 'viaje_001',
    category: 'auto' as const,
    pickupAddress: 'Plaza Altamira, Chacao, Caracas',
    dropoffAddress: 'Calle París, Las Mercedes, Baruta',
    distanceKm: 4.2,
    durationMins: 14,
    priceUsd: 4.50,
    priceVes: 292.50,
    paymentMethod: 'pago_movil' as const,
    driverName: 'Pedro Antonio Rondón',
    driverPlate: 'AB762CV',
    driverVehicle: 'Toyota Yaris Sedan (Plata)',
    driverPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    date: '2026-07-22 18:30',
    rating: 5,
    comment: 'Conductor muy educado, aire acondicionado encendido y vehículo muy limpio.',
    status: 'completed' as const
  },
  {
    id: 'viaje_002',
    category: 'moto' as const,
    pickupAddress: 'C.C. Sambil Chacao, Av. Libertador',
    dropoffAddress: 'Plaza Venezuela, Los Caobos',
    distanceKm: 3.1,
    durationMins: 8,
    priceUsd: 2.50,
    priceVes: 162.50,
    paymentMethod: 'direct_driver' as const,
    driverName: 'José Luis García',
    driverPlate: 'AC891X',
    driverVehicle: 'Empire Keeway Owen 150',
    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    date: '2026-07-20 12:15',
    rating: 5,
    comment: 'Llegó en 2 minutos con casco para pasajero. Muy rápido.',
    status: 'completed' as const
  },
  {
    id: 'viaje_003',
    category: 'delivery' as const,
    pickupAddress: 'Plaza Venezuela, Los Caobos',
    dropoffAddress: 'C.C. Tolón Fashion Mall, Las Mercedes',
    distanceKm: 5.5,
    durationMins: 18,
    priceUsd: 3.80,
    priceVes: 247.00,
    paymentMethod: 'zinli' as const,
    driverName: 'Franklin Torres',
    driverPlate: 'AD443Y',
    driverVehicle: 'Bera SBR 150 (Delivery)',
    driverPhoto: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    date: '2026-07-18 15:40',
    rating: 4,
    comment: 'Entregó el paquete en perfecto estado.',
    status: 'completed' as const
  }
];

export const QUICK_DRIVER_CHATS = [
  "Ya estoy afuera esperándote 📍",
  "Estoy en el vehículo color plata con intermitentes 🚗",
  "¿Lleva cambio de billetes o Pago Móvil? 💵",
  "Llego en aproximadamente 2 minutos ⏱️",
  "Por favor confirmo la dirección de destino 🧭"
];
