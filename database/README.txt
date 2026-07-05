README - Base de Datos AquaCar

Proyecto:
AquaCar - Sistema web para la gestión de reservas, servicios y clientes.

Estudiante:
Francisco Javier Antonio Molina Carrillo.

Tecnología utilizada:
MySQL.

Archivos incluidos:

1. bd_aquacar.sql
Script SQL que contiene la creación de las tablas, relaciones, restricciones y datos iniciales utilizados por el sistema.

2. Modelo Entidad - Relacion (Notacion Chen).png
Diagrama entidad-relación del proyecto AquaCar.

3. Modelo_de_datos_relacional.png
Modelo relacional/físico de la base de datos generado en MySQL Workbench.

Descripción general:

La base de datos fue desarrollada para apoyar el funcionamiento del sistema AquaCar, permitiendo almacenar la información de usuarios, vehículos, servicios y reservas realizadas dentro de la plataforma.

La estructura principal considera las siguientes tablas:

ROL:
Contiene los perfiles de usuario utilizados por el sistema, correspondientes a administrador y cliente.

USUARIO:
Guarda la información de los usuarios registrados, incluyendo datos personales, correo, contraseña cifrada y rol asociado.

VEHICULO:
Almacena los vehículos registrados por cada usuario.

SERVICIO:
Contiene los servicios disponibles dentro de AquaCar, junto con su descripción, duración y precio.

ESTADO_RESERVA:
Define los distintos estados que puede tener una reserva.

RESERVA:
Tabla principal encargada de relacionar usuarios, vehículos, servicios y estados de reserva.

Relaciones principales:
- Un rol puede estar asociado a varios usuarios.
- Un usuario puede registrar varios vehículos.
- Un usuario puede realizar múltiples reservas.
- Un vehículo puede participar en distintas reservas.
- Un servicio puede ser utilizado en varias reservas.
- Un estado de reserva puede estar asociado a muchas reservas.

Integridad de datos:

La base de datos utiliza claves primarias y claves foráneas para mantener relación entre las tablas y asegurar consistencia de información. También se utilizan restricciones UNIQUE en campos como correo y patente.

Datos iniciales incluidos:

El script incorpora:
- Roles del sistema.
- Estados de reserva.
- Servicios base de AquaCar.
- Usuarios de prueba para perfil administrador y cliente.

Credenciales de prueba:

Administrador
Correo: admin@aquacar.cl
Contraseña: 123456

Cliente
Correo: cliente@aquacar.cl
Contraseña: 123456

Importante:

Las contraseñas almacenadas en la base de datos se encuentran cifradas mediante bcryptjs.

El usuario administrador es creado directamente desde el script SQL, ya que el sistema solo permite registrar usuarios cliente desde la interfaz web.

Instrucciones de ejecución:

1. Abrir MySQL Workbench o cualquier herramienta compatible con MySQL.
2. Ejecutar el archivo bd_aquacar.sql.
3. Verificar que las tablas se hayan creado correctamente.
4. Verificar que los datos iniciales hayan sido insertados.
5. Ejecutar el backend desarrollado en Node.js y Express.
6. Acceder al sistema desde el frontend web.

Observación:

La comunicación con la base de datos se realiza desde el backend del sistema mediante Node.js y Express, utilizando consultas SQL para el manejo de usuarios, servicios, vehículos y reservas.
