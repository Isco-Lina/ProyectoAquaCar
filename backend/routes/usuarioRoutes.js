const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

router.post("/usuarios", (req, res) => {
  const { nombre, apellido, correo, contrasena, telefono } = req.body;

  if (!nombre || !apellido || !correo || !contrasena || !telefono) {
    return res.status(400).json({
      mensaje: "Todos los campos son obligatorios",
    });
  }

  const sqlVerificarCorreo = "SELECT * FROM USUARIO WHERE correo = ?";

  db.query(sqlVerificarCorreo, [correo], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al verificar correo",
        error: error.message,
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        mensaje: "El correo ya está registrado",
      });
    }

    const SALT_ROUNDS = 10;

    bcrypt.hash(contrasena, SALT_ROUNDS, (hashError, contrasenaHash) => {
      if (hashError) {
        return res.status(500).json({
          mensaje: "Error al proteger contraseña",
          error: hashError.message,
        });
      }

      const sqlInsertar = `
        INSERT INTO USUARIO (id_rol, nombre, apellido, correo, contrasena, telefono, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      db.query(
        sqlInsertar,
        [2, nombre, apellido, correo, contrasenaHash, telefono],
        (error, results) => {
          if (error) {
            return res.status(500).json({
              mensaje: "Error al registrar usuario",
              error: error.message,
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

  db.query(sql, [correo], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error en el login",
        error: error.message,
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
        return res.status(500).json({
          mensaje: "Error en el login",
          error: compareError.message,
        });
      }

      if (!coincide) {
        return res.status(401).json({
          mensaje: "Credenciales incorrectas",
        });
      }

      const { contrasena: _contrasena, ...usuarioSinContrasena } = usuario;

      res.json({
        mensaje: "Login exitoso",
        usuario: usuarioSinContrasena,
      });
    });
  });
});

router.get("/usuarios/clientes", (req, res) => {
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
    INNER JOIN ROL ro ON u.id_rol = ro.id_rol
    LEFT JOIN VEHICULO v ON u.id_usuario = v.id_usuario
    LEFT JOIN RESERVA r ON u.id_usuario = r.id_usuario
    WHERE ro.nombre_rol = 'cliente'
    GROUP BY 
      u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, u.fecha_registro
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
