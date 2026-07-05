const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");
const {
  validarEmail,
  validarContrasena,
  validarTelefonoChileno,
  sanitizarString,
} = require("../utils/validaciones");

router.post("/usuarios", (req, res) => {
  const { nombre, apellido, correo, contrasena, telefono } = req.body;

  // Validar campos obligatorios
  if (!nombre || !apellido || !correo || !contrasena || !telefono) {
    return res.status(400).json({
      mensaje: "Todos los campos son obligatorios",
    });
  }

  // Validar email
  const validacionEmail = validarEmail(correo);
  if (!validacionEmail.valido) {
    return res.status(400).json({ mensaje: validacionEmail.error });
  }

  // Validar contraseña
  const validacionContrasena = validarContrasena(contrasena);
  if (!validacionContrasena.valido) {
    return res.status(400).json({ mensaje: validacionContrasena.error });
  }

  // Validar teléfono chileno
  const validacionTelefono = validarTelefonoChileno(telefono);
  if (!validacionTelefono.valido) {
    return res.status(400).json({ mensaje: validacionTelefono.error });
  }

  // Sanitizar nombre y apellido
  const nombreSanitizado = sanitizarString(nombre);
  const apellidoSanitizado = sanitizarString(apellido);

  if (!nombreSanitizado || !apellidoSanitizado) {
    return res.status(400).json({
      mensaje: "Nombre y apellido no pueden estar vacíos",
    });
  }

  const sqlVerificarCorreo = "SELECT id_usuario FROM USUARIO WHERE correo = ?";

  db.query(sqlVerificarCorreo, [correo.toLowerCase()], (error, results) => {
    if (error) {
      console.error("Error verificar correo:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        mensaje: "El correo ya está registrado",
      });
    }

    bcrypt.hash(contrasena, 10, (hashError, contrasenaHash) => {
      if (hashError) {
        console.error("Error hash contraseña:", hashError);
        return res.status(500).json({
          mensaje: "Error interno del servidor",
        });
      }

      const sqlInsertar = `
        INSERT INTO USUARIO (id_rol, nombre, apellido, correo, contrasena, telefono, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      db.query(
        sqlInsertar,
        [
          2,
          nombreSanitizado,
          apellidoSanitizado,
          correo.toLowerCase(),
          contrasenaHash,
          telefono,
        ],
        (error, results) => {
          if (error) {
            console.error("Error insertar usuario:", error);
            return res.status(500).json({
              mensaje: "Error interno del servidor",
            });
          }

          res.status(201).json({
            mensaje: "Usuario registrado correctamente",
            id_usuario: results.insertId,
          });
        },
      );
    });
  });
});

router.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({
      mensaje: "Correo y contraseña son obligatorios",
    });
  }

  const sql = `
    SELECT 
      u.id_usuario,
      u.id_rol,
      r.nombre_rol AS rol,
      u.nombre,
      u.apellido,
      u.correo,
      u.contrasena,
      u.telefono,
      u.fecha_registro
    FROM USUARIO u
    INNER JOIN ROL r ON u.id_rol = r.id_rol
    WHERE u.correo = ?
  `;

  db.query(sql, [correo.toLowerCase()], (error, results) => {
    if (error) {
      console.error("Error en login:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas",
      });
    }

    const usuario = results[0];

    bcrypt.compare(contrasena, usuario.contrasena, (compareError, coincide) => {
      if (compareError) {
        console.error("Error bcrypt compare:", compareError);
        return res.status(500).json({
          mensaje: "Error interno del servidor",
        });
      }

      if (!coincide) {
        return res.status(401).json({
          mensaje: "Credenciales incorrectas",
        });
      }

      const { contrasena: _contrasena, ...usuarioSinContrasena } = usuario;

      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          id_rol: usuario.id_rol,
          rol: usuario.rol,
          correo: usuario.correo,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES || "8h",
        },
      );

      res.json({
        mensaje: "Login exitoso",
        usuario: usuarioSinContrasena,
        token,
      });
    });
  });
});

router.get("/usuarios/clientes", verificarToken, soloAdmin, (req, res) => {
  const sql = `
    SELECT 
      u.id_usuario,
      u.nombre,
      u.apellido,
      u.correo,
      u.telefono,
      u.fecha_registro,
      COUNT(DISTINCT v.id_vehiculo) AS total_vehiculos,
      COUNT(DISTINCT r.id_reserva) AS total_reservas
    FROM USUARIO u
    LEFT JOIN VEHICULO v ON u.id_usuario = v.id_usuario
    LEFT JOIN RESERVA r ON u.id_usuario = r.id_usuario
    WHERE u.id_rol = 2
    GROUP BY 
      u.id_usuario,
      u.nombre,
      u.apellido,
      u.correo,
      u.telefono,
      u.fecha_registro
    ORDER BY u.id_usuario DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener clientes",
        error: error.message,
      });
    }

    res.json(results);
  });
});

module.exports = router;
