# AquaCar 2.0

Sistema web para la gestión de reservas, servicios, vehículos y administración operativa de un lavado automotriz.

## Descripción

AquaCar 2.0 centraliza el flujo de atención del negocio en una plataforma web con frontend estático, backend REST y base de datos MySQL. El sistema permite a clientes registrar vehículos, crear reservas y revisar su historial, mientras que el administrador gestiona servicios, reservas y usuarios desde paneles protegidos.

## Tecnologías

### Frontend

- HTML
- CSS
- JavaScript vanilla

### Backend

- Node.js
- Express
- JWT
- bcryptjs

### Base de datos

- MySQL / MySQL2

### Utilidades

- Visual Studio Code
- MySQL Workbench
- Postman
- GitHub

## Arquitectura

La solución usa una arquitectura de tres capas:

1. Presentación: frontend en HTML, CSS y JavaScript.
2. Lógica: API REST en Node.js con Express.
3. Datos: persistencia en MySQL.

La comunicación entre frontend y backend se realiza por HTTP/JSON. Las rutas privadas usan JWT y control de roles.

## Funcionalidades

### Cliente

- Registro e inicio de sesión
- Registro de vehículos
- Visualización de servicios activos
- Creación de reservas
- Consulta de reservas propias
- Cancelación de reservas permitidas

### Administrador

- Gestión de reservas
- Cambio de estado de reservas
- Eliminación de reservas
- Gestión de servicios
- Activación o desactivación de servicios
- Visualización de clientes y vehículos

## Seguridad implementada

- Contraseñas cifradas con bcryptjs
- Autenticación con JWT
- Protección por roles en backend
- Validación de rutas privadas con Bearer token
- CORS con cabecera Authorization permitida
- Rate limiting en endpoints sensibles
- `x-powered-by` deshabilitado

## Estructura del proyecto

```bash
/frontend   → Interfaz pública y paneles de cliente/admin
/backend    → API REST, middleware, rutas y conexión a MySQL
/database   → Script SQL, modelo relacional y documentación de BD
```

## Base de datos

La carpeta `/database` incluye el script de creación y los artefactos de modelado. La base de datos contiene las tablas de roles, usuarios, vehículos, servicios, estados de reserva y reservas.

## Variables de entorno

Crear `backend/.env` con valores equivalentes a estos:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_clave_mysql
DB_NAME=bd_aquacar_2
PORT=3000
FRONTEND_URL=http://127.0.0.1:5500
JWT_SECRET=una_clave_larga_y_aleatoria
JWT_EXPIRES=8h
```

## Instalación local

### 1. Importar la base de datos

Ejecutar `database/bd_aquacar.sql` en MySQL Workbench o una herramienta compatible.

### 2. Configurar el backend

Ubicar el archivo `.env` dentro de `backend/` con las variables necesarias.

### 3. Instalar dependencias

```bash
cd backend
npm install
```

### 4. Iniciar el backend

```bash
npm start
```

## Scripts disponibles

En `backend/package.json`:

- `npm start` → ejecuta el servidor
- `npm run dev` → ejecuta el servidor con nodemon

## Despliegue

El proyecto está preparado para separar frontend y backend en entornos distintos. Solo deben ajustarse `FRONTEND_URL`, `DB_*` y `JWT_SECRET` según el entorno de despliegue.

## Notas

- No se incluyen credenciales ni datos de usuarios en este documento.
- Las credenciales de prueba deben manejarse solo en entornos locales o de QA.
- Para producción, use una `JWT_SECRET` aleatoria y manténgala fuera del repositorio.
