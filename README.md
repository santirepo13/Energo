# Energo

<p align="center">
  <img src="./src/assets/logo.png" alt="Energo Logo" width="120">
</p>

<p align="center">
  <a href="https://energoapi.gosr.lol"><strong>API</strong></a> ·
  <a href="https://energo.gosr.lol"><strong>Frontend</strong></a>
</p>

Sistema de gestión de energía prepagada que permite a los usuarios administrar su consumo energético a través de medidores prepagados. Los usuarios pueden registrarse, vincular tarjetas de energía (medidores), recargar crédito por monto en COP, por kWh o mediante código PIN, y consultar su historial de recargas. El sistema soporta tres roles — Usuario Regular, Administrador y Auditor — cada uno con paneles y capacidades específicas.

---

## Arquitectura

```
energo/
├── src/                    # Frontend web (React + TypeScript + Vite)
│   ├── api/                #   Módulos cliente de API con Axios
│   ├── components/         #   Componentes compartidos (ErrorBoundary)
│   ├── pages/              #   Componentes de cada ruta
│   ├── App.tsx             #   App raíz con enrutamiento y navegación
│   └── main.tsx            #   Punto de entrada
│
├── server/                 # API backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/         #   Configuración
│   │   ├── middleware/     #   Middleware Express (auth, RBAC, validación)
│   │   ├── models/         #   Modelos de datos
│   │   ├── services/       #   Capa de lógica de negocio
│   │   ├── repositories/   #   Capa de acceso a datos
│   │   ├── routes/         #   Definiciones de rutas API
│   │   ├── database/       #   Conexión y pool de base de datos
│   │   ├── utils/          #   Funciones utilitarias
│   │   ├── types/          #   Definiciones TypeScript
│   │   ├── tests/          #   Pruebas Jest
│   │   ├── app.ts          #   Configuración de la app Express
│   │   └── server.ts       #   Punto de entrada
│   └── db/                 #   Esquema SQL y procedimientos almacenados
│
├── Mobile/                 # App móvil (React Native + Expo)
│   ├── src/
│   │   ├── screens/        #   Pantallas de la app
│   │   ├── components/     #   Componentes UI compartidos
│   │   ├── navigation/     #   Configuración de navegación
│   │   ├── api/            #   Cliente API
│   │   ├── context/        #   Proveedores de contexto React
│   │   ├── constants/      #   Constantes y tema
│   │   └── utils/          #   Utilidades
│   ├── App.js              #   Componente raíz
│   └── app.json            #   Configuración de Expo
│
├── docs/                   # Documentación
│   ├── SRS.md              #   Especificación de Requisitos de Software
│   ├── BUSINESS_RULES.md   #   Reglas de negocio
│   ├── USE_CASES.md        #   Descripción de casos de uso
│   └── USER_HISTORIES.md   #   Historias de usuario
│
├── public/                 # Archivos estáticos
└── vite.config.ts          # Configuración del bundler Vite
```

---

## Stack Tecnológico

| Componente | Tecnología                                               |
| ---------- | -------------------------------------------------------- |
| **Web**    | React 19, TypeScript 5.9, Vite 7, MUI 7, Axios, React Router 7 |
| **Móvil**  | React Native, Expo                                       |
| **API**    | Node.js, Express 4, TypeScript 5.4, MySQL2, Sequelize, bcryptjs, express-session, Joi, Helmet, CORS |
| **BD**     | MySQL 8.0, Procedimientos Almacenados, Connection Pooling |

---

## Funcionalidades

- **Autenticación** — inicio de sesión basado en sesiones con cookies httpOnly, hash de contraseñas con bcrypt
- **Tres Roles** — Usuario Regular, Administrador, Auditor con control de acceso basado en roles (RBAC)
- **Tarjetas de Energía** — agregar, renombrar y liberar medidores prepagados; seguimiento de saldo (COP y kWh)
- **Recarga** — por monto en COP, por kWh, o mediante código PIN de 20 dígitos (STS-20)
- **Gestión de Perfil** — datos personales con seguimiento de completitud, cambio único de documento
- **Estados de Cuenta** — Activo, Pausa, Deshabilitado, Suspendido
- **Herramientas de Administrador** — gestión de usuarios, vincular/desvincular medidores, actualizar precio del kWh, restablecer contraseñas
- **Herramientas de Auditoría** — generación de códigos de empleado (un solo uso), métricas de ventas, historial de precios del kWh, registros de seguridad
- **Registro de Seguridad** — todos los eventos significativos se registran con tipo de evento, usuario, IP y timestamp
- **Validación de Entrada** — esquemas Joi en todos los endpoints
- **Bloqueo a Nivel de Fila** — actualizaciones atómicas de saldo que evitan condiciones de carrera en recargas

