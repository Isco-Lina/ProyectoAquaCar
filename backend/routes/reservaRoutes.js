const express = require("express");
const router = express.Router();
const db = require("../db");

const {
  verificarToken,
  soloAdmin,
  soloCliente,
} = require("../middlewares/authMiddleware");

const {
  validarIdNumerico,
  validarFechaNoEsPasada,
  validarHora,
  sanitizarString,
} = require("../utils/validaciones");

router.post("/reservas", verificarToken, soloCliente, (req, res) => {
  const {
    id_vehiculo,
    id_servicio,
    fecha_reserva,
    hora_reserva,
    observaciones,
  } = req.body;

  const id_usuario = req.usuario.id_usuario;
  const id_estado = 1;

  if (!id_vehiculo || !id_servicio || !fecha_reserva || !hora_reserva) {
    return res.status(400).json({
      mensaje: "Todos los campos obligatorios deben ser completados",
    });
  }

  // Validar IDs numéricos
  const validacionVehiculo = validarIdNumerico(id_vehiculo, "ID vehículo");
  if (!validacionVehiculo.valido) {
    return res.status(400).json({ mensaje: validacionVehiculo.error });
  }

  const validacionServicio = validarIdNumerico(id_servicio, "ID servicio");
  if (!validacionServicio.valido) {
    return res.status(400).json({ mensaje: validacionServicio.error });
  }

  // Validar fecha no sea pasada
  const validacionFecha = validarFechaNoEsPasada(fecha_reserva);
  if (!validacionFecha.valido) {
    return res.status(400).json({ mensaje: validacionFecha.error });
  }

  // Validar hora válida
  const validacionHora = validarHora(hora_reserva);
  if (!validacionHora.valido) {
    return res.status(400).json({ mensaje: validacionHora.error });
  }

  // Sanitizar observaciones
  const observacionesSanitizadas = sanitizarString(observaciones || "", 500);

  const sqlValidarVehiculo = `
    SELECT id_vehiculo
    FROM VEHICULO
    WHERE id_vehiculo = ?
    AND id_usuario = ?
  `;

  db.query(
    sqlValidarVehiculo,
    [validacionVehiculo.valor, id_usuario],
    (error, vehiculos) => {
      if (error) {
        console.error("Error validar vehículo:", error);
        return res.status(500).json({
          mensaje: "Error interno del servidor",
        });
      }

      if (vehiculos.length === 0) {
        return res.status(403).json({
          mensaje: "No puedes reservar con un vehículo que no te pertenece",
        });
      }

      const sqlValidacion = `
      SELECT id_reserva FROM RESERVA
      WHERE fecha_reserva = ?
      AND hora_reserva = ?
      AND id_servicio = ?
      AND id_estado != 4
    `;

      db.query(
        sqlValidacion,
        [fecha_reserva, hora_reserva, validacionServicio.valor],
        (error, results) => {
          if (error) {
            console.error("Error validar disponibilidad:", error);
            return res.status(500).json({
              mensaje: "Error interno del servidor",
            });
          }

          if (results.length > 0) {
            return res.status(400).json({
              mensaje: "El horario seleccionado no está disponible",
            });
          }

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
              validacionVehiculo.valor,
              validacionServicio.valor,
              id_estado,
              fecha_reserva,
              hora_reserva,
              observacionesSanitizadas || null,
            ],
            (error, results) => {
              if (error) {
                console.error("Error registrar reserva:", error);
                return res.status(500).json({
                  mensaje: "Error interno del servidor",
                });
              }

              res.status(201).json({
                mensaje: "Reserva registrada correctamente",
                id_reserva: results.insertId,
              });
            },
          );
        },
      );
    },
  );
});

router.get("/reservas", verificarToken, soloAdmin, (req, res) => {
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
      console.error("Error obtener reservas:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }

    res.json(results);
  });
});

router.get(
  "/reservas/usuario/:id_usuario",
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
        mensaje: "No puedes consultar reservas de otro usuario",
      });
    }

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

    db.query(sql, [validacionId.valor], (error, results) => {
      if (error) {
        console.error("Error obtener reservas usuario:", error);
        return res.status(500).json({
          mensaje: "Error interno del servidor",
        });
      }

      res.json(results);
    });
  },
);

