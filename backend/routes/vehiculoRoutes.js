const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/vehiculos/catalogo/marcas", (req, res) => {
  const sql = `
    SELECT id_marca, nombre_marca
    FROM MARCA_VEHICULO
    WHERE activo = 1
    ORDER BY nombre_marca ASC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener marcas",
        error: error.message,
      });
    }

    res.json(results);
  });
});

router.get("/vehiculos/catalogo/modelos/:id_marca", (req, res) => {
  const { id_marca } = req.params;

  const sql = `
    SELECT 
      mo.id_modelo,
      mo.nombre_modelo,
      ma.id_marca,
      ma.nombre_marca,
      tv.id_tipo,
      tv.nombre_tipo
    FROM MODELO_VEHICULO mo
    INNER JOIN MARCA_VEHICULO ma ON mo.id_marca = ma.id_marca
    INNER JOIN TIPO_VEHICULO tv ON mo.id_tipo = tv.id_tipo
    WHERE mo.id_marca = ?
      AND mo.activo = 1
      AND ma.activo = 1
    ORDER BY mo.nombre_modelo ASC
  `;

  db.query(sql, [id_marca], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener modelos",
        error: error.message,
      });
    }

    res.json(results);
  });
});

router.get("/vehiculos/catalogo/colores", (req, res) => {
  const sql = `
    SELECT id_color, nombre_color
    FROM COLOR_VEHICULO
    WHERE activo = 1
    ORDER BY nombre_color ASC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener colores",
        error: error.message,
      });
    }

    res.json(results);
  });
});

router.post("/vehiculos", (req, res) => {
  const { id_usuario, id_modelo, id_color, patente } = req.body;

  if (!id_usuario || !id_modelo || !id_color || !patente) {
    return res.status(400).json({
      mensaje: "Todos los campos obligatorios deben ser completados",
    });
  }

  const patenteMayuscula = patente
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (patenteMayuscula.length !== 6) {
    return res.status(400).json({
      mensaje: "La patente debe tener exactamente 6 caracteres.",
    });
  }

  const sqlValidarModelo = `
    SELECT id_modelo
    FROM MODELO_VEHICULO
    WHERE id_modelo = ?
      AND activo = 1
  `;

  db.query(sqlValidarModelo, [id_modelo], (error, modeloResult) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al validar modelo",
        error: error.message,
      });
    }

    if (modeloResult.length === 0) {
      return res.status(404).json({
        mensaje: "Modelo de vehículo no encontrado",
      });
    }

    const sqlValidarColor = `
      SELECT id_color
      FROM COLOR_VEHICULO
      WHERE id_color = ?
        AND activo = 1
    `;

    db.query(sqlValidarColor, [id_color], (error, colorResult) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al validar color",
          error: error.message,
        });
      }

      if (colorResult.length === 0) {
        return res.status(404).json({
          mensaje: "Color de vehículo no encontrado",
        });
      }

      const sqlVerificarPatente = `
        SELECT id_vehiculo
        FROM VEHICULO
        WHERE patente = ?
      `;

      db.query(
        sqlVerificarPatente,
        [patenteMayuscula],
        (error, patenteResult) => {
          if (error) {
            return res.status(500).json({
              mensaje: "Error al verificar patente",
              error: error.message,
            });
          }

          if (patenteResult.length > 0) {
            return res.status(409).json({
              mensaje: "La patente ya está registrada",
            });
          }

          const sqlInsertar = `
          INSERT INTO VEHICULO (
            id_usuario,
            id_modelo,
            id_color,
            patente
          )
          VALUES (?, ?, ?, ?)
        `;

          db.query(
            sqlInsertar,
            [id_usuario, id_modelo, id_color, patenteMayuscula],
            (error, results) => {
              if (error) {
                return res.status(500).json({
                  mensaje: "Error al registrar vehículo",
                  error: error.message,
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
  });
});

router.get("/vehiculos/usuario/:id_usuario", (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT 
      v.id_vehiculo,
      v.id_usuario,
      v.id_modelo,
      v.id_color,
      ma.nombre_marca AS marca,
      mo.nombre_modelo AS modelo,
      v.patente,
      tv.nombre_tipo AS tipo_vehiculo,
      co.nombre_color AS color
    FROM VEHICULO v
    INNER JOIN MODELO_VEHICULO mo ON v.id_modelo = mo.id_modelo
    INNER JOIN MARCA_VEHICULO ma ON mo.id_marca = ma.id_marca
    INNER JOIN TIPO_VEHICULO tv ON mo.id_tipo = tv.id_tipo
    INNER JOIN COLOR_VEHICULO co ON v.id_color = co.id_color
    WHERE v.id_usuario = ?
    ORDER BY v.id_vehiculo DESC
  `;

  db.query(sql, [id_usuario], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener vehículos del usuario",
        error: error.message,
      });
    }

    res.json(results);
  });
});

router.get("/vehiculos", (req, res) => {
  const sql = `
    SELECT
      v.id_vehiculo,
      v.id_usuario,
      v.id_modelo,
      v.id_color,
      ma.nombre_marca AS marca,
      mo.nombre_modelo AS modelo,
      v.patente,
      tv.nombre_tipo AS tipo_vehiculo,
      co.nombre_color AS color,
      u.nombre,
      u.apellido,
      u.correo,
      u.telefono
    FROM VEHICULO v
    INNER JOIN USUARIO u ON v.id_usuario = u.id_usuario
    INNER JOIN MODELO_VEHICULO mo ON v.id_modelo = mo.id_modelo
    INNER JOIN MARCA_VEHICULO ma ON mo.id_marca = ma.id_marca
    INNER JOIN TIPO_VEHICULO tv ON mo.id_tipo = tv.id_tipo
    INNER JOIN COLOR_VEHICULO co ON v.id_color = co.id_color
    ORDER BY v.id_vehiculo DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener vehículos",
        error: error.message,
      });
    }

    res.json(results);
  });
});

module.exports = router;
