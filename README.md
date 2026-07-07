# AquaCar 2.0

AquaCar 2.0 es una aplicación web desarrollada para gestionar de forma digital un centro de lavado automotriz. Permite a los clientes registrarse, administrar sus vehículos y reservar servicios, mientras que el administrador puede controlar reservas, clientes y el catálogo de servicios desde un panel exclusivo.

---

## Características

- Registro e inicio de sesión de usuarios.
- Gestión de vehículos.
- Reserva de servicios de lavado.
- Consulta y administración de reservas.
- Panel exclusivo para clientes.
- Panel de administración.
- Gestión de servicios.
- Diseño responsive para computadores y dispositivos móviles.

---

## Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### Base de datos

- MySQL

### Seguridad

- JWT
- bcrypt
- Helmet
- CORS
- Express Rate Limit

### Despliegue

- Render
- Railway

---

## Estructura del proyecto

```
AquaCar/
│
├── frontend/      → Interfaz de usuario
├── backend/       → API REST
├── database/      → Base de datos MySQL
└── README.md
```

---

## Instalación

### 1. Clonar el proyecto

```bash
git clone <url-del-repositorio>
```

### 2. Instalar dependencias

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd frontend
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` dentro de la carpeta **backend**.

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
FRONTEND_URL=
```

### 4. Ejecutar el proyecto

Backend

```bash
npm run dev
```

Frontend

Ejecutar un servidor local para la carpeta **frontend**.

---

## Estado del proyecto

✅ Proyecto operativo y preparado para ejecutarse tanto en entorno local como en producción.

---

## Autor

**Francisco Javier Antonio Molina Carrillo**
