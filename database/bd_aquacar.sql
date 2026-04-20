USE aquacar_db;

CREATE TABLE ROL (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE USUARIO (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    fecha_registro DATETIME NOT NULL,
    CONSTRAINT FK_USUARIO_ROL FOREIGN KEY (id_rol)
        REFERENCES ROL(id_rol)
);

CREATE TABLE VEHICULO (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    marca VARCHAR(30) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    patente VARCHAR(15) NOT NULL,
    tipo_vehiculo VARCHAR(30) NOT NULL,
    color VARCHAR(20),
    CONSTRAINT FK_VEHICULO_USUARIO FOREIGN KEY (id_usuario)
        REFERENCES USUARIO(id_usuario)
);

CREATE TABLE SERVICIO (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300) NOT NULL,
    duracion_minutos INT NOT NULL,
    precio DECIMAL(10,0) NOT NULL,
    activo BOOLEAN NOT NULL
);

CREATE TABLE ESTADO_RESERVA (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL
);

CREATE TABLE RESERVA (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_vehiculo INT NOT NULL,
    id_servicio INT NOT NULL,
    id_estado INT NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    observaciones VARCHAR(300),
    fecha_creacion DATETIME NOT NULL,
    CONSTRAINT FK_RESERVA_USUARIO FOREIGN KEY (id_usuario)
        REFERENCES USUARIO(id_usuario),
    CONSTRAINT FK_RESERVA_VEHICULO FOREIGN KEY (id_vehiculo)
        REFERENCES VEHICULO(id_vehiculo),
    CONSTRAINT FK_RESERVA_SERVICIO FOREIGN KEY (id_servicio)
        REFERENCES SERVICIO(id_servicio),
    CONSTRAINT FK_RESERVA_ESTADO FOREIGN KEY (id_estado)
        REFERENCES ESTADO_RESERVA(id_estado)
);

INSERT INTO ROL (nombre_rol)
VALUES ('admin'), ('cliente');

INSERT INTO ESTADO_RESERVA (nombre_estado)
VALUES 
('Pendiente'),
('Confirmada'),
('Completada'),
('Cancelada');

INSERT INTO SERVICIO (nombre_servicio, descripcion, duracion_minutos, precio, activo)
VALUES
('Lavado Basico', 'Lavado exterior', 30, 10000, TRUE),
('Lavado Full', 'Interior + exterior', 60, 15000, TRUE),
('Full + Encerado', 'Servicio completo premium', 90, 20000, TRUE);

INSERT INTO USUARIO (id_rol, nombre, apellido, correo, contrasena, telefono, fecha_registro)
VALUES (
    1,
    'Admin',
    'AquaCar',
    'admin@aquacar.cl',
    '123456',
    '982820443',
    NOW()
);

SHOW TABLES;

SELECT * FROM ROL;
SELECT * FROM USUARIO;
SELECT * FROM VEHICULO;
SELECT * FROM SERVICIO;
SELECT * FROM ESTADO_RESERVA;
SELECT * FROM RESERVA;

