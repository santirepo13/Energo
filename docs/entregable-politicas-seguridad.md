# Entregable — Políticas de Seguridad del Sitio (Login + Dashboard)

Este documento describe las políticas y controles de seguridad que ya aplica el proyecto Energo, con referencias a código, y sugiere el “antes/después” para tu tarea (sin y con medidas). Está listo para copiar/pegar en tu informe DOCX.

Índice:
- Alcance y arquitectura
- Políticas actualmente implementadas (con referencias)
- Políticas requeridas por la tarea (contraseñas, cifrado, logging)
- Estado ANTES vs DESPUÉS (checklist)
- Guía de despliegue en Ubuntu/Kali
- Guía de escaneo y evidencias (Nmap, OWASP ZAP/Burp, Metasploit, CERA/Nexus)

## 1) Alcance y arquitectura
- Frontend en Vite/React consumiendo API REST del backend.
- Backend en Express + MySQL.
- Autenticación basada en sesión (cookie) y RBAC (roles admin/audit/user).

## 2) Políticas implementadas actualmente (con evidencias)

2.1 Gestión de configuración y secretos
- Carga de variables de entorno con dotenv desde múltiples ubicaciones: [server/src/server.ts](server/src/server.ts:1), [server/src/server.ts](server/src/server.ts:5), [server/src/server.ts](server/src/server.ts:13)
- Variables sensibles: `SESSION_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: [server/src/server.ts](server/src/server.ts:25), [server/src/server.ts](server/src/server.ts:29)
- Archivos de ejemplo: [server/.env.example](server/.env.example), [server/.env.linux](server/.env.linux)
- Nota: valor por defecto inseguro para desarrollo: `'insecure-dev-secret'` [server/src/server.ts](server/src/server.ts:25)

2.2 Control de origen y cookies (CORS)
- CORS restringido a `CLIENT_ORIGIN` y con credenciales: [server/src/server.ts](server/src/server.ts:63)
- El cliente Axios envía cookies: [src/api/client.ts](src/api/client.ts:3), [src/api/client.ts](src/api/client.ts:5)

2.3 Gestión de sesión
- Sesiones con express-session: [server/src/server.ts](server/src/server.ts:74)
- Configuración: `resave: false`, `saveUninitialized: false`, `cookie.secure: false` (solo dev): [server/src/server.ts](server/src/server.ts:76)
- Clave de sesión desde `SESSION_SECRET`: [server/src/server.ts](server/src/server.ts:76)
- Por defecto, cookie httpOnly está activa (mitiga lectura vía XSS).

2.4 Autenticación
- Login POST `/api/login`: [server/src/server.ts](server/src/server.ts:284)
- Verificación con bcrypt.compare: [server/src/server.ts](server/src/server.ts:306)
- Asignación de datos de sesión al autenticar: [server/src/server.ts](server/src/server.ts:319)
- Estados bloqueados en login: `Deshabilitado`, `Suspendido`: [server/src/server.ts](server/src/server.ts:312)
- Registro POST `/api/register` con hash bcrypt costo 10: [server/src/server.ts](server/src/server.ts:228)
- Dependencia: bcryptjs [server/package.json](server/package.json:13)

2.5 Autorización y RBAC
- [function requireAuth()](server/src/server.ts:355): sesión obligatoria y revalidación de estado: [server/src/server.ts](server/src/server.ts:360)
- [function requireAdmin()](server/src/server.ts:374): solo rol `admin`
- [function requireAudit()](server/src/server.ts:389): solo rol `audit`
- Rutas protegidas admin/audit: [server/src/server.ts](server/src/server.ts:675), [server/src/server.ts](server/src/server.ts:697), [server/src/server.ts](server/src/server.ts:729), [server/src/server.ts](server/src/server.ts:766), [server/src/server.ts](server/src/server.ts:405), [server/src/server.ts](server/src/server.ts:427), [server/src/server.ts](server/src/server.ts:464)

2.6 Estados de cuenta aplicados a operaciones
- Revalidación de estado por request autenticada: [server/src/server.ts](server/src/server.ts:360)
- Bloqueo de recargas en `Pausa/Deshabilitado/Suspendido`: [server/src/server.ts](server/src/server.ts:602)

2.7 Auditoría y registros de seguridad
- [function logSecurity()](server/src/server.ts:87) escribe en `security_logs` (evento, usuario, IP, detalles).
- Captura de IP del cliente: [function clientIp()](server/src/server.ts:83)
- Eventos registrados: registro duplicado, errores/éxitos de login, logout, recarga, links de reset (mock), errores de parseo JSON, etc.: [server/src/server.ts](server/src/server.ts:165), [server/src/server.ts](server/src/server.ts:270), [server/src/server.ts](server/src/server.ts:324), [server/src/server.ts](server/src/server.ts:647), [server/src/server.ts](server/src/server.ts:801)

2.8 Manejo de errores de JSON
- Middleware que captura SyntaxError y registra cuerpo crudo + metadatos: [server/src/server.ts](server/src/server.ts:792)

2.9 Integridad y concurrencia
- Transacciones y bloqueos: registro: [server/src/server.ts](server/src/server.ts:156), [server/src/server.ts](server/src/server.ts:269); recargas: [server/src/server.ts](server/src/server.ts:625), [server/src/server.ts](server/src/server.ts:646)
- Bloqueo de filas `FOR UPDATE`: códigos empleado: [server/src/server.ts](server/src/server.ts:188); tarjetas: [server/src/server.ts](server/src/server.ts:627)
- Manejo de duplicados `ER_DUP_ENTRY` en tarjetas: [server/src/server.ts](server/src/server.ts:242)

2.10 Prevención de inyección SQL
- Uso consistente de placeholders `?` con mysql2 (consultas parametrizadas): ejemplos en login [server/src/server.ts](server/src/server.ts:292), registro [server/src/server.ts](server/src/server.ts:159), inserciones/updates [server/src/server.ts](server/src/server.ts:230), [server/src/server.ts](server/src/server.ts:638), [server/src/server.ts](server/src/server.ts:718)

2.11 Salida de sesión
- POST `/api/logout` destruye la sesión y registra el evento: [server/src/server.ts](server/src/server.ts:665)

2.12 Otros
- Generación de PIN (no criptográfica) 15 dígitos: [function generatePin15()](server/src/server.ts:582)
- Health-check: `/api/health`: [server/src/server.ts](server/src/server.ts:134)

## 3) Políticas requeridas por la tarea

3.1 Política de contraseñas (propuesta formal)
- Longitud mínima: 12 caracteres; recomendada 16+.
- Complejidad: al menos 3 clases (mayúsculas, minúsculas, dígitos, símbolos).
- No reutilizar ni usar contraseñas expuestas (verificación contra listas de brechas).
- Caducidad: no forzada periódicamente; sí rotación tras incidente.
- Intentos de login: máximo 5 fallos → bloqueo temporal 15 min; exponencial backoff.
- Almacenamiento: hash con bcrypt costo 10–12 [server/src/server.ts](server/src/server.ts:228); NO almacenar en texto claro.
- Doble factor (opcional) para cuentas admin/audit.

3.2 Configuración de cifrado (propuesta formal)
- En tránsito: TLS 1.2/1.3 obligatorio entre cliente ↔ servidor.
- Generación de clave y certificado con OpenSSL (entorno lab/dev):
  - `openssl genrsa -out server.key 4096`
  - `openssl req -new -key server.key -out server.csr -subj "/CN=energo.local"`
  - `openssl x509 -req -in server.csr -signkey server.key -out server.crt -days 365 -sha256`
- Endurecer suites TLS en el proxy (Nginx/Apache) y redirigir HTTP→HTTPS.
- Contraseñas: hash bcrypt (no cifrado reversible) [server/src/server.ts](server/src/server.ts:228).
- Aleatoriedad: reemplazar `Math.random` por RNG criptográfico para PIN en producción [server/src/server.ts](server/src/server.ts:582).

3.3 Política de logs (propuesta formal)
- Registrar: autenticación (éxitos y fallos), cambios de estado/rol, operaciones críticas (recargas), errores de parsing y de servidor.
- No registrar: contraseñas, tokens, datos sensibles de tarjetas; minimizar datos personales en `details`.
- Campos mínimos: tipo de evento, timestamp, usuario (si aplica), IP, detalles limitados: [function logSecurity()](server/src/server.ts:87)
- Retención: 90 días en lab; rotación semanal; acceso restringido a auditores.
- Revisión periódica y alertas básicas (fallos de login repetidos por IP/usuario).

## 4) Estado ANTES vs DESPUÉS (resumen)

ANTES (baseline sin endurecimiento):
- Cookie de sesión sin `secure` (dev): [server/src/server.ts](server/src/server.ts:79)
- Sin CSRF; cookies con credenciales: [server/src/server.ts](server/src/server.ts:63), [src/api/client.ts](src/api/client.ts:5)
- Sin cabeceras de seguridad (Helmet).
- Sin rate limiting.
- PIN no criptográficamente seguro: [server/src/server.ts](server/src/server.ts:582)

DESPUÉS (endurecido para la entrega):
- Activar `cookie.secure: true` y `sameSite: 'lax'|'strict'` (en producción).
- Añadir CSRF por token/cabecera para POST/PUT/PATCH/DELETE.
- Añadir Helmet (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- Añadir rate limiting por IP/ruta (login, recarga).
- Regeneración de sesión tras login (anti fijación).
- Validación de payloads con Zod/Joi y sanitización uniforme.
- RNG criptográfico para PIN (Node `crypto.randomInt`).
- TLS 1.2/1.3 con proxy inverso y redirección 80→443.

## 5) Guía de despliegue rápida (Ubuntu/Kali)
- Sistema: Ubuntu Server o Kali Linux actualizados.
- Variables `.env`: usar `SESSION_SECRET` fuerte; no usar defaults: [server/.env.example](server/.env.example)
- Base de datos MySQL: crear usuario con mínimos privilegios y contraseña robusta.
- Backend: `cd server && npm run build && npm start` o correr con PM2/ systemd.
- Proxy Nginx (recomendado): servir HTTPS con `server.crt/server.key` y hacer proxy a `http://127.0.0.1:4000`.
- Cortafuegos (ufw): permitir solo 22, 80, 443. Cerrar 5173 y 4000 desde WAN.
- Logs: redirigir stdout a journald o archivos rotados (logrotate).

