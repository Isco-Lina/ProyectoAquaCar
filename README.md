# AquaCar 2.0

AquaCar 2.0 es un sistema web premium para gestión de lavado automotriz. Permite registrar usuarios, administrar vehículos, crear reservas online, controlar servicios y operar un panel administrador con una interfaz moderna, responsive y orientada a producción.

## Características principales

- Registro e inicio de sesión por roles
- Gestión de vehículos por cliente
- Reservas online con validación de disponibilidad
- Cancelación y seguimiento de reservas
- Panel administrador para control de reservas
- Gestión completa de servicios
- Estados de reserva administrables
- Sistema premium responsive
- Validaciones frontend y backend
- Mensajes visuales tipo toast
- Integración con MySQL en Railway y despliegue en Render

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript vanilla
- Bootstrap 5 vía CDN
- Bootstrap Icons vía CDN
- Node.js
- Express
- MySQL
- mysql2
- cors
- dotenv
- bcryptjs

## Arquitectura del sistema

### Frontend

La interfaz está construida con HTML, CSS y JavaScript vanilla. Está organizada en páginas públicas, páginas de cliente y páginas administrativas. El frontend consume la API del backend mediante `fetch` y muestra feedback visual con toasts premium reutilizables.

### Backend

El backend está desarrollado con Node.js y Express. Expone una API REST bajo la ruta base `/api`, maneja autenticación básica por usuario/rol, valida datos y conecta con MySQL mediante `mysql2`.

### API REST

Las rutas principales del sistema cubren:

- usuarios y login
- vehículos
- servicios
- reservas
- consulta de clientes

### Base de datos

La base de datos está alojada en MySQL en Railway y utiliza un modelo relacional con tablas principales para usuarios, roles, vehículos, servicios, reservas y catálogos auxiliares.

### Deploy

- Frontend en Render
- Backend en Render
- Base de datos MySQL en Railway

## Estructura del proyecto

```text
AquaCar/
├── README.md
├── backend/
│   ├── .env.example
│   ├── db.js
│   ├── index.js
│   ├── package.json
│   └── routes/
│       ├── reservaRoutes.js
│       ├── servicioRoutes.js
│       ├── usuarioRoutes.js
│       └── vehiculoRoutes.js
├── database/
│   └── script SQL del sistema
└── frontend/
    ├── index.html
    ├── css/
│   │   └── aquacar-premium.css
    ├── images/
    ├── js/
    │   ├── admin.js
    │   ├── auth.js
    │   ├── clientes-vehiculos.js
    │   ├── config.js
    │   ├── index.js
    │   ├── login.js
    │   ├── mis-reservas.js
    │   ├── panel.js
    │   ├── registro.js
    │   ├── reservas.js
    │   ├── servicios-admin.js
    │   └── vehiculos.js
    └── pages/
        ├── admin.html
        ├── clientes-vehiculos.html
        ├── login.html
        ├── mis-reservas.html
        ├── panel.html
        ├── registro.html
        ├── reservas.html
        ├── servicios-admin.html
        └── vehiculos.html
```

## Base de datos

El sistema usa un modelo relacional pensado para mantener integridad entre clientes, vehículos, servicios y reservas.

### Tablas principales

- `ROL`
- `USUARIO`
- `VEHICULO`
- `MARCA_VEHICULO`
- `MODELO_VEHICULO`
- `TIPO_VEHICULO`
- `COLOR_VEHICULO`
- `SERVICIO`
- `RESERVA`
- `ESTADO_RESERVA`

### Relaciones principales

- `ROL` 1:N `USUARIO`
- `USUARIO` 1:N `VEHICULO`
- `MARCA_VEHICULO` 1:N `MODELO_VEHICULO`
- `TIPO_VEHICULO` 1:N `MODELO_VEHICULO`
- `MODELO_VEHICULO` 1:N `VEHICULO`
- `COLOR_VEHICULO` 1:N `VEHICULO`
- `USUARIO` 1:N `RESERVA`
- `VEHICULO` 1:N `RESERVA`
- `SERVICIO` 1:N `RESERVA`
- `ESTADO_RESERVA` 1:N `RESERVA`

### Observación sobre vehículos

La estructura actual de vehículos está normalizada mediante catálogos de marca, modelo, tipo y color. Esto permite mantener el frontend dinámico y evitar duplicación de datos al registrar vehículos y reservas.

## Variables de entorno

Crear un archivo `.env` en `backend/` con esta estructura:

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
```

Ejemplo de configuración para desarrollo o producción:

```env
DB_HOST=tu-host-de-mysql
DB_PORT=3306
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_NAME=tu-base-de-datos
PORT=3000
```

## Instalación local

### 1. Clonar el proyecto

```bash
git clone <url-del-repositorio>
cd AquaCar
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

Crear `backend/.env` con los datos de tu instancia MySQL.

### 4. Cargar la base de datos

Importar el script SQL del proyecto en tu base de datos MySQL local o en Railway.

### 5. Iniciar el backend

```bash
npm start
```

En desarrollo también puedes usar:

```bash
npm run dev
```

### 6. Abrir el frontend

Abrir `frontend/index.html` con un servidor estático, por ejemplo Live Server en VS Code, o desplegarlo directamente en Render.

## Deploy

### Frontend en Render

- Publicar la carpeta `frontend/` como sitio estático
- Verificar que las rutas relativas a `css`, `js`, `images` y `pages` se mantengan intactas
- Confirmar que el frontend apunte a la URL real del backend desplegado

### Backend en Render

- Crear un servicio web para `backend/`
- Definir las variables de entorno en Render
- Verificar que el servidor escuche en `process.env.PORT`
- Exponer la API bajo `/api`

### Base de datos en Railway

- Crear la instancia MySQL en Railway
- Copiar credenciales al `.env` local o a las variables del servicio en Render
- Importar el esquema SQL del sistema
- Validar la conectividad desde el backend

## Funcionalidades implementadas

- Registro de usuarios clientes
- Inicio de sesión con roles
- Gestión de vehículos por usuario
- Catálogo dinámico de marcas, modelos y colores
- Reservas con selección de fecha y horario
- Validación de disponibilidad antes de reservar
- Consulta de reservas por cliente
- Cancelación de reservas por cliente
- Panel administrador con listado de reservas
- Cambio de estado de reservas
- Eliminación de reservas desde administración
- Gestión de servicios: crear, editar, activar, desactivar y eliminar
- Vista de clientes con sus vehículos asociados
- Interfaz premium con modales y toasts visuales

## Mejoras implementadas en AquaCar 2.0

- Diseño premium oscuro con estilo automotriz
- Navbar moderna y consistente en todo el sistema
- Sistema relacional de vehículos más ordenado
- Reservas con mejor validación y control de horarios
- Administración más clara para reservas y servicios
- Mensajes visuales tipo toast reutilizables
- Mejor experiencia responsive en móvil y escritorio
- Refuerzo de validaciones en frontend y backend

## Estado actual del proyecto

El sistema se encuentra operativo y listo para seguir con ajustes finos antes de producción. La base funcional está implementada y el proyecto está orientado a su despliegue en Render y Railway con una estructura estable.

## Autor

Francisco Molina
