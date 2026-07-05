const express = require("express");
const router = express.Router();
const db = require("../db");

const {
  verificarToken,
  soloAdmin,
  soloCliente,
} = require("../middlewares/authMiddleware");

const {
  validarPatente,
  validarIdNumerico,
  sanitizarString,
} = require("../utils/validaciones");

router.post("/vehiculos", verificarToken, soloCliente, (req, res) => {
  const { marca, modelo, patente, tipo_vehiculo, color } = req.body;

  const id_usuario = req.usuario.id_usuario;

  if (!marca || !modelo || !patente || !tipo_vehiculo) {
    return res.status(400).json({
      mensaje: "Todos los campos obligatorios deben ser completados",
    });
  }

  // Validar patente
  const validacionPatente = validarPatente(patente);
  if (!validacionPatente.valido) {
    return res.status(400).json({ mensaje: validacionPatente.error });
  }

  // Sanitizar strings
  const marcaSanitizada = sanitizarString(marca);
  const modeloSanitizado = sanitizarString(modelo);
  const tipoVehiculoSanitizado = sanitizarString(tipo_vehiculo);
  const colorSanitizado = sanitizarString(color || "");

  if (!marcaSanitizada || !modeloSanitizado || !tipoVehiculoSanitizado) {
    return res.status(400).json({
      mensaje: "Campos requeridos no pueden estar vacíos",
    });
  }

  const sqlVerificarPatente =
    "SELECT id_vehiculo FROM VEHICULO WHERE patente = ?";

  db.query(
    sqlVerificarPatente,
    [validacionPatente.valorNormalizado],
    (error, results) => {
      if (error) {
        console.error("Error verificar patente:", error);
        return res.status(500).json({
          mensaje: "Error interno del servidor",
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          mensaje: "La patente ya está registrada",
        });
      }

      const sqlInsertar = `
      INSERT INTO VEHICULO (id_usuario, marca, modelo, patente, tipo_vehiculo, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

      db.query(
        sqlInsertar,
        [
          id_usuario,
          marcaSanitizada,
          modeloSanitizado,
          validacionPatente.valorNormalizado,
          tipoVehiculoSanitizado,
          colorSanitizado || null,
        ],
        (error, results) => {
          if (error) {
            console.error("Error registrar vehículo:", error);
            return res.status(500).json({
              mensaje: "Error interno del servidor",
            });
          }

          res.status(201).json({
            mensaje: "Vehículo registrado correctamente",
            id_vehiculo: results.insertId,
          });
        },
      );
    },
  );
});

router.get(
  "/vehiculos/usuario/:id_usuario",
  verificarToken,
  soloCliente,
  (req, res) => {
    const { id_usuario } = req.params;

    // Validar ID numérico
    const validacionId = validarIdNumerico(id_usuario, "ID usuario");
    if (!validacionId.valido) {
      return res.status(400).json({ mensaje: validacionId.error });
    }

    if (validacionId.valor !== req.usuario.id_usuario) {
      return res.status(403).json({
        mensaje: "No puedes consultar vehículos de otro usuario",
      });
    }

    const sql = `
      SELECT * FROM VEHICULO
      WHERE id_usuario = ?
      ORDER BY id_vehiculo DESC
    `;

    db.query(sql, [validacionId.valor], (error, results) => {
      if (error) {
        console.error("Error obtener vehículos:", error);
        return res.status(500).json({
          mensaje: "Error interno del servidor",
        });
      }

      res.json(results);
    });
  },
);

router.get("/vehiculos", verificarToken, soloAdmin, (req, res) => {
  const sql = `
    SELECT
      v.id_vehiculo,
      v.id_usuario,
      v.marca,
      v.modelo,
      v.patente,
      v.tipo_vehiculo,
      v.color,
      u.nombre,
      u.apellido,
      u.correo,
      u.telefono
    FROM VEHICULO v
    INNER JOIN USUARIO u ON v.id_usuario = u.id_usuario
    ORDER BY v.id_vehiculo DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error obtener vehículos:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }

    res.json(results);
  });
});

module.exports = router;
