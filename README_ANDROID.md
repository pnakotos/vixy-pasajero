# 📱 Vixy Taxi - Guía de Compilación Android & Seguridad de Llaves

Esta aplicación ha sido preparada y optimizada para ser empaquetada como aplicación **Android nativa** (APK / AAB) utilizando **Capacitor** o **Trusted Web Activity (TWA)**.

---

## 🔒 Medidas de Seguridad Aplicadas (Protección de Llaves)

1. **Aislamiento de Llaves Secretas (Server-Side Secret Key Isolation)**:
   - La API Key de **Gemini AI** (`GEMINI_API_KEY`) **NUNCA** se incluye en el código fuente de la app Android ni en el bundle JS del cliente. Se procesa de forma segura a través del endpoint servidor `POST /api/support-chat`.
   - La clave de interconexión del ecosistema (`VIXY_INTERCONNECT_KEY`) y la clave del Panel Administrativo de **https://vhixy.site/** (`VHIXY_ADMIN_API_KEY`) permanecen almacenadas únicamente en variables de entorno del servidor.
   - Las solicitudes del cliente Android pasan por proxies protegidos en el backend (`/api/admin/sync-ride`, `/api/admin/sync-wallet`, `/api/v1/interconnect/verify`).

2. **Políticas CORS y Encabezados de Seguridad**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: SAMEORIGIN`
   - `Strict-Transport-Security` (HSTS)
   - CORS configurado para permitir solicitudes nativas desde esquemas de WebView Android: `https://localhost`, `capacitor://localhost`, `http://localhost`.

3. **Autenticación e Integridad Firebase**:
   - Firestore Security Rules (`firestore.rules`) garantizan que cada usuario solo pueda leer/modificar sus propios datos (`request.auth.uid == userId`).

---

## 🛠️ Pasos para Generar el APK o AAB de Android

### Requisitos Previos
- Node.js 18+ y npm
- Android Studio (con Android SDK 33+)

### 1. Generar la compilación Web
```bash
npm run build
```

### 2. Instalar Capacitor (si no está instalado localmente)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 3. Agregar y Sincronizar la plataforma Android
```bash
npx cap add android
npx cap copy android
npx cap sync
```

### 4. Abrir en Android Studio y Compilar APK/AAB
```bash
npx cap open android
```
En Android Studio:
1. Ve a **Build > Generate Signed Bundle / APK**.
2. Selecciona **APK** o **Android App Bundle (AAB)** para publicar en Google Play Store.
3. Elige tu Keystore de producción y compila la versión Release.

---

## ⚙️ Archivos de Configuración Android Creados
- `capacitor.config.json`: ID de paquete `com.vixytaxi.cliente`, esquema seguro HTTPS, ajustes de StatusBar y Keyboard.
- `public/manifest.json`: Web App Manifest para instalación PWA/Android.
- `public/icon.svg`: Icono vectorial oficial de Vixy Taxi.