---

## Inicio Rápido

### Prerrequisitos

- Node.js 16+
- MySQL 8.0+
- npm

### 1. Clonar y Configurar

```bash
git clone <repo-url>
cd energo
```

### 2. Configurar Base de Datos

```bash
mysql -u root -p < server/db/ener-go.sql
```

### 3. Backend

```bash
cd server
cp .env.example .env   # editar con credenciales de BD
npm install
npm run dev             # inicia en http://localhost:3000
```

### 4. Frontend Web

```bash
# desde la raíz del proyecto
npm install
npm run dev             # inicia en http://localhost:5173
```

### 5. App Móvil

```bash
cd Mobile
npm install
npx expo start          # abre herramientas de desarrollo Expo
```

---

## Resumen de API

Todos los endpoints tienen el prefijo `/api`. La autenticación es basada en sesión (cookie).

| Grupo       | Endpoints Principales                               |
| ----------- | --------------------------------------------------- |
| **Auth**    | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `POST /auth/password/reset` |
| **Usuario** | `GET /user/profile`, `PUT /user/profile`, `POST /user/password-change`, `POST /user/status` |
| **Medidores**| `GET /meters`, `POST /meters`, `DELETE /meters/:card`, `PATCH /meters/:card` |
| **Recarga** | `POST /recharge`, `GET /recharge/history`           |
| **Admin**   | `GET /admin/users`, detalle/logs/email/estado/suspender/restaurar usuario, vincular/desvincular medidores, `POST /admin/kwh-price` |
| **Auditoría**| `GET /audit/admins`, perfiles/estado de admins, empleados, códigos de empleado (generar/listar), métricas/series, historial-precio-kwh, registros-seguridad |

Para detalles completos de los endpoints, consultar [server/README.md](./server/README.md).

---

## Esquema de Base de Datos

| Tabla                  | Propósito                                        |
| ---------------------- | ------------------------------------------------ |
| `users`                | Cuentas de usuario principales (username, email, password_hash, rol, estado) |
| `user_profiles`        | Datos personales (nombres, tipo/número ID, dirección, teléfono) |
| `user_flags`           | Seguimiento de completitud de perfil y cambios de documento |
| `roles`                | Definiciones de roles (user, admin, audit)       |
| `statuses`             | Definiciones de estados de cuenta (Activo, Pausa, Deshabilitado, Suspendido) |
| `energy_cards`         | Medidores prepagados (saldo, kWh, propiedad, seguimiento de liberación) |
| `recharge_pins`        | Transacciones de recarga (código PIN, monto, kWh, precio histórico) |
| `kwh_price_history`    | Trazabilidad de cambios de precio                |
| `settings`             | Configuración del sistema (ej. precio del kWh)   |
| `security_logs`        | Registro de eventos de seguridad                 |
| `employee_codes`       | Códigos de registro de un solo uso para admin/audit |
| `employee_code_usages` | Seguimiento de uso de códigos de empleado        |
| `password_resets`      | Tokens de restablecimiento de contraseña (1 hora de vigencia) |
| `user_document_changes`| Trazabilidad de cambios de documento de identidad |
| `sessions`             | Almacén de sesiones del lado del servidor        |
| `blocked`              | Registros de bloqueo de cuentas                  |

Todas las operaciones de datos se realizan mediante procedimientos almacenados de MySQL para consistencia, consultas parametrizadas (seguras contra inyección SQL) y bloqueo a nivel de fila en actualizaciones de saldo.

---

## Roles y Permisos

