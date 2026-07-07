Carpeta database

Esta carpeta contiene el script SQL principal de AquaCar 2.0.

Archivo incluido

bd_aquacar.sql

Este archivo crea la estructura de la base de datos MySQL utilizada por el proyecto. Incluye las tablas necesarias para usuarios, roles, vehículos, servicios, estados de reserva y reservas.

Tablas principales

- ROL: roles del sistema.
- USUARIO: usuarios registrados.
- VEHICULO: vehículos asociados a cada cliente.
- SERVICIO: servicios disponibles en AquaCar.
- ESTADO_RESERVA: estados posibles de una reserva.
- RESERVA: reservas realizadas por los clientes.

Datos iniciales

El script incorpora:

- Roles base: admin y cliente.
- Estados de reserva: Pendiente, Confirmada, Completada y Cancelada.
- Servicios iniciales del catálogo AquaCar.
- Usuarios de prueba.

Importación

1. Crear o seleccionar una base de datos MySQL.
2. Ejecutar el archivo bd_aquacar.sql.
3. Configurar en el backend las variables de conexión correspondientes.

Nota

Si el script se ejecuta en Railway, no es necesario agregar CREATE DATABASE ni USE railway si ya estás trabajando sobre la base de datos seleccionada.

Antes de importar, se recomienda respaldar la información existente para evitar pérdida de datos.