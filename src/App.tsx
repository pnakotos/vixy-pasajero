import React, { useState, useEffect } from 'react';
import { UserProfile, VehicleCategory, PaymentMethod, Currency, RideRequest, Driver, WalletTransaction, ScheduledReservation, AppNotification, ChatMessage } from './types';
import { MOCK_USER, MOCK_LOCATIONS, MOCK_DRIVERS, INITIAL_TRANSACTIONS, INITIAL_RESERVATIONS, INITIAL_NOTIFICATIONS, EXCHANGE_RATE_VES } from './data/mockData';
import { ShieldAlert } from 'lucide-react';

import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { RideSelector } from './components/RideSelector';
import { DriverDetailsCard } from './components/DriverDetailsCard';
import { PanicButtonModal } from './components/PanicButtonModal';
import { InAppDriverChat } from './components/InAppDriverChat';
import { WalletView } from './components/WalletView';
import { ReservationsView } from './components/ReservationsView';
import { TripHistoryView } from './components/TripHistoryView';
import { ProfileAuthView } from './components/ProfileAuthView';
import { SupportChatView } from './components/SupportChatView';
import { LoginScreen } from './components/LoginScreen';
import { TripCompletedModal } from './components/TripCompletedModal';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { syncUserProfileToFirestore, syncRideToFirestore, syncTransactionToFirestore } from './lib/firebaseSync';
import { testFirestoreConnection } from './lib/firebase';