router.get("/reservas/ocupadas", verificarToken, soloCliente, (req, res) => {
  const { fecha_reserva, id_servicio } = req.query;

  if (!fecha_reserva || !id_servicio) {
    return res.status(400).json({
      mensaje: "La fecha y el servicio son obligatorios",
    });
  }

  // Validar ID servicio
  const validacionServicio = validarIdNumerico(id_servicio, "ID servicio");
  if (!validacionServicio.valido) {
    return res.status(400).json({ mensaje: validacionServicio.error });
  }

  // Validar fecha
  const validacionFecha = validarFechaNoEsPasada(fecha_reserva);
  if (!validacionFecha.valido) {
    return res.status(400).json({ mensaje: validacionFecha.error });
  }

  const sql = `
    SELECT hora_reserva
    FROM RESERVA
    WHERE fecha_reserva = ?
    AND id_servicio = ?
    AND id_estado != 4
  `;

  db.query(sql, [fecha_reserva, validacionServicio.valor], (error, results) => {
    if (error) {
      console.error("Error obtener horarios ocupados:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }

    res.json(results);
  });
});

router.get("/reservas/:id", verificarToken, (req, res) => {
  const { id } = req.params;

  // Validar ID numérico
  const validacionId = validarIdNumerico(id, "ID reserva");
  if (!validacionId.valido) {
    return res.status(400).json({ mensaje: validacionId.error });
  }

  const sql = `
    SELECT 
      r.id_reserva,
      r.id_usuario,
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

  db.query(sql, [validacionId.valor], (error, results) => {
    if (error) {
      console.error("Error obtener reserva:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        mensaje: "Reserva no encontrada",
      });
    }

    const reserva = results[0];

    if (
      req.usuario.rol !== "admin" &&
      Number(reserva.id_usuario) !== Number(req.usuario.id_usuario)
    ) {
      return res.status(403).json({
        mensaje: "No puedes consultar esta reserva",
      });
    }

    res.json(reserva);
  });
});

router.put(
  "/reservas/:id_reserva/estado",
  verificarToken,
  soloAdmin,
  (req, res) => {
    const { id_reserva } = req.params;
    const { id_estado } = req.body;

    // Validar IDs numéricos
    const validacionReserva = validarIdNumerico(id_reserva, "ID reserva");
    if (!validacionReserva.valido) {
      return res.status(400).json({ mensaje: validacionReserva.error });
    }

    const validacionEstado = validarIdNumerico(id_estado, "ID estado");
    if (!validacionEstado.valido) {
      return res.status(400).json({ mensaje: validacionEstado.error });
    }

    const sql = `
    UPDATE RESERVA
    SET id_estado = ?
    WHERE id_reserva = ?
  `;

    db.query(
      sql,
      [validacionEstado.valor, validacionReserva.valor],
      (error, results) => {
        if (error) {
          console.error("Error actualizar estado reserva:", error);
          return res.status(500).json({
            mensaje: "Error interno del servidor",
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            mensaje: "Reserva no encontrada",
          });
        }

        res.json({
          mensaje: "Estado de reserva actualizado correctamente",
        });
      },
    );
  },
);

router.put(
  "/reservas/:id/cancelar",
  verificarToken,
  soloCliente,
  (req, res) => {
    const { id } = req.params;
    const id_usuario = req.usuario.id_usuario;

    // Validar ID numérico
    const validacionId = validarIdNumerico(id, "ID reserva");
    if (!validacionId.valido) {
      return res.status(400).json({ mensaje: validacionId.error });
    }

    const sql = `
    UPDATE RESERVA
    SET id_estado = 4
    WHERE id_reserva = ?
    AND id_usuario = ?
    AND id_estado IN (1, 2)
  `;

    db.query(sql, [validacionId.valor, id_usuario], (error, result) => {
      if (error) {
        console.error("Error cancelar reserva:", error);
        return res.status(500).json({
          mensaje: "Error interno del servidor",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          mensaje: "Reserva no encontrada o no cancelable",
        });
      }

      res.json({
        mensaje: "Reserva cancelada correctamente",
      });
    });
  },
);

router.delete("/reservas/:id", verificarToken, soloAdmin, (req, res) => {
  const { id } = req.params;

  // Validar ID numérico
  const validacionId = validarIdNumerico(id, "ID reserva");
  if (!validacionId.valido) {
    return res.status(400).json({ mensaje: validacionId.error });
  }

  const sql = "DELETE FROM RESERVA WHERE id_reserva = ?";

  db.query(sql, [validacionId.valor], (error, results) => {
    if (error) {
      console.error("Error eliminar reserva:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Reserva no encontrada",
      });
    }

    res.json({
      mensaje: "Reserva eliminada correctamente",
    });
  });
});

module.exports = router;
