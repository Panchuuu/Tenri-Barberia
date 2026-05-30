# 🌐 Tenri Barbería · API Endpoints

> **Generado:** 2026-05-27 por el Ejecutor
> **Fuente:** [`Tenri-Backend/backend/routes/api.php`](../Tenri-Backend/backend/routes/api.php)
> **Base URL en dev:** `http://127.0.0.1:8000/api`
> **Auth:** Laravel Sanctum (Bearer token). Las rutas protegidas viven dentro de `Route::middleware('auth:sanctum')`.

## 📊 Resumen

- **Total endpoints (registros de ruta):** 35
- **Públicos:** 6 · **Comunes autenticados:** 3 · **Cliente¹:** 5 · **Admin + Barbero:** 3 · **Admin:** 17 · **Superadmin:** 1

> ¹ Los 5 endpoints "Cliente" están dentro de `auth:sanctum` **sin** un `role:` que los acote a `rol=cliente`. En la práctica cualquier usuario autenticado puede invocarlos (la propiedad se valida dentro del controller). Ver [Inconsistencias §5](#5-rol-de-las-rutas-cliente).

> ⚠️ El conteo cuenta `/barberos/{id}` (POST y PUT) como **2** registros porque así están definidos, aunque apuntan al mismo método. Ver [Inconsistencias §1](#1-endpoints-definidos-pero-no-usados-por-el-frontend-activo).

---

## 🌍 Públicos (sin auth)

| Método | URL | Controller@método | Descripción | Línea |
|---|---|---|---|---|
| GET | `/servicios` | `ServicioController@index` | Lista servicios. Filtra por barbería vía query param. | 15 |
| GET | `/barberos` | `BarberoController@index` | Lista barberos. Filtra por barbería vía query param. | 16 |
| GET | `/barberias` | `BarberiaController@index` | Directorio público de barberías (paginado). | 17 |
| GET | `/barberos/{id}/disponibilidad` | `CitaController@disponibilidad` | Horas ocupadas/pasadas + estado de bloqueo del barbero para una fecha. | 18 |
| POST | `/register` | `AuthController@register` | Registro de cliente. `throttle:10,1`. **FormRequest:** `RegisterRequest`. | 21 |
| POST | `/login` | `AuthController@login` | Login, devuelve token. `throttle:10,1`. **FormRequest:** `LoginRequest`. | 22 |

---

## 🔐 Comunes autenticados (auth:sanctum · cualquier rol)

| Método | URL | Controller@método | Descripción | Línea |
|---|---|---|---|---|
| GET | `/user` | closure (`$request->user()`) | Devuelve el usuario autenticado. | 30 |
| PUT | `/perfil` | `AuthController@updatePerfil` | Actualiza perfil propio. **FormRequest:** `UpdatePerfilRequest`. | 31 |
| POST | `/logout` | `AuthController@logout` | Invalida el token actual en el servidor. | 32 |

---

## 👤 Cliente (auth:sanctum · sin `role:` — ver nota ¹)

| Método | URL | Controller@método | Descripción | Línea |
|---|---|---|---|---|
| POST | `/citas` | `CitaController@store` | Crea una cita (estado `confirmada`). Valida bloqueos y choques. **FormRequest:** `StoreCitaRequest`. | 77 |
| GET | `/mis-reservas` | `CitaController@misReservas` | Citas del cliente autenticado. | 78 |
| PATCH | `/mis-citas/{id}/cancelar` | `CitaController@cancelarMiCita` | Cancela cita propia (respeta `tiempo_cancelacion` de la barbería). | 79 |
| POST | `/mis-citas/{id}/calificar` | `CitaController@calificar` | Califica (1-5) + comentario. Recalcula promedio del barbero. *(validación inline)* | 80 |
| PATCH | `/citas/{id}/reagendar` | `CitaController@reagendar` | Reagenda cita (cliente/admin/barbero según propiedad). *(validación inline)* | 83 |

---

## ✂️ Admin + Barbero (role:admin,barbero)

| Método | URL | Controller@método | Descripción | Línea |
|---|---|---|---|---|
| GET | `/citas` | `CitaController@index` | Agenda de la barbería con filtros y búsqueda (paginado 10). | 71 |
| PATCH | `/citas/{id}/estado` | `CitaController@updateEstado` | Cambia estado de la cita. *(validación inline)* | 72 |
| GET | `/barbero/citas` | `CitaController@citasBarbero` | Citas del barbero autenticado (paginado 10). | 73 |

---

## 🏪 Admin (role:admin)

| Método | URL | Controller@método | Descripción | Línea |
|---|---|---|---|---|
| GET | `/finanzas/hoy` | `CitaController@resumenFinancieroHoy` | Resumen financiero del día. *(alias de `resumenPorPeriodo` con `hoy`)* | 42 |
| GET | `/finanzas/resumen` | `CitaController@resumenPorPeriodo` | Resumen financiero por periodo. | 43 |
| GET | `/mi-barberia` | `BarberiaController@miBarberia` | Datos de la barbería del admin. | 46 |
| PUT | `/mi-barberia` | `BarberiaController@updateConfig` | Actualiza config de la barbería. *(validación inline)* | 47 |
| GET | `/mi-equipo` | `BarberiaController@miEquipo` | Lista de barberos de la barbería. | 48 |
| GET | `/mis-servicios` | `BarberiaController@misServicios` | Servicios de la barbería. | 49 |
| POST | `/barberos` | `BarberoController@store` | Crea un barbero. *(validación inline)* | 52 |
| POST | `/barberos/asignar` | `BarberoController@asignarRol` | Asciende un usuario existente a barbero. *(validación inline — ver §3)* | 53 |
| POST | `/barberos/{id}` | `BarberoController@update` | Actualiza barbero (POST + `_method=PUT` para multipart). **FormRequest:** `UpdateBarberoRequest`. | 54 |
| PUT | `/barberos/{id}` | `BarberoController@update` | Mismo método que la fila anterior (registro duplicado). | 55 |
| DELETE | `/barberos/{id}` | `BarberoController@destroy` | Remueve del equipo (degrada a `cliente`, `barberia_id=null`). | 56 |
| POST | `/servicios` | `ServicioController@store` | Crea servicio. **FormRequest:** `StoreServicioRequest`. | 59 |
| PUT | `/servicios/{id}` | `ServicioController@update` | Actualiza servicio. *(validación inline — ver §3)* | 60 |
| DELETE | `/servicios/{id}` | `ServicioController@destroy` | Elimina servicio. | 61 |
| GET | `/bloqueos` | `BloqueoHorarioController@index` | Lista bloqueos de horario. | 64 |
| POST | `/bloqueos` | `BloqueoHorarioController@store` | Crea bloqueo (vacaciones/día libre). *(validación inline)* | 65 |
| DELETE | `/bloqueos/{id}` | `BloqueoHorarioController@destroy` | Elimina bloqueo. | 66 |

---

## 👑 Superadmin (role:superadmin)

| Método | URL | Controller@método | Descripción | Línea |
|---|---|---|---|---|
| POST | `/barberias` | `BarberiaController@store` | Crea una barbería (tenant) + su admin inicial. **FormRequest:** `StoreBarberiaRequest`. | 36 |

---

## 🔍 Detalles de query params

### `GET /citas` (admin) — [`CitaController@index`](../Tenri-Backend/backend/app/Http/Controllers/CitaController.php#L31)
- `?desde=YYYY-MM-DD` — filtro fecha desde (`whereDate fecha >=`)
- `?hasta=YYYY-MM-DD` — filtro fecha hasta (`whereDate fecha <=`)
- `?barbero_id=N` — filtra por barbero
- `?estado=pendiente|confirmada|finalizada|cancelada` — filtra por estado
- `?q=string` — busca en `name` **o** `email` del cliente (`like`)
- `?page=N` — paginación (10 por página, conserva query string)

### `GET /barberos` (público) — [`BarberoController@index`](../Tenri-Backend/backend/app/Http/Controllers/BarberoController.php#L17)
- `?barberia=slug` — filtra barberos por slug de barbería *(consumido por el frontend como `/barberos?barberia=${slug}`)*

### `GET /servicios` (público) — [`ServicioController@index`](../Tenri-Backend/backend/app/Http/Controllers/ServicioController.php#L12)
- `?barberia=slug` — el frontend lo consume como `/servicios?barberia=${slug}` *(confirmar manejo del param en el controller)*

### `GET /barberos/{id}/disponibilidad` (público) — [`CitaController@disponibilidad`](../Tenri-Backend/backend/app/Http/Controllers/CitaController.php#L327)
- `?fecha=YYYY-MM-DD` — **obligatorio** (devuelve `400` si falta). Retorna `bloqueado`, `motivo`, `ocupadas[]`, `pasadas[]`, `hora_inicio`, `hora_fin`.

### `GET /finanzas/resumen` (admin) — [`CitaController@resumenPorPeriodo`](../Tenri-Backend/backend/app/Http/Controllers/CitaController.php#L149)
- `?periodo=hoy|semana|mes` — default `hoy`
- `?desde=YYYY-MM-DD` + `?hasta=YYYY-MM-DD` — fuerza `periodo=custom`
- Solo cuenta citas en estado `finalizada`. Devuelve `total_ingresos`, `cantidad_cortes`, `desglose_barberos`, `desglose_por_dia`.

### `GET /finanzas/hoy` (admin) — [`CitaController@resumenFinancieroHoy`](../Tenri-Backend/backend/app/Http/Controllers/CitaController.php#L137)
- Sin params propios; delega en `resumenPorPeriodo` con periodo `hoy`.

### `GET /barbero/citas` (admin+barbero) — [`CitaController@citasBarbero`](../Tenri-Backend/backend/app/Http/Controllers/CitaController.php#L313)
- `?page=N` — paginación (10 por página). *(consumido como `/barbero/citas?page=${pagina}`)*

---

## ⚠️ Inconsistencias detectadas

> Solo reporte. **No se corrigió nada** (fuera del scope de la Tarea 2).

### 1. Endpoints definidos pero NO usados por el frontend activo
Método de detección: `grep apiFetch(` + `useApi(` + `useApiMutation/ejecutar(` en `src/`, comparado contra `routes/api.php`. Se ignoró el código huérfano (`AdminDashboard.jsx`, `BarberoDashboard.jsx`, `SuperAdminDashboard.jsx`, `MisReservas.jsx`).

| Endpoint | Línea | Situación |
|---|---|---|
| `POST /barberos` (`store`) | 52 | El frontend crea barberos vía `POST /barberos/asignar` ([EquipoPage.jsx:50](../Tenri-Front/frontend/src/pages/admin/EquipoPage.jsx#L50)). `store` no se invoca desde código activo. |
| `PUT /barberos/{id}` | 55 | Registro **duplicado** de la línea 54. El frontend siempre usa la variante `POST /barberos/{id}` (multipart + `_method`). La ruta PUT queda sin consumidor. |
| `GET /finanzas/hoy` | 42 | Solo lo llamaba el huérfano `AdminDashboard.jsx:70`. El código activo usa `GET /finanzas/resumen?periodo=hoy` ([AgendaPage.jsx:114](../Tenri-Front/frontend/src/pages/admin/AgendaPage.jsx#L114)). |

> Además, los componentes huérfanos referencian endpoints **inexistentes** en el backend (dead code): `GET /superadmin/metricas` y `PATCH /barberias/{id}/estado` (`SuperAdminDashboard.jsx:49,86`). No están en `api.php`.

### 2. Naming inconsistente de URLs
- **Prefijo mixto para acciones sobre una cita del usuario:**
  - `PATCH /mis-citas/{id}/cancelar` y `POST /mis-citas/{id}/calificar` → prefijo `/mis-citas`
  - `PATCH /citas/{id}/reagendar` y `PATCH /citas/{id}/estado` → prefijo `/citas`
  Acciones del mismo dominio conviven bajo dos prefijos distintos.
- **`reservas` vs `citas`:** `GET /mis-reservas` usa "reservas" mientras todo el resto del dominio usa "citas". Un solo concepto, dos nombres.
- **Sugerencia (no aplicar ahora):** unificar bajo `/citas/...` o `/mis-citas/...` de forma consistente.

### 3. Métodos de escritura con validación inline (sin FormRequest dedicado)
El proyecto declara como convención usar **FormRequest para TODA validación**. Estos métodos validan con `$request->validate()` inline:

| Método | Validación | Nota |
|---|---|---|
| `BarberoController@asignarRol` (53) | inline | **Existe `AsignarRolRequest.php` pero NO se usa** → FormRequest huérfano. |
| `ServicioController@update` (60) | inline | `store` sí usa `StoreServicioRequest`; falta un `UpdateServicioRequest` análogo. |
| `BarberoController@store` (52) | inline | Sin FormRequest. |
| `BloqueoHorarioController@store` (65) | inline | Sin FormRequest. |
| `BarberiaController@updateConfig` (47) | inline | Sin FormRequest. |
| `CitaController@reagendar` (83) | inline | `store` sí usa `StoreCitaRequest`. |
| `CitaController@updateEstado` (72) | inline | — |
| `CitaController@calificar` (80) | inline | — |

### 4. Verbos HTTP
- `POST /barberos/{id}` (54) → `update()`: semánticamente debería ser `PUT/PATCH`. Se usa `POST` deliberadamente para soportar `multipart/form-data` con `_method=PUT` (comentado en `api.php`). **Aceptable**, se documenta por transparencia.
- No se detectaron `GET` con efectos secundarios ni `POST` que solo lean datos.

### 5. Rol de las rutas "Cliente"
Las rutas de las líneas **30–32** y **77–83** están dentro de `auth:sanctum` pero **fuera de cualquier grupo `role:`**. Por lo tanto **cualquier usuario autenticado** (admin, barbero, superadmin) puede invocarlas, no solo `cliente`.
- `reagendar`, `cancelarMiCita`, `calificar` validan la propiedad dentro del controller → riesgo acotado.
- `POST /citas` crearía la cita con `cliente_id = usuario_actual` (un admin reservaría para sí mismo).
- **Marcar como ⚠️ verificar** si se desea acotar explícitamente a `rol=cliente`.
