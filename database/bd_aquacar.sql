USE aquacar;
CREATE TABLE ROL (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE USUARIO (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_USUARIO_ROL FOREIGN KEY (id_rol)
        REFERENCES ROL(id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VEHICULO (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    marca VARCHAR(30) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    patente VARCHAR(15) NOT NULL UNIQUE,
    tipo_vehiculo VARCHAR(30) NOT NULL,
    color VARCHAR(20),
    CONSTRAINT FK_VEHICULO_USUARIO FOREIGN KEY (id_usuario)
        REFERENCES USUARIO(id_usuario)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE SERVICIO (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300) NOT NULL,
    duracion_minutos INT NOT NULL,
    precio DECIMAL(10,0) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    categoria VARCHAR(20) NOT NULL DEFAULT 'otros',
    imagen_url VARCHAR(255),
    CONSTRAINT CHK_SERVICIO_DURACION CHECK (duracion_minutos > 0),
    CONSTRAINT CHK_SERVICIO_PRECIO CHECK (precio >= 0),
    CONSTRAINT CHK_SERVICIO_CATEGORIA CHECK (categoria IN ('sedan', 'suv', 'extra', 'otros'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ESTADO_RESERVA (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE RESERVA (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_vehiculo INT NOT NULL,
    id_servicio INT NOT NULL,
    id_estado INT NOT NULL DEFAULT 1,
    fecha_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    observaciones VARCHAR(500),
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_RESERVA_USUARIO FOREIGN KEY (id_usuario)
        REFERENCES USUARIO(id_usuario)
        ON DELETE CASCADE,
    CONSTRAINT FK_RESERVA_VEHICULO FOREIGN KEY (id_vehiculo)
        REFERENCES VEHICULO(id_vehiculo)
        ON DELETE CASCADE,
    CONSTRAINT FK_RESERVA_SERVICIO FOREIGN KEY (id_servicio)
        REFERENCES SERVICIO(id_servicio),
    CONSTRAINT FK_RESERVA_ESTADO FOREIGN KEY (id_estado)
        REFERENCES ESTADO_RESERVA(id_estado),
    INDEX IDX_RESERVA_FECHA_HORA_SERVICIO (fecha_reserva, hora_reserva, id_servicio),
    INDEX IDX_RESERVA_USUARIO (id_usuario),
    INDEX IDX_RESERVA_ESTADO (id_estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO ROL (nombre_rol)
VALUES
('admin'),
('cliente');

INSERT INTO ESTADO_RESERVA (nombre_estado)
VALUES
('Pendiente'),
('Confirmada'),
('Completada'),
('Cancelada');

INSERT INTO SERVICIO
(nombre_servicio, descripcion, duracion_minutos, precio, activo, categoria, imagen_url)
VALUES
('Lavado Basico', 'Lavado exterior para city car o sedan', 30, 12000, TRUE, 'sedan', '../images/catalogo/lavado-basico.png'),
('Lavado Full', 'Lavado interior y exterior para city car o sedan', 60, 17000, TRUE, 'sedan', '../images/catalogo/lavado-full.png'),
('Full + Encerado', 'Servicio completo premium con encerado para city car o sedan', 90, 40000, TRUE, 'sedan', '../images/catalogo/lavado-encerado.png'),
('Lavado Basico SUV / Camioneta', 'Lavado exterior para SUV o camioneta', 30, 12000, TRUE, 'suv', '../images/catalogo/basico-suv-camioneta.png'),
('Lavado Full SUV / Camioneta', 'Lavado interior y exterior para SUV o camioneta', 60, 20000, TRUE, 'suv', '../images/catalogo/full-suv-camioneta.png'),
('Full + Encerado SUV / Camioneta', 'Servicio completo premium con encerado para SUV o camioneta', 90, 50000, TRUE, 'suv', '../images/catalogo/encerado-suv-camioneta.png'),
('Pulido de Focos', 'Pulido y restauracion de focos', 60, 15000, TRUE, 'extra', '../images/catalogo/pulido-focos.png'),
('Lavado de Motor', 'Limpieza cuidadosa de motor', 60, 15000, TRUE, 'extra', '../images/catalogo/lavado-motor.png'),
('Lavado Moto', 'Lavado exterior para motocicleta', 30, 10000, TRUE, 'extra', '../images/catalogo/lavado-moto.png');

-- Usuarios de prueba.
-- Contraseñas bcrypt compatibles con el login actual.
INSERT INTO USUARIO
(id_rol, nombre, apellido, correo, contrasena, telefono, fecha_registro)
VALUES
(1, 'Administrador', 'AquaCar', 'admin@aquacar.cl', '$2b$10$pCjrCFNyS55BAMjVmAixoOme/6Q7lKdspDBMUcAC4IVdW5mtFEl7C', '999999999', NOW()),
(2, 'Cliente', 'Prueba', 'cliente@aquacar.cl', '$2b$10$roMeoBFSHvdUcswDHN/nGuXjOAqNjiPb2L5isr/PZlA12OQ8VGCFC', '988888888', NOW());
