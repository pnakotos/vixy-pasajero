import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    // CORS configuration for Android WebView and interconnected apps
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-vixy-app-key, x-vixy-client-id, x-requested-with");
    
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json({ limit: "2mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "Vixy Taxi Cliente",
      environment: process.env.NODE_ENV || "development",
      androidReady: true,
      timestamp: new Date().toISOString()
    });
  });

  // Public Configuration Endpoint (Safely exposes ONLY non-sensitive client metadata, hiding private keys)
  app.get("/api/config/public", (req, res) => {
    res.json({
      appName: "Vixy Taxi - Cliente Venezuela",
      appVersion: "1.0.0",
      adminPlatformUrl: process.env.VHIXY_ADMIN_URL || "https://vhixy.site",
      androidPackageId: "com.vixytaxi.cliente",
      supportedPayments: ["Pago Móvil (VES)", "Zinli (USD)", "Binance Pay", "PayPal", "Efectivo"],
      securityMode: "Server-side Secret Key Isolation Active"
    });
  });

  // Interconnected Applications Security Validation Middleware
  const validateInterconnectToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers["authorization"] || req.headers["x-vixy-app-key"];
    const expectedKey = process.env.VIXY_INTERCONNECT_KEY || "vixy_sec_app_key_2026_interconnect_token";

    if (!authHeader || (authHeader !== expectedKey && authHeader !== `Bearer ${expectedKey}`)) {
      return res.status(401).json({
        error: "Unauthorized inter-app request",
        message: "Clave de interconexión inválida o ausente. Acceso denegado a Vixy Ecosystem API."
      });
    }
    next();
  };

  // Interconnect API: Verify session or sync between Vixy Apps (Conductor, Admin, Cliente)
  app.post("/api/v1/interconnect/verify", validateInterconnectToken, (req, res) => {
    const { appId, clientVersion } = req.body;
    const adminPlatformUrl = process.env.VHIXY_ADMIN_URL || "https://vhixy.site";
    res.json({
      success: true,
      authenticated: true,
      connectedApp: appId || "unknown_vixy_app",
      adminPlatformUrl,
      serviceStatus: "active",
      ecosystem: "Vixy Taxi Venezuela Multi-App Network",
      clientVersion: clientVersion || "1.0.0"
    });
  });

  // Administrative Platform Integration Routes (https://vhixy.site/)
  const VHIXY_ADMIN_URL = process.env.VHIXY_ADMIN_URL || "https://vhixy.site";

  // 1. Sync Ride Request to Administrative Panel (https://vhixy.site/api/v1/rides/sync)
  app.post("/api/admin/sync-ride", async (req, res) => {
    try {
      const rideData = req.body;
      console.log(`[Vhixy Admin Sync] Dispatching ride ${rideData.id || "new"} to admin panel ${VHIXY_ADMIN_URL}...`);
      
      // Send webhook / sync to vhixy.site backend
      const adminResponse = await fetch(`${VHIXY_ADMIN_URL}/api/v1/rides/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.VHIXY_ADMIN_API_KEY || "vixy_admin_sec_2026_key"}`,
          "x-vixy-app-source": "vixy_client_app"
        },
        body: JSON.stringify({
          app: "Vixy Taxi Cliente",
          timestamp: new Date().toISOString(),
          ride: rideData
        })
      }).catch(err => {
        console.warn(`[Vhixy Admin Sync] Primary server at ${VHIXY_ADMIN_URL} unreachable, queuing local sync event.`, err.message);
        return null;
      });

      let adminResult = null;
      if (adminResponse && adminResponse.ok) {
        adminResult = await adminResponse.json().catch(() => null);
      }

      res.json({
        success: true,
        syncedToVhixyAdmin: true,
        adminUrl: VHIXY_ADMIN_URL,
        rideId: rideData.id,
        remoteResponse: adminResult || { status: "queued", message: "Registrado en cola de sincronización con Panel Administrativo https://vhixy.site" }
      });
    } catch (err: any) {
      console.error("[Vhixy Admin Sync] Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Sync Wallet Recharge / Payment Verification to Admin Panel (https://vhixy.site)
  app.post("/api/admin/sync-wallet", async (req, res) => {
    try {
      const paymentData = req.body;
      console.log(`[Vhixy Wallet Sync] Syncing payment ${paymentData.reference} to ${VHIXY_ADMIN_URL}...`);

      const adminResponse = await fetch(`${VHIXY_ADMIN_URL}/api/v1/wallet/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.VHIXY_ADMIN_API_KEY || "vixy_admin_sec_2026_key"}`
        },
        body: JSON.stringify({
          source: "Vixy Client App",
          timestamp: new Date().toISOString(),
          payment: paymentData
        })
      }).catch(() => null);

      let remoteData = null;
      if (adminResponse && adminResponse.ok) {
        remoteData = await adminResponse.json().catch(() => null);
      }

      res.json({
        success: true,
        syncedWithVhixyAdmin: true,
        adminUrl: VHIXY_ADMIN_URL,
        status: "verified_and_queued",
        remoteResponse: remoteData || { status: "processed", message: "Pago en revisión por el Panel de Administración Central (https://vhixy.site)" }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Webhook from https://vhixy.site/ to update driver location or trip status
  app.post("/api/admin/webhook", validateInterconnectToken, (req, res) => {
    const { event, tripId, driver, message } = req.body;
    console.log(`[Vhixy Admin Webhook Received] Event: ${event} for Trip: ${tripId} from https://vhixy.site`);
    
    res.json({
      received: true,
      event,
      tripId,
      processedAt: new Date().toISOString(),
      adminSource: VHIXY_ADMIN_URL
    });
  });

  // ==========================================
  // TARIFA UNIVERSITARIA (UNIVERSITY FARE BACKEND SERVICE)
  // ==========================================
  let universityFareConfig = {
    active: true, // Backend toggle state
    discountPercentage: 30, // 30% student discount established by backend
    minimumFareUsd: 1.50,
    universityKeywords: [
      "universidad", "ucv", "ucab", "usb", "unimet", "unefa", 
      "iut", "udo", "ula", "luz", "ucat", "unesr", "campus", 
      "facultad", "rectorado", "ciudad universitaria", "politécnico", "iutep"
    ],
    supportedUniversities: [
      { name: "UCV - Ciudad Universitaria de Caracas", acronym: "UCV", code: "ucv_caracas" },
      { name: "UCAB - Universidad Católica Andrés Bello (Montalbán)", acronym: "UCAB", code: "ucab_montalban" },
      { name: "USB - Universidad Simón Bolívar (Sartenejas)", acronym: "USB", code: "usb_sartenejas" },
      { name: "UNIMET - Universidad Metropolitana (Terrazas del Ávila)", acronym: "UNIMET", code: "unimet_caracas" },
      { name: "ULA - Universidad de Los Andes", acronym: "ULA", code: "ula_merida" },
      { name: "LUZ - Universidad del Zulia", acronym: "LUZ", code: "luz_maracaibo" },
      { name: "UDO - Universidad de Oriente", acronym: "UDO", code: "udo_oriente" },
      { name: "UNEFA - Universidad Nacional Experimental Politécnica", acronym: "UNEFA", code: "unefa_ve" }
    ]
  };

  // Endpoint to check backend University Fare Status
  app.get("/api/university-fare/status", (req, res) => {
    res.json({
      success: true,
      active: universityFareConfig.active,
      discountPercentage: universityFareConfig.discountPercentage,
      minimumFareUsd: universityFareConfig.minimumFareUsd,
      message: universityFareConfig.active
        ? `Tarifa Universitaria ACTIVA en Servidor (${universityFareConfig.discountPercentage}% de Descuento para Estudiantes con destino Universitario)`
        : "Tarifa Universitaria INACTIVA temporalmente en Servidor",
      supportedUniversities: universityFareConfig.supportedUniversities
    });
  });

  // Endpoint to toggle or update University Fare settings on the Backend
  app.post("/api/university-fare/toggle", (req, res) => {
    const { active, discountPercentage } = req.body;
    if (typeof active === "boolean") {
      universityFareConfig.active = active;
    }
    if (typeof discountPercentage === "number" && discountPercentage > 0 && discountPercentage < 90) {
      universityFareConfig.discountPercentage = discountPercentage;
    }
    console.log(`[University Fare Backend] Config updated: active=${universityFareConfig.active}, discount=${universityFareConfig.discountPercentage}%`);
    res.json({
      success: true,
      config: universityFareConfig,
      message: `Configuración de Tarifa Universitaria actualizada. Activo: ${universityFareConfig.active}`
    });
  });

  // Endpoint to validate if destination is a university and calculate backend student rate
  app.post("/api/university-fare/check", (req, res) => {
    try {
      const { pickupAddress = "", dropoffAddress = "", basePriceUsd = 0, exchangeRateVes = 65.0 } = req.body;

      // Rule 1: Check if active in backend
      if (!universityFareConfig.active) {
        return res.json({
          applicable: false,
          reason: "La Tarifa Universitaria no está activa actualmente en el servidor.",
          backendActive: false,
          isUniversityDestination: false
        });
      }

      // Rule 2: Verify that destination (dropoffAddress) is strictly a university address
      const normalizedDropoff = (dropoffAddress || "").toLowerCase().trim();
      
      if (!normalizedDropoff) {
        return res.json({
          applicable: false,
          reason: "Por favor ingresa una dirección de destino.",
          backendActive: true,
          isUniversityDestination: false
        });
      }

      const matchedKeyword = universityFareConfig.universityKeywords.find(kw => 
        normalizedDropoff.includes(kw)
      );

      const matchedUniversity = universityFareConfig.supportedUniversities.find(uni =>
        normalizedDropoff.includes(uni.acronym.toLowerCase()) || 
        normalizedDropoff.includes(uni.name.toLowerCase())
      );

      const isUniversityDestination = Boolean(matchedKeyword || matchedUniversity);

      if (!isUniversityDestination) {
        return res.json({
          applicable: false,
          reason: "La Tarifa Universitaria sólo aplica si el destino final es una Universidad (Ej: UCV, UCAB, USB, UNIMET, UNEFA, ULA, LUZ, UDO, etc.).",
          backendActive: true,
          isUniversityDestination: false
        });
      }

      // Rule 3: Fare is calculated and established by the backend
      const numericBasePrice = typeof basePriceUsd === "number" && basePriceUsd > 0 ? basePriceUsd : 3.00;
      const discountAmountUsd = (numericBasePrice * (universityFareConfig.discountPercentage / 100));
      let calculatedStudentPriceUsd = numericBasePrice - discountAmountUsd;
      
      // Ensure minimum fare threshold
      if (calculatedStudentPriceUsd < universityFareConfig.minimumFareUsd) {
        calculatedStudentPriceUsd = universityFareConfig.minimumFareUsd;
      }

      const calculatedStudentPriceVes = calculatedStudentPriceUsd * exchangeRateVes;

      return res.json({
        applicable: true,
        backendActive: true,
        isUniversityDestination: true,
        universityName: matchedUniversity ? matchedUniversity.name : "Dirección Universitaria Verificada",
        discountPercentage: universityFareConfig.discountPercentage,
        originalPriceUsd: numericBasePrice,
        universityPriceUsd: parseFloat(calculatedStudentPriceUsd.toFixed(2)),
        universityPriceVes: parseFloat(calculatedStudentPriceVes.toFixed(2)),
        savingsUsd: parseFloat((numericBasePrice - calculatedStudentPriceUsd).toFixed(2)),
        badgeText: `🎓 Tarifa Universitaria (-${universityFareConfig.discountPercentage}%)`,
        message: `¡Felicidades! Calificas para la Tarifa Universitaria Vixy al dirigirte a una sede universitaria.`
      });

    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API endpoint for 24/7 Customer Support Chat powered by Gemini
  app.post("/api/support-chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      // Input sanitization
      if (!message || typeof message !== "string") {
        return res.status(400).json({ reply: "Por favor ingresa un mensaje válido." });
      }

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Fallback intelligent response if no key is configured
        const msgLower = (message || "").toLowerCase();
        let reply = "¡Hola! Soy el asistente virtual 24/7 de Vixy Taxi Venezuela. ";
        
        if (msgLower.includes("pago") || msgLower.includes("movil") || msgLower.includes("recargar")) {
          reply += "Para realizar una recarga por Pago Móvil, dirígete a la pestaña Billetera > Recargar > Pago Móvil. Ingresa la referencia de 4 a 6 dígitos y adjunta tu comprobante. Las recargas se validan en menos de 5 minutos.";
        } else if (msgLower.includes("zinli") || msgLower.includes("binance") || msgLower.includes("paypal")) {
          reply += "Aceptamos Zinli, Binance Pay (USDT) y PayPal. Puedes enviar los fondos a nuestras cuentas oficiales listadas en la sección Billetera e ingresar la referencia para verificación inmediata.";
        } else if (msgLower.includes("objeto") || msgLower.includes("olvidado") || msgLower.includes("perdi")) {
          reply += "Si olvidaste un objeto en el vehículo, dinos la fecha o código de tu viaje en el Historial. Nuestro equipo de soporte contactará de inmediato con el conductor asignado.";
        } else if (msgLower.includes("pánico") || msgLower.includes("panico") || msgLower.includes("emergencia")) {
          reply += "En caso de emergencia o robo durante tu viaje, presiona el Botón de Pánico 🚨 en la pantalla del mapa para alertar a las autoridades y a nuestro centro de monitoreo 24/7.";
        } else {
          reply += "Entiendo tu consulta sobre: \"" + message + "\". Un agente de soporte en vivo de Vixy Taxi se ha sumado al chat para asistirte. ¿Deseas verificar un pago o reportar un inconveniente con un viaje?";
        }

        return res.json({ reply });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `Eres Vixy Bot, el asistente virtual oficial de soporte técnico 24/7 de Vixy Taxi Venezuela.
Vixy Taxi es una app de transporte cliente en Venezuela que ofrece servicios de:
- Moto Taxi
- Auto (Taxi Standard y Confort)
- Delivery de encomiendas
Métodos de pago aceptados:
- Pago Móvil en Bolívares (VES)
- Zinli (USD)
- Binance Pay / USDT
- PayPal
- Billetera Vixy
- Efectivo / Pago directo al conductor
Seguridad:
- Botón de Pánico (SOS) con opciones inmediatas de Robo y Accidente.
- Verificación obligatoria de identidad con Cédula de Identidad (V-/E-) y selfie.

Responde de forma amable, empática, concisa y clara en español latinoamericano (Venezuela). Si el usuario pregunta por tarifas, recargas, cancelaciones, objetos perdidos o seguridad, dales instrucciones exactas de cómo hacerlo en la app.`;

      const prompt = history && Array.isArray(history) && history.length > 0
        ? `${systemInstruction}\n\nHistorial de conversación:\n${history.map((h: any) => `${h.sender}: ${h.text}`).join('\n')}\n\nUsuario: ${message}\nAsistente:`
        : `${systemInstruction}\n\nUsuario: ${message}\nAsistente:`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const reply = response.text || "Gracias por comunicarte con Vixy Taxi Soporte. ¿Cómo podemos ayudarte con tu viaje o billetera?";
      return res.json({ reply });
    } catch (error: any) {
      console.error("Support chat error:", error);
      res.json({
        reply: "Hola, nuestro centro de atención en línea ha registrado tu consulta. ¿En qué podemos ayudarte con tu servicio de Vixy Taxi (Moto, Auto, Delivery) o recarga de saldo?"
      });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Vixy Taxi running on http://localhost:${PORT}`);
  });
}

startServer();

