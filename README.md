# AquaCar

Sistema web desarrollado como proyecto de título para la gestión de reservas, servicios y clientes de un lavado automotriz.

El proyecto busca digitalizar la administración de AquaCar, permitiendo optimizar el control de reservas, vehículos y servicios mediante una plataforma web funcional.

---

# Tecnologías utilizadas

## Frontend

- HTML
- CSS
- JavaScript

## Backend

- Node.js
- Express

## Base de Datos

- MySQL

## Herramientas utilizadas

- Visual Studio Code
- MySQL Workbench
- Postman
- GitHub
- Render
- Railway

---

# Arquitectura del sistema

El sistema fue desarrollado utilizando una arquitectura cliente-servidor de tres capas:

- Capa de presentación → Frontend desarrollado con HTML, CSS y JavaScript.
- Capa lógica → Backend desarrollado con Node.js y Express.
- Capa de datos → Base de datos MySQL.

La comunicación entre frontend y backend se realiza mediante solicitudes HTTP y respuestas en formato JSON.

---

# Funcionalidades principales

## Cliente

- Registro de usuarios
- Inicio de sesión
- Registro de vehículos
- Visualización de servicios
- Creación de reservas
- Visualización de reservas
- Cancelación de reservas

## Administrador

- Gestión de servicios
- Gestión de reservas
- Cambio de estado de reservas
- Visualización de clientes y vehículos

---

# Validaciones implementadas

- Validación de correos duplicados
- Validación de patentes duplicadas
- Validación de horarios ocupados
- Validación de campos obligatorios
- Contraseñas cifradas mediante bcryptjs

---

# Estructura del proyecto

```bash
/frontend   → Interfaces del sistema
/backend    → Servidor, rutas y lógica del sistema
/database   → Script SQL, modelo relacional y documentación de base de datos
```

# Base de datos AquaCar

La carpeta `/database` contiene:

- Script SQL de creación de la base de datos
- Modelo relacional del sistema
- Modelo entidad-relación (Chen)
- Estructura de tablas y relaciones principales

La base de datos fue desarrollada utilizando MySQL y se encuentra estructurada bajo un modelo relacional normalizado hasta Tercera Forma Normal (3FN).

---

# Instalación y ejecución local

## 1. Clonar repositorio

```bash
git clone https://github.com/Isco-Lina/ProyectoAquaCar.git
```

## 2. Importar base de datos

Importar el archivo SQL ubicado en la carpeta `/database` utilizando MySQL Workbench.

## 3. Configurar variables de entorno

Crear archivo `.env` dentro de `/backend` con la configuración correspondiente:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=bd_aquacar
PORT=3000
```

## 4. Instalar dependencias

```bash
npm install
```

## 5. Ejecutar backend

```bash
npm start
```

---

# Sistema desplegado

## Frontend

https://aquacar-frontend.onrender.com

## Backend/API

https://aquacar-backen.onrender.com

---

# Credenciales de prueba

## Perfil administrador

Correo: admin@aquacar.cl  
Contraseña: 123456

## Perfil cliente

Nombre: Juan  
Apellido: Pérez  
Correo: cliente@aquacar.cl  
Contraseña: cliente123

---

# Repositorio

https://github.com/Isco-Lina/ProyectoAquaCar

---

# Autor

Francisco Javier Antonio Molina Carrillo

Proyecto de Título — Ingeniería en Informática  
2026
