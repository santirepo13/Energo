# Políticas de seguridad implementadas en Energo

Este documento resume las políticas y controles de seguridad que el proyecto aplica actualmente, con referencias directas al código para su verificación.

## 1) Gestión de configuración y secretos (.env)

- Carga de variables de entorno con soporte multi-ubicación para Linux/Windows y dev/prod mediante dotenv: [server/src/server.ts](server/src/server.ts:1), [server/src/server.ts](server/src/server.ts:5), [server/src/server.ts](server/src/server.ts:13)
- Variables sensibles utilizadas:
  - Sesión: `SESSION_SECRET` [server/src/server.ts](server/src/server.ts:25)
  - Base de datos: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` [server/src/server.ts](server/src/server.ts:29)
- Archivos de ejemplo de entorno:
  - [server/.env.example](server/.env.example)
  - [server/.env.linux](server/.env.linux)

Riesgos y notas:
- Existe un valor por defecto inseguro para la clave de sesión en desarrollo: `'insecure-dev-secret'` [server/src/server.ts](server/src/server.ts:25)
- El archivo de ejemplo Linux contiene credenciales de BD de prueba [server/.env.linux](server/.env.linux), que no deben usarse en producción.

## 2) Control de origen y cookies del navegador (CORS)

- CORS restringido al origen configurado en `CLIENT_ORIGIN` y permitiendo credenciales (cookies): [server/src/server.ts](server/src/server.ts:63)
- El cliente Axios envía cookies con cada petición (withCredentials): [src/api/client.ts](src/api/client.ts:3), [src/api/client.ts](src/api/client.ts:5)

Implicación:
- Al usar cookies de sesión y CORS con credenciales, es crítico añadir protección CSRF (ver “Faltantes relevantes” más abajo).

## 3) Gestión de sesión y cookies

- Sesiones de servidor con `express-session`:
  - Configuración: `resave: false`, `saveUninitialized: false` [server/src/server.ts](server/src/server.ts:74)
  - Clave: `SESSION_SECRET` [server/src/server.ts](server/src/server.ts:76)
  - Cookie `secure: false` (solo dev; no HTTPS) [server/src/server.ts](server/src/server.ts:79)

Notas:
- `httpOnly` por defecto es `true` en `express-session`, mitigando XSS para lectura de la cookie.
- En producción, debe activarse `cookie.secure: true` y `sameSite` (`lax`/`strict`) para mitigar CSRF.

Dependencias relacionadas: `express-session` [server/package.json](server/package.json:17)

## 4) Autenticación de usuarios

- Inicio de sesión:
  - Endpoint: POST `/api/login` [server/src/server.ts](server/src/server.ts:284)
  - Verificación de credenciales con `bcrypt.compare` [server/src/server.ts](server/src/server.ts:306)
  - Establece datos de usuario en la sesión tras éxito [server/src/server.ts](server/src/server.ts:319)
  - Bloquea acceso si el estado del usuario es `Deshabilitado` o `Suspendido` [server/src/server.ts](server/src/server.ts:312)
- Registro de usuarios:
  - Endpoint: POST `/api/register` [server/src/server.ts](server/src/server.ts:138)
  - Hash de contraseñas con `bcrypt.hash` costo 10 [server/src/server.ts](server/src/server.ts:228)

Dependencias relacionadas: `bcryptjs` [server/package.json](server/package.json:13)

## 5) Autorización y control de acceso basado en roles (RBAC)

- Middleware de autenticación:
  - [function requireAuth()](server/src/server.ts:355): exige sesión válida y revalida estado del usuario en cada request [server/src/server.ts](server/src/server.ts:360)
- Middlewares de autorización:
  - [function requireAdmin()](server/src/server.ts:374): restringe endpoints a rol `admin`
  - [function requireAudit()](server/src/server.ts:389): restringe endpoints a rol `audit`
- Rutas protegidas (ejemplos):
  - Admin: listar usuarios [server/src/server.ts](server/src/server.ts:675), actualizar email [server/src/server.ts](server/src/server.ts:697), actualizar estado [server/src/server.ts](server/src/server.ts:729), enviar enlace de reset (mock) [server/src/server.ts](server/src/server.ts:766)
  - Auditoría: listar admins [server/src/server.ts](server/src/server.ts:405), actualizar estado de admin [server/src/server.ts](server/src/server.ts:427), métricas [server/src/server.ts](server/src/server.ts:464)

## 6) Gestión de estados de cuenta y restricciones operativas

- Bloqueo por estado en login: `Deshabilitado`, `Suspendido` [server/src/server.ts](server/src/server.ts:312)
- Revalidación de estado en cada request autenticada [server/src/server.ts](server/src/server.ts:360)
- Bloqueo de recargas en estados: `Pausa`, `Deshabilitado`, `Suspendido` [server/src/server.ts](server/src/server.ts:602)

## 7) Registro (auditoría) de eventos de seguridad

- Función de logging a tabla `security_logs`: [function logSecurity()](server/src/server.ts:87)
- Captura de IP del cliente: [function clientIp()](server/src/server.ts:83)
- Eventos registrados (ejemplos): duplicados de registro, errores de registro/login, éxitos de login, logout, recargas, enlaces de reset (mock), errores de parseo de JSON, etc. Ver llamadas a `logSecurity` en múltiples endpoints, p.ej. [server/src/server.ts](server/src/server.ts:165), [server/src/server.ts](server/src/server.ts:270), [server/src/server.ts](server/src/server.ts:324), [server/src/server.ts](server/src/server.ts:647), [server/src/server.ts](server/src/server.ts:801)

## 8) Manejo de errores de parseo JSON (fortalece observabilidad/forénsica)

- Middleware para capturar y responder errores de JSON malformado, registrando el cuerpo crudo y metadatos: [server/src/server.ts](server/src/server.ts:792)

## 9) Integridad de datos y control de concurrencia

- Uso de transacciones y bloqueos para consistencia:
  - Registro de usuario: `beginTransaction`/`commit`/`rollback` [server/src/server.ts](server/src/server.ts:156), [server/src/server.ts](server/src/server.ts:269)
  - Recargas: transacción, actualización atómica y generación de PIN [server/src/server.ts](server/src/server.ts:625), [server/src/server.ts](server/src/server.ts:646)
  - Bloqueo de fila con `FOR UPDATE` para códigos de empleado y tarjetas de energía: [server/src/server.ts](server/src/server.ts:188), [server/src/server.ts](server/src/server.ts:627)
- Manejo de condiciones de carrera y duplicados (errores `ER_DUP_ENTRY`): [server/src/server.ts](server/src/server.ts:242)

## 10) Prevención de inyección SQL

- Todas las consultas usan placeholders parametrizados (`?`) con mysql2, evitando concatenación de strings. Ejemplos:
  - Búsqueda de usuario en login [server/src/server.ts](server/src/server.ts:292)
  - Comprobación de duplicados en registro [server/src/server.ts](server/src/server.ts:159)
  - Inserciones y actualizaciones varias [server/src/server.ts](server/src/server.ts:230), [server/src/server.ts](server/src/server.ts:638), [server/src/server.ts](server/src/server.ts:643), [server/src/server.ts](server/src/server.ts:718)

Dependencia relacionada: `mysql2` [server/package.json](server/package.json:18)

## 11) Validaciones de entrada a nivel de API

- Reglas mínimas presentes:
  - Campos obligatorios en registro [server/src/server.ts](server/src/server.ts:148)
  - Campos obligatorios en login [server/src/server.ts](server/src/server.ts:286)
  - Validación de parámetros de recarga [server/src/server.ts](server/src/server.ts:595)
  - Validación de estados permitidos (admin/audit) [server/src/server.ts](server/src/server.ts:443), [server/src/server.ts](server/src/server.ts:745)
  - Comprobaciones de duplicados: usuario/email/tarjeta [server/src/server.ts](server/src/server.ts:159), [server/src/server.ts](server/src/server.ts:171), [server/src/server.ts](server/src/server.ts:712)

## 12) Cierre de sesión (higiene de sesión)

- Endpoint de logout destruye la sesión del usuario y registra el evento [server/src/server.ts](server/src/server.ts:665)

## 13) Generación de códigos de recarga

- Generación de PIN de 15 dígitos: [function generatePin15()](server/src/server.ts:582)

## 14) Supervisión/Salud del servicio

- Endpoint de health-check sin información sensible: `/api/health` [server/src/server.ts](server/src/server.ts:134)

---

## Faltantes relevantes (no implementado actualmente, recomendado)

Estos controles no se observan en el código y se recomiendan para fortalecer la postura de seguridad:

- Protección CSRF para rutas con cookies de sesión (p.ej., tokens CSRF por sesión/forma/cabecera).
- Cabeceras de seguridad (Helmet: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- Rate limiting y protección anti-fuerza bruta/cuenta por IP/ruta.
- Rotación de ID de sesión al iniciar sesión (prevención de fijación de sesión).
- Políticas de cookies endurecidas en producción: `secure: true`, `sameSite: 'lax'/'strict'`, `domain`/`path` adecuados.
- Validación robusta de payloads (Joi/Zod/Yup) y sanitización uniforme.
- Complejidad y política de contraseñas; bloqueo tras intentos fallidos (temporal/captcha).
- Uso de RNG criptográfico cuando el PIN tenga valor económico o sensibilidad (actualmente usa `Math.random`).
- TLS/HTTPS forzado en producción (backend y `CLIENT_ORIGIN`) y redirecciones 80→443.
- Registros y retención: rotación y anonimización de datos sensibles en `security_logs`.
- Gestión segura del flujo de reset de contraseña (el actual es “mock” y solo registra/retorna un enlace de prueba) [server/src/server.ts](server/src/server.ts:766).

---

## Resumen

El backend aplica:
- Gestión de secretos vía dotenv, CORS con credenciales, sesiones de servidor, autenticación con hash bcrypt, autorización RBAC por middlewares, bloqueo por estados de cuenta, registros de seguridad centralizados, transacciones y bloqueos para integridad, queries parametrizadas contra inyección SQL y validaciones básicas.

Para producción, es prioritario agregar CSRF, Helmet, rate limiting, endurecer cookies de sesión, rotación de sesión, validación de esquema y TLS estricto.