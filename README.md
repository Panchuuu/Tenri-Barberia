# Tenri Barbería

> **SaaS multi-tenant** para gestión integral de barberías. Permite a múltiples negocios operar de forma independiente bajo una misma plataforma, con reservas online, gestión de equipo y panel administrativo completo.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Laravel 11 + Sanctum (API REST) |
| Base de datos | PostgreSQL |
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Autenticación | Laravel Sanctum (tokens por rol) |
| Email | Gmail SMTP + Laravel Queues (background jobs) |
| Storage | Laravel Storage (avatares, logos, imágenes) |
| Package manager | pnpm |

---

## Arquitectura

El sistema implementa una arquitectura **multi-tenant** donde cada barbería opera como un inquilino independiente:

```
Tenri SPA (superadmin)
  ├── Barbería A (admin + barberos + clientes)
  ├── Barbería B (admin + barberos + clientes)
  └── Barbería N ...
```

### Roles del sistema

| Rol | Descripción |
|---|---|
| `superadmin` | Gestiona toda la plataforma (barberías, usuarios) |
| `admin` | Gestiona su barbería (equipo, servicios, configuración) |
| `barbero` | Ve su agenda, gestiona citas, edita su perfil profesional |
| `cliente` | Reserva y gestiona sus citas |

---

## Funcionalidades principales

### Reservas (cliente)
- Catálogo de servicios por barbería con precios y duración
- BookingModal con wizard secuencial (barbero → fecha → hora)
- Reagendar y cancelar citas con notificación por email
- Historial completo en `/mis-reservas`

### Panel del barbero
- Agenda diaria con vista por fecha
- Gestión de bloqueos horarios
- Perfil profesional editable (foto, bio, especialidad)
- Cancelación de citas con notificación automática al cliente

### Panel del admin
- CRUD de servicios (nombre, precio, duración, imagen)
- Gestión de equipo (asignar/editar/remover barberos con revocación de tokens)
- Configuración de la barbería (color de marca, logo, tiempo de cancelación)
- Vista de agenda global

### Panel del superadmin
- CRUD completo de barberías (crear, editar nombre/color/logo, eliminar con cascade)
- CRUD de usuarios del sistema (cambiar rol, suspender/reactivar, eliminar)
- Suspensión de cuentas con revocación inmediata de tokens activos
- Login bloqueado para usuarios suspendidos

---

## Decisiones técnicas destacadas

### Validaciones centralizadas (FormRequests)
Todas las validaciones viven en FormRequests de Laravel con mensajes en español. Incluyen validaciones cross-field (ej: `hora_fin > hora_inicio`) mediante `withValidator()`.

### Emails en background (Laravel Queues)
Los emails de confirmación, cancelación y notificación al barbero se procesan de forma asíncrona vía `QUEUE_CONNECTION=database`. El endpoint responde inmediatamente al frontend sin esperar al SMTP.

### Mensajes de error del backend en el frontend
`useApiMutation` expone `getLastError()` (ref síncrono via `useRef`) que permite leer el body del error 422 inmediatamente después del `await`. `parseApiErrorSync()` extrae el primer mensaje relevante de la respuesta de Laravel y lo muestra en un toast.

### Multi-tenant con middleware
Las rutas protegidas verifican `barberia_id` del usuario autenticado para garantizar el aislamiento entre tenants. El middleware `role:X` filtra por rol sin lógica adicional en los controllers.

---

## Estructura del proyecto

```
Tenri-Barberia/
├── Tenri-Backend/
│   └── backend/                    # Laravel 11
│       ├── app/Http/Controllers/   # Controllers por dominio
│       ├── app/Http/Requests/      # FormRequests con validaciones
│       ├── app/Http/Middleware/    # CheckRole, etc.
│       ├── app/Models/             # Eloquent models
│       ├── app/Mail/               # Mailables (ShouldQueue)
│       ├── database/migrations/    # Migraciones PostgreSQL
│       └── routes/api.php          # API routes agrupadas por rol
│
└── Tenri-Front/
    └── frontend/                   # React 19 + Vite
        └── src/
            ├── components/         # Componentes reutilizables
            ├── context/            # AuthContext, ThemeContext
            ├── hooks/              # useApi, useApiMutation
            ├── layouts/            # DashboardLayout, PublicLayout
            ├── pages/              # Páginas por rol
            └── utils/              # parseApiError, api.js
```

---

## Instalación y configuración

### Requisitos
- PHP 8.2+
- Node.js 20+
- PostgreSQL 15+
- pnpm

### Backend

```bash
cd Tenri-Backend/backend

composer install

cp .env.example .env
# Configura DB_*, MAIL_*, APP_KEY

php artisan key:generate
php artisan migrate
php artisan storage:link

php artisan serve
```

### Frontend

```bash
cd Tenri-Front/frontend

cp .env.example .env.local
# Configura VITE_API_URL=http://127.0.0.1:8000/api

pnpm install
pnpm dev
```

### Queue worker (para emails)

```bash
cd Tenri-Backend/backend
php artisan queue:work --sleep=3 --tries=3
```

---

## Variables de entorno

### Backend (`.env`)

| Variable | Descripción |
|---|---|
| `DB_CONNECTION` | `pgsql` |
| `DB_DATABASE` | Nombre de la base de datos |
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | Tu cuenta de Gmail |
| `MAIL_PASSWORD` | App Password de Google |
| `MAIL_ENCRYPTION` | `tls` |
| `QUEUE_CONNECTION` | `database` |

### Frontend (`.env.local`)

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL de la API, ej: `http://127.0.0.1:8000/api` |

---

## API

La documentación de los 35+ endpoints está disponible en [`docs/API_ENDPOINTS.md`](docs/API_ENDPOINTS.md).

Los endpoints están organizados por grupos de middleware:
- **Públicos**: catálogo de barberías y servicios
- **`auth:sanctum`**: operaciones autenticadas (perfil, citas)
- **`role:admin`**: gestión del tenant
- **`role:barbero`**: agenda y bloqueos
- **`role:superadmin`**: administración de la plataforma

---

## Autor

**Francisco Parra** — [github.com/Panchuuu](https://github.com/Panchuuu)