## 6) Guía de escaneo y evidencias

6.1 Nmap (descubrimiento de puertos y servicios)
- Descubrimiento completo: `nmap -sV -sC -O -p- <IP_SERVER>`
- Tras endurecer, esperar ver abiertos solo 80/443. Evidencias: captura de comandos y salida.

6.2 OWASP ZAP / BurpSuite (pruebas web)
- ZAP Quick Scan o Burp Active Scan contra `https://<host>`.
- ANTES: es probable que reporten falta de CSRF, cabeceras de seguridad ausentes y cookie sin `secure`.
- DESPUÉS: repetir escaneo y adjuntar comparación con hallazgos reducidos.

6.3 Metasploit (módulos genéricos)
- Verificar módulos para malas configuraciones HTTP/TLS; documentar ausencia de explotación directa.

6.4 CERA / Nexus (análisis de dependencias)
- Escanear `package.json` y dependencias para CVEs. Guardar reporte HTML/PDF.

6.5 Evidencias mínimas a adjuntar
- Capturas: Nmap ANTES/ DESPUÉS.
- Reporte ZAP/Burp ANTES/ DESPUÉS (resumen de issues resueltos).
- Extractos de logs de eventos relevantes (anonimizados): [function logSecurity()](server/src/server.ts:87)
- Configuración de Nginx/TLS y comandos OpenSSL usados.

## 7) Anexo — Snippets/Comandos útiles (Linux)
- Cambiar contraseña de usuario (sudo): `sudo passwd <usuario>`
- Políticas de expiración: `sudo chage -M 90 -m 7 -W 14 <usuario>`
- Generar claves/certificados (OpenSSL): ver sección 3.2.
- Activar ufw: `sudo ufw allow OpenSSH; sudo ufw allow 80,443/tcp; sudo ufw enable`
- Instalar fail2ban (opcional): `sudo apt install fail2ban`

— Fin del documento —