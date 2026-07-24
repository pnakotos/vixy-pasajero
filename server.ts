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
      timestamp: new Date().toISOString()
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
    res.json({
      success: true,
      authenticated: true,
      connectedApp: appId || "unknown_vixy_app",
      serviceStatus: "active",
      ecosystem: "Vixy Taxi Venezuela Multi-App Network",
      clientVersion: clientVersion || "1.0.0"
    });
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

