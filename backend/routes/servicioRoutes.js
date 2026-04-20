const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener todos los servicios
router.get("/servicios", (req, res) => {
  const sql = `
    SELECT 
      id_servicio,
      nombre_servicio,
      descripcion,
      duracion_minutos,
      precio,
      activo
    FROM SERVICIO
    ORDER BY id_servicio DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener servicios",
        error: error.message,
      });
    }

    res.json(results);
  });
});

// Obtener solo servicios activos 
router.get("/servicios/activos", (req, res) => {
  const sql = `
    SELECT 
      id_servicio,
      nombre_servicio,
      descripcion,
      duracion_minutos,
      precio,
      activo
    FROM SERVICIO
    WHERE activo = 1
    ORDER BY id_servicio DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener servicios activos",
        error: error.message,
      });
    }

    res.json(results);
  });
});

// Crear servicio
router.post("/servicios", (req, res) => {
  const { nombre_servicio, descripcion, duracion_minutos, precio, activo } =
    req.body;

  if (
    !nombre_servicio ||
    !descripcion ||
    !duracion_minutos ||
    !precio
  ) {
    return res.status(400).json({
      mensaje: "Todos los campos son obligatorios",
    });
  }

  const sql = `
    INSERT INTO SERVICIO
    (nombre_servicio, descripcion, duracion_minutos, precio, activo)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nombre_servicio,
      descripcion,
      duracion_minutos,
      precio,
      activo ?? 1,
    ],
    (error, result) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al crear servicio",
          error: error.message,
        });
      }

      res.status(201).json({
        mensaje: "Servicio creado correctamente",
        id_servicio: result.insertId,
      });
    },
  );
});

// Actualizar servicio
router.put("/servicios/:id", (req, res) => {
  const { id } = req.params;
  const { nombre_servicio, descripcion, duracion_minutos, precio, activo } =
    req.body;

  if (
    !nombre_servicio ||
    !descripcion ||
    !duracion_minutos ||
    !precio
  ) {
    return res.status(400).json({
      mensaje: "Todos los campos son obligatorios",
    });
  }

  const sql = `
    UPDATE SERVICIO
    SET 
      nombre_servicio = ?,
      descripcion = ?,
      duracion_minutos = ?,
      precio = ?,
      activo = ?
    WHERE id_servicio = ?
  `;

  db.query(
    sql,
    [
      nombre_servicio,
      descripcion,
      duracion_minutos,
      precio,
      activo,
      id,
    ],
    (error, result) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al actualizar servicio",
          error: error.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          mensaje: "Servicio no encontrado",
        });
      }

      res.json({
        mensaje: "Servicio actualizado correctamente",
      });
    },
  );
});

// Cambiar estado activo/inactivo
router.put("/servicios/:id/estado", (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  const sql = `
    UPDATE SERVICIO
    SET activo = ?
    WHERE id_servicio = ?
  `;

  db.query(sql, [activo, id], (error, result) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al cambiar estado del servicio",
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
      });
    }

    res.json({
      mensaje: "Estado del servicio actualizado correctamente",
    });
  });
});

// Eliminar servicio
router.delete("/servicios/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM SERVICIO WHERE id_servicio = ?`;

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al eliminar servicio",
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
      });
    }

    res.json({
      mensaje: "Servicio eliminado correctamente",
    });
  });
});

module.exports = router;