| Acción                         | Usuario | Admin | Auditor |
| ------------------------------ | :-----: | :---: | :-----: |
| Registrarse / Iniciar sesión / Cerrar sesión | ✓ | ✓ | ✓ |
| Ver panel principal            |    ✓    |   ✓   |    ✓    |
| Gestionar perfil               |    ✓    |   ✓   |    ✓    |
| Cambiar contraseña             |    ✓    |   ✓   |    ✓    |
| Agregar / Renombrar / Liberar medidores | ✓ |   ✓   |         |
| Recargar (COP / kWh / PIN)     |    ✓    |   ✓   |         |
| Ver historial de recargas propio|    ✓   |   ✓   |         |
| Pausar / Reactivar cuenta      |    ✓    |   ✓   |         |
| Gestionar todos los usuarios   |         |   ✓   |         |
| Vincular / Desvincular medidores|        |   ✓   |         |
| Actualizar precio del kWh      |         |   ✓   |         |
| Enviar restablecimiento de contraseña | |   ✓   |         |
| Listar admins y ver perfiles   |         |       |    ✓    |
| Generar códigos de empleado    |         |       |    ✓    |
| Ver métricas de ventas         |         |       |    ✓    |
| Ver historial de precio del kWh |        |       |    ✓    |
| Ver registros de seguridad     |         |       |    ✓    |

---

## Configuración

Variables de entorno del backend (ver `server/.env.example`):

| Variable         | Descripción                          |
| ---------------- | ------------------------------------ |
| `DB_HOST`        | Host de MySQL                        |
| `DB_USER`        | Usuario de MySQL                     |
| `DB_PASSWORD`    | Contraseña de MySQL                  |
| `DB_NAME`        | Nombre de la base de datos           |
| `PORT`           | Puerto del servidor (por defecto 3000) |
| `SESSION_SECRET` | Clave de cifrado de sesión           |
| `STS_MASTER_KEY` | Clave de cifrado de token STS        |

---

## Scripts de Desarrollo

### Backend (`server/`)

| Script            | Comando                     |
| ----------------- | --------------------------- |
| `npm run dev`     | Iniciar con recarga en caliente |
| `npm run build`   | Compilar TypeScript         |
| `npm start`       | Ejecutar compilado en producción |
| `npm test`        | Ejecutar pruebas Jest       |

### Frontend Web (`./`)

| Script            | Comando                     |
| ----------------- | --------------------------- |
| `npm run dev`     | Iniciar servidor de desarrollo Vite |
| `npm run build`   | Verificar TypeScript + compilar |
| `npm run lint`    | ESLint                      |
| `npm run preview` | Previsualizar build de producción |

### Móvil (`Mobile/`)

| Script             | Comando                   |
| ------------------ | ------------------------- |
| `npx expo start`   | Iniciar herramientas de desarrollo Expo |
| `npx expo build`   | Compilar para producción  |

---

## Diagramas

| Diagrama | Descripción | Enlace |
| -------- | ----------- | ------ |
| Flujo de Autenticación | Proceso de inicio de sesión y validación de sesión | [Ver diagrama](https://tinyurl.com/energoFlujoAutenticacion) |
| Flujo de Registro | Proceso de registro de nuevos usuarios | [Ver diagrama](https://tinyurl.com/energoFlujoRegistro) |
| Flujo de Recargas | Proceso de recarga de energía (COP, kWh, PIN) | [Ver diagrama](https://tinyurl.com/energoFlujoRecargas) |
| Flujo de Perfil | Gestión de datos personales del usuario | [Ver diagrama](https://tinyurl.com/energoFlujoPerfil) |
| Flujo de Administrador | Gestión de usuarios, medidores y precios | [Ver diagrama](https://tinyurl.com/energoFlujoAdministrador) |
| Diagrama Entidad-Relación | Modelo de datos y relaciones de la base de datos | [Ver diagrama](https://tinyurl.com/energoEntidadRelacion) |
| Diagrama de Componentes | Arquitectura de componentes del sistema | [Ver diagrama](https://tinyurl.com/energocomponentes) |

---

## Documentación

La documentación detallada está disponible en el directorio [`docs/`](./docs/):

- **[SRS.md](./docs/SRS.md)** — Especificación de Requisitos de Software (36 casos de uso, reglas de validación, manejo de errores, matriz de cobertura de pruebas)
- **[BUSINESS_RULES.md](./docs/BUSINESS_RULES.md)** — Definiciones de reglas de negocio
- **[USE_CASES.md](./docs/USE_CASES.md)** — Flujos detallados de casos de uso
- **[USER_HISTORIES.md](./docs/USER_HISTORIES.md)** — Historias de usuario
- **[server/README.md](./server/README.md)** — Documentación de la API del backend