export default function App() {
  // Navigation & User State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Test connection to Firestore on boot as per Firebase skill mandate
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Sync User Profile to Firestore whenever logged in user changes
  useEffect(() => {
    if (isLoggedIn && user && user.id) {
      syncUserProfileToFirestore(user);
    }
  }, [isLoggedIn, user]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  const [currency, setCurrency] = useState<Currency>('USD');
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Wallet & Reservations State
  const [walletBalanceUsd, setWalletBalanceUsd] = useState<number>(24.50);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [reservations, setReservations] = useState<ScheduledReservation[]>(INITIAL_RESERVATIONS);

  // Active Ride Request State
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>('auto');
  const [pickupAddress, setPickupAddress] = useState<string>(MOCK_LOCATIONS[0].name);
  const [dropoffAddress, setDropoffAddress] = useState<string>(MOCK_LOCATIONS[2].name);
  const [pickupCoords, setPickupCoords] = useState<[number, number]>(MOCK_LOCATIONS[0].coords);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number]>(MOCK_LOCATIONS[2].coords);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pago_movil');

  const [isSearchingDriver, setIsSearchingDriver] = useState<boolean>(false);
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
  const [driverLocation, setDriverLocation] = useState<[number, number] | undefined>(undefined);

  // Modals & Chat State
  const [isPanicModalOpen, setIsPanicModalOpen] = useState<boolean>(false);
  const [isDriverChatOpen, setIsDriverChatOpen] = useState<boolean>(false);
  const [driverChatMessages, setDriverChatMessages] = useState<ChatMessage[]>([]);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState<boolean>(false);
  const [supportTripId, setSupportTripId] = useState<string | undefined>(undefined);
  const [isUnverifiedModalOpen, setIsUnverifiedModalOpen] = useState<boolean>(false);
  const [completedRideForModal, setCompletedRideForModal] = useState<RideRequest | null>(null);

  // Calculated distance & prices
  const distanceKm = Math.max(1.8, Math.sqrt(
    Math.pow((dropoffCoords[0] - pickupCoords[0]) * 111, 2) +
    Math.pow((dropoffCoords[1] - pickupCoords[1]) * 111, 2)
  ));

  const baseMultiplier = selectedCategory === 'auto' ? 1.8 : selectedCategory === 'delivery' ? 1.3 : 1.0;
  const calculatedPriceUsd = parseFloat((2.00 + (distanceKm * 0.65 * baseMultiplier)).toFixed(2));
  const calculatedPriceVes = parseFloat((calculatedPriceUsd * EXCHANGE_RATE_VES).toFixed(2));

  // Toggle Currency
  const handleToggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'VES' : 'USD');
  };

  // Set Location from Map Click
  const handleMapClick = (coords: [number, number]) => {
    if (!currentRide || currentRide.status === 'idle') {
      setDropoffCoords(coords);
      setDropoffAddress(`Ubicación GPS fijada (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
    }
  };

  // Select Preset Location
  const handleSelectPresetLocation = (type: 'pickup' | 'dropoff', loc: { name: string; coords: [number, number] }) => {
    if (type === 'pickup') {
      setPickupAddress(loc.name);
      setPickupCoords(loc.coords);
    } else {
      setDropoffAddress(loc.name);
      setDropoffCoords(loc.coords);
    }
  };

  // Request Ride Handler
  const handleRequestRide = async () => {
    if (!user.isVerified) {
      setIsUnverifiedModalOpen(true);
      return;
    }
    if (!dropoffAddress) return;
    setIsSearchingDriver(true);

    // Verify backend University Fare check prior to dispatch
    let finalUsd = calculatedPriceUsd;
    let finalVes = calculatedPriceVes;
    let isUni = false;
    let uniName = '';

    try {
      const checkRes = await fetch('/api/university-fare/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupAddress,
          dropoffAddress,
          basePriceUsd: calculatedPriceUsd,
          exchangeRateVes: EXCHANGE_RATE_VES,
        }),
      });
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (checkData.applicable && checkData.universityPriceUsd) {
          finalUsd = checkData.universityPriceUsd;
          finalVes = checkData.universityPriceVes || (finalUsd * EXCHANGE_RATE_VES);
          isUni = true;
          uniName = checkData.universityName || '';
        }
      }
    } catch (err) {
      console.log('Error al consultar tarifa universitaria antes de solicitar:', err);
    }

    // Simulate driver matching in 2.5 seconds
    setTimeout(() => {
      const matchedDriver = MOCK_DRIVERS.find(d => d.vehicleCategory === selectedCategory) || MOCK_DRIVERS[0];
      const initialDriverLoc: [number, number] = [
        pickupCoords[0] + 0.008,
        pickupCoords[1] + 0.008,
      ];

      const newRide: RideRequest = {
        id: `ride_${Date.now()}`,
        category: selectedCategory,
        pickupAddress,
        dropoffAddress,
        pickupCoords,
        dropoffCoords,
        distanceKm,
        durationMins: Math.round(distanceKm * 2.5),
        priceUsd: parseFloat(finalUsd.toFixed(2)),
        priceVes: parseFloat(finalVes.toFixed(2)),
        paymentMethod,
        driver: matchedDriver,
        status: 'driver_assigned',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        etaDriverArrivalMins: 3,
        etaTripArrivalMins: Math.round(distanceKm * 2.5),
        isUniversityFare: isUni,
        universityName: uniName || undefined,
      };

      setCurrentRide(newRide);
      setDriverLocation(initialDriverLoc);
      setIsSearchingDriver(false);

      // Sync ride request with Firebase Firestore
      syncRideToFirestore(newRide, user.id);

      // Sync ride request with Administrative Panel (https://vhixy.site/)
      fetch('/api/admin/sync-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRide),
      }).catch(err => console.log('Admin sync notice:', err));

      // Initial chat message from assigned driver
      setDriverChatMessages([
        {
          id: 'chat_init',
          sender: 'driver',
          text: `¡Hola ${user.name}! Soy tu conductor ${matchedDriver.name}. Ya voy en camino a tu punto de origen en mi ${matchedDriver.vehicleModel}.${isUni ? ' 🎓 Recuérdame presentar tu carnet estudiantil al abordar para la Tarifa Universitaria.' : ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);

      // Add Notification
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        title: isUni ? 'Conductor Asignado (Tarifa Universitaria 🎓)' : 'Conductor Asignado 🚕',
        body: `${matchedDriver.name} (${matchedDriver.vehiclePlate}) ha aceptado tu viaje. ${isUni ? `Tarifa Estudiantil: $${finalUsd.toFixed(2)} USD.` : ''} Llegada est. en 3 min.`,
        type: 'trip',
        date: 'Ahora mismo',
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
    }, 2500);
  };

  // Driver GPS position animation interval
  useEffect(() => {
    if (!currentRide || !driverLocation) return;

    const interval = setInterval(() => {
      setDriverLocation(prev => {
        if (!prev) return prev;
        const targetCoords = currentRide.status === 'in_trip' ? currentRide.dropoffCoords : currentRide.pickupCoords;
        const deltaLat = (targetCoords[0] - prev[0]) * 0.15;
        const deltaLng = (targetCoords[1] - prev[1]) * 0.15;

        // If arrived at pickup
        if (Math.abs(deltaLat) < 0.0002 && Math.abs(deltaLng) < 0.0002 && currentRide.status === 'driver_assigned') {
          setCurrentRide(r => r ? { ...r, status: 'driver_arriving', etaDriverArrivalMins: 0 } : null);
          setTimeout(() => {
            setCurrentRide(r => r ? { ...r, status: 'in_trip' } : null);
          }, 4000);
        }

        // If arrived at dropoff destination during trip
        if (Math.abs(deltaLat) < 0.0003 && Math.abs(deltaLng) < 0.0003 && currentRide.status === 'in_trip') {
          handleFinishTrip();
        }

        return [prev[0] + deltaLat, prev[1] + deltaLng];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentRide, driverLocation]);

  // Finish trip trigger
  const handleFinishTrip = () => {
    if (!currentRide) return;
    const completed = { ...currentRide, status: 'completed' as const };
    setCurrentRide(completed);
    setCompletedRideForModal(completed);

    const newNotif: AppNotification = {
      id: `notif_comp_${Date.now()}`,
      title: '¡Llegaste a tu Destino! 🏁',
      body: `Tu viaje hacia ${currentRide.dropoffAddress} ha finalizado con éxito.`,
      type: 'trip',
      date: 'Ahora mismo',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Finish and Rate Trip handler from Modal
  const handleFinishAndRateTrip = (stars: number, comment: string, tags: string[]) => {
    setCurrentRide(null);
    setCompletedRideForModal(null);
    setDriverLocation(undefined);
  };

  // Send Driver Chat Message
  const handleSendDriverMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setDriverChatMessages(prev => [...prev, userMsg]);

    // Simulate driver reply in 1.5s
    setTimeout(() => {
      const replies = [
        "Perfecto, te tengo a la vista 👍",
        "Voy pasando por la avenida, llego en 1 minuto.",
        "Entendido. Tengo aire acondicionado encendido.",
        "Listo, ya estoy en el sitio."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const driverReply: ChatMessage = {
        id: `m_drv_${Date.now()}`,
        sender: 'driver',
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setDriverChatMessages(prev => [...prev, driverReply]);
    }, 1500);
  };

  // Cancel Current Ride
  const handleCancelRide = () => {
    setCurrentRide(null);
    setDriverLocation(undefined);
  };

  // Add Transaction to Wallet
  const handleAddTransaction = (newTx: WalletTransaction) => {
    setTransactions(prev => [newTx, ...prev]);

    // Sync payment transaction with Administrative Panel (https://vhixy.site/)
    fetch('/api/admin/sync-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx),
    }).catch(err => console.log('Admin wallet sync notice:', err));

    if (newTx.status === 'approved' && newTx.type === 'recharge') {
      setWalletBalanceUsd(prev => prev + newTx.amountUsd);
      
      // Push Notification for recharge
      const newNotif: AppNotification = {
        id: `notif_rec_${Date.now()}`,
        title: '¡Recarga Aprobada! 💳',
        body: `Se acreditaron $${newTx.amountUsd.toFixed(2)} USD a tu billetera Vixy Taxi.`,
        type: 'payment',
        date: 'Ahora mismo',
        read: false,
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  // Handle Emergency Alert from Panic Button
  const handleSendEmergencyAlert = (type: 'robo' | 'accidente') => {
    const alertNotif: AppNotification = {
      id: `notif_emerg_${Date.now()}`,
      title: `🚨 ALERTA DE PÁNICO ACTIVADA (${type.toUpperCase()})`,
      body: `Unidades de seguridad 911 y monitoreo VeloX desplegadas a tus coordenadas GPS.`,
      type: 'security',
      date: 'Ahora mismo',
      read: false,
    };
    setNotifications(prev => [alertNotif, ...prev]);
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setIsLoggedIn(true);
          setActiveTab('map');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col antialiased selection:bg-purple-600 selection:text-white transition-colors duration-300 ${
      theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* TOP STICKY HEADER */}
      <Header
        user={user}
        currency={currency}
        onToggleCurrency={handleToggleCurrency}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        notifications={notifications}
        onMarkNotificationRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        onClearNotifications={() => setNotifications([])}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* MAIN CONTAINER CONTENT BASED ON ACTIVE BOTTOM TAB */}
      <main className="flex-1 max-w-lg w-full mx-auto p-3 sm:p-4 pb-24 space-y-4">
        
        {/* TAB 1: INICIO / MAPA & SOLICITUD DE VIAJE */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            
            {/* Interactive Leaflet Map View */}
            <div className="h-[380px] sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl relative">
              <MapView
                ride={currentRide || {
                  id: 'temp',
                  category: selectedCategory,
                  pickupAddress,
                  dropoffAddress,
                  pickupCoords,
                  dropoffCoords,
                  distanceKm,
                  durationMins: 10,
                  priceUsd: calculatedPriceUsd,
                  priceVes: calculatedPriceVes,
                  paymentMethod,
                  status: 'idle',
                  createdAt: '',
                  etaDriverArrivalMins: 3,
                  etaTripArrivalMins: 10,
                }}
                onMapClick={handleMapClick}
                onOpenPanicModal={() => setIsPanicModalOpen(true)}
                driverLocation={driverLocation}
              />
            </div>

            {/* Ride Request Selector or Driver Details Overlay */}
            {currentRide && ['driver_assigned', 'driver_arriving', 'in_trip'].includes(currentRide.status) ? (
              <DriverDetailsCard
                ride={currentRide}
                currency={currency}
                onOpenDriverChat={() => setIsDriverChatOpen(true)}
                onOpenPanicModal={() => setIsPanicModalOpen(true)}
                onCancelRide={handleCancelRide}
                onFinishTrip={handleFinishTrip}
              />
            ) : (
              <RideSelector
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                pickupAddress={pickupAddress}
                dropoffAddress={dropoffAddress}
                onChangePickup={setPickupAddress}
                onChangeDropoff={setDropoffAddress}
                onSelectPresetLocation={handleSelectPresetLocation}
                distanceKm={distanceKm}
                priceUsd={calculatedPriceUsd}
                priceVes={calculatedPriceVes}
                paymentMethod={paymentMethod}
                onChangePaymentMethod={setPaymentMethod}
                walletBalanceUsd={walletBalanceUsd}
                onRequestRide={handleRequestRide}
                onOpenScheduleModal={() => {
                  if (!user.isVerified) {
                    setIsUnverifiedModalOpen(true);
                  } else {
                    setActiveTab('reservations');
                  }
                }}
                currency={currency}
                isSearchingDriver={isSearchingDriver}
                isUserVerified={user.isVerified}
                onGoToProfile={() => setActiveTab('profile')}
              />
            )}
          </div>
        )}

        {/* TAB 2: RESERVAS PROGRAMADAS */}
        {activeTab === 'reservations' && (
          <ReservationsView
            reservations={reservations}
            onAddReservation={(res) => setReservations(prev => [res, ...prev])}
            onCancelReservation={(id) => setReservations(prev => prev.filter(r => r.id !== id))}
            currency={currency}
            isUserVerified={user.isVerified}
            onRequireVerification={() => setIsUnverifiedModalOpen(true)}
          />
        )}

        {/* TAB 3: BILLETERA & RECARGAS PAGO MÓVIL/ZINLI/BINANCE */}
        {activeTab === 'wallet' && (
          <WalletView
            balanceUsd={walletBalanceUsd}
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            currency={currency}
          />
        )}

        {/* TAB 4: HISTORIAL DE VIAJES Y EVALUACIONES */}
        {activeTab === 'history' && (
          <TripHistoryView
            currency={currency}
            onOpenSupportForTrip={(tripId) => {
              setSupportTripId(tripId);
              setIsSupportChatOpen(true);
            }}
          />
        )}

        {/* TAB 5: PERFIL, AUTENTICACIÓN Y VALIDACIÓN CÉDULA */}
        {activeTab === 'profile' && (
          <ProfileAuthView
            user={user}
            onUpdateUser={setUser}
            onOpenSupport={() => setIsSupportChatOpen(true)}
            onLogout={handleLogout}
          />
        )}

        {/* OVERLAY SUPPORT CHAT MODAL IF TRIGGERED */}
        {isSupportChatOpen && (
          <div className="fixed inset-0 z-[2800] bg-slate-950/80 backdrop-blur-sm p-4 flex items-center justify-center">
            <SupportChatView
              initialTripId={supportTripId}
              onClose={() => {
                setIsSupportChatOpen(false);
                setSupportTripId(undefined);
              }}
            />
          </div>
        )}
      </main>

      {/* PANIC BUTTON SOS EMERGENCY MODAL */}
      <PanicButtonModal
        isOpen={isPanicModalOpen}
        onClose={() => setIsPanicModalOpen(false)}
        user={user}
        ride={currentRide}
        onSendEmergencyAlert={handleSendEmergencyAlert}
      />

      {/* IN-APP DRIVER CHAT MODAL */}
      {currentRide?.driver && (
        <InAppDriverChat
          isOpen={isDriverChatOpen}
          onClose={() => setIsDriverChatOpen(false)}
          driver={currentRide.driver}
          messages={driverChatMessages}
          onSendMessage={handleSendDriverMessage}
        />
      )}

      {/* UNVERIFIED USER MANDATORY KYC MODAL */}
      {isUnverifiedModalOpen && (
        <div className="fixed inset-0 z-[3000] bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4 text-center relative">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/40 shadow-lg">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Validación de Identidad Requerida</h3>
              <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                Requisito obligatorio para pedir servicios
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              Hola <strong className="text-white">{user.name}</strong>, por regulación y seguridad de Vixy Taxi en Venezuela, debes subir tu <strong className="text-amber-400">Cédula de Identidad</strong> y selfie en tu perfil antes de poder solicitar viajes, taxis o servicios de encomienda.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsUnverifiedModalOpen(false);
                  setActiveTab('profile');
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 transition active:scale-95"
              >
                VALIDAR CÉDULA Y PERFIL AHORA 🆔
              </button>

              <button
                type="button"
                onClick={() => setIsUnverifiedModalOpen(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                Entendido, más tarde
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED TRIP RECEIPT & RATING MODAL */}
      {completedRideForModal && (
        <TripCompletedModal
          ride={completedRideForModal}
          currency={currency}
          onFinishAndRate={handleFinishAndRateTrip}
        />
      )}

      {/* BOTTOM NAVIGATION TAB BAR */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadNotifsCount={notifications.filter(n => !n.read).length}
      />
    </div>
  );
}
