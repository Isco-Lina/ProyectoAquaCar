const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/reservas', (req, res) => {
  const {
    id_usuario,
    id_vehiculo,
    id_servicio,
    id_estado,
    fecha_reserva,
    hora_reserva,
    observaciones
  } = req.body;

  if (!id_usuario || !id_vehiculo || !id_servicio || !id_estado || !fecha_reserva || !hora_reserva) {
    return res.status(400).json({
      mensaje: 'Todos los campos obligatorios deben ser completados'
    });
  }

  // validar disponibilidad
  const sqlValidacion = `
    SELECT * FROM RESERVA
    WHERE fecha_reserva = ?
    AND hora_reserva = ?
    AND id_estado != 4
  `;

  db.query(sqlValidacion, [fecha_reserva, hora_reserva], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: 'Error al validar disponibilidad',
        error: error.message
      });
    }

    if (results.length > 0) {
      return res.status(400).json({
        mensaje: 'El horario seleccionado no está disponible'
      });
    }

    // insertar reserva
    const sqlInsert = `
      INSERT INTO RESERVA (
        id_usuario,
        id_vehiculo,
        id_servicio,
        id_estado,
        fecha_reserva,
        hora_reserva,
        observaciones,
        fecha_creacion
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(
      sqlInsert,
      [
        id_usuario,
        id_vehiculo,
        id_servicio,
        id_estado,
        fecha_reserva,
        hora_reserva,
        observaciones || null
      ],
      (error, results) => {
        if (error) {
          return res.status(500).json({
            mensaje: 'Error al registrar reserva',
            error: error.message
          });
        }

        res.status(201).json({
          mensaje: 'Reserva registrada correctamente',
          id_reserva: results.insertId
        });
      }
    );
  });
});

router.get('/reservas', (req, res) => {
  const sql = `
    SELECT 
      r.id_reserva,
      r.id_usuario,
      r.id_vehiculo,
      r.id_servicio,
      r.id_estado,
      u.nombre,
      u.apellido,
      u.correo,
      u.telefono,
      v.marca,
      v.modelo,
      v.patente,
      v.tipo_vehiculo,
      v.color,
      s.nombre_servicio,
      e.nombre_estado,
      r.fecha_reserva,
      r.hora_reserva,
      r.observaciones,
      r.fecha_creacion
    FROM RESERVA r
    INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
    INNER JOIN VEHICULO v ON r.id_vehiculo = v.id_vehiculo
    INNER JOIN SERVICIO s ON r.id_servicio = s.id_servicio
    INNER JOIN ESTADO_RESERVA e ON r.id_estado = e.id_estado
    ORDER BY r.id_reserva DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: 'Error al obtener reservas',
        error: error.message
      });
    }

    res.json(results);
  });
});

router.get('/reservas/usuario/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT 
      r.id_reserva,
      r.id_estado,
      v.marca,
      v.modelo,
      v.patente,
      s.nombre_servicio,
      e.nombre_estado,
      r.fecha_reserva,
      r.hora_reserva,
      r.observaciones
    FROM RESERVA r
    INNER JOIN VEHICULO v ON r.id_vehiculo = v.id_vehiculo
    INNER JOIN SERVICIO s ON r.id_servicio = s.id_servicio
    INNER JOIN ESTADO_RESERVA e ON r.id_estado = e.id_estado
    WHERE r.id_usuario = ?
    ORDER BY r.id_reserva DESC
  `;

  db.query(sql, [id_usuario], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: 'Error al obtener reservas del usuario',
        error: error.message
      });
    }

    res.json(results);
  });
});

router.get('/reservas/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      r.id_reserva,
      u.nombre,
      u.apellido,
      v.marca,
      v.modelo,
      v.patente,
      s.nombre_servicio,
      e.nombre_estado,
      r.fecha_reserva,
      r.hora_reserva,
      r.observaciones,
      r.fecha_creacion
    FROM RESERVA r
    INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
    INNER JOIN VEHICULO v ON r.id_vehiculo = v.id_vehiculo
    INNER JOIN SERVICIO s ON r.id_servicio = s.id_servicio
    INNER JOIN ESTADO_RESERVA e ON r.id_estado = e.id_estado
    WHERE r.id_reserva = ?
  `;

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: 'Error al obtener la reserva',
        error: error.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    res.json(results[0]);
  });
});

router.put('/reservas/:id_reserva/estado', (req, res) => {
  const { id_reserva } = req.params;
  const { id_estado } = req.body;

  if (!id_estado) {
    return res.status(400).json({
      mensaje: 'El id_estado es obligatorio'
    });
  }

  const sql = `
    UPDATE RESERVA
    SET id_estado = ?
    WHERE id_reserva = ?
  `;

  db.query(sql, [id_estado, id_reserva], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: 'Error al actualizar estado de la reserva',
        error: error.message
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'No se encontró la reserva'
      });
    }

    res.json({
      mensaje: 'Estado de reserva actualizado correctamente'
    });
  });
});

router.put("/reservas/:id/cancelar", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE reserva
    SET id_estado = 4
    WHERE id_reserva = ?
  `;

  db.query(sql, [id], (error, result) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al cancelar la reserva",
        error: error.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Reserva no encontrada",
      });
    }

    res.json({
      mensaje: "Reserva cancelada correctamente",
    });
  });
});

router.delete('/reservas/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM RESERVA WHERE id_reserva = ?';

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: 'Error al eliminar la reserva',
        error: error.message
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        mensaje: 'Reserva no encontrada'
      });
    }

    res.json({
      mensaje: 'Reserva eliminada correctamente'
    });
  });
});

module.exports = router;