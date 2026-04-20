const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/vehiculos', (req, res) => {
  const { id_usuario, marca, modelo, patente, tipo_vehiculo, color } = req.body;

  if (!id_usuario || !marca || !modelo || !patente || !tipo_vehiculo) {
    return res.status(400).json({
      mensaje: 'Todos los campos obligatorios deben ser completados'
    });
  }

  const sqlVerificarPatente = 'SELECT * FROM VEHICULO WHERE patente = ?';

  db.query(sqlVerificarPatente, [patente], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: 'Error al verificar patente',
        error: error.message
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        mensaje: 'La patente ya está registrada'
      });
    }

    const sqlInsertar = `
      INSERT INTO VEHICULO (id_usuario, marca, modelo, patente, tipo_vehiculo, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sqlInsertar,
      [id_usuario, marca, modelo, patente, tipo_vehiculo, color || null],
      (error, results) => {
        if (error) {
          return res.status(500).json({
            mensaje: 'Error al registrar vehículo',
            error: error.message
          });
        }

        res.status(201).json({
          mensaje: 'Vehículo registrado correctamente',
          id_vehiculo: results.insertId
        });
      }
    );
  });
});

router.get('/vehiculos/usuario/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT * FROM VEHICULO
    WHERE id_usuario = ?
    ORDER BY id_vehiculo DESC
  `;

  db.query(sql, [id_usuario], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: 'Error al obtener vehículos del usuario',
        error: error.message
      });
    }

    res.json(results);
  });
});

router.get('/vehiculos', (req, res) => {
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
      return res.status(500).json({
        mensaje: 'Error al obtener vehículos',
        error: error.message
      });
    }

    res.json(results);
  });
});

module.exports = router;