const express = require("express");
const router = express.Router();
const db = require("../db");

function horaAMinutos(hora) {
  const partes = hora.split(":");
  return parseInt(partes[0]) * 60 + parseInt(partes[1]);
}

function minutosAHora(minutos) {
  const h = Math.floor(minutos / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

router.post("/reservas", (req, res) => {
  const {
    id_usuario,
    id_vehiculo,
    id_servicio,
    id_estado,
    fecha_reserva,
    hora_reserva,
    observaciones,
  } = req.body;

  if (
    !id_usuario ||
    !id_vehiculo ||
    !id_servicio ||
    !id_estado ||
    !fecha_reserva ||
    !hora_reserva
  ) {
    return res.status(400).json({
      mensaje: "Todos los campos obligatorios deben ser completados",
    });
  }

  const sqlServicio = `
    SELECT duracion_minutos 
    FROM SERVICIO 
    WHERE id_servicio = ?
  `;

  db.query(sqlServicio, [id_servicio], (error, servicioResult) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al validar servicio",
        error: error.message,
      });
    }

    if (servicioResult.length === 0) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
      });
    }

    const duracionNueva = servicioResult[0].duracion_minutos;
    const inicioNuevo = horaAMinutos(hora_reserva);
    const finNuevo = inicioNuevo + duracionNueva;

    const sqlReservas = `
      SELECT 
        r.hora_reserva,
        s.duracion_minutos
      FROM RESERVA r
      INNER JOIN SERVICIO s ON r.id_servicio = s.id_servicio
      WHERE r.fecha_reserva = ?
      AND r.id_estado != 4
    `;

    db.query(sqlReservas, [fecha_reserva], (error, reservas) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al validar disponibilidad",
          error: error.message,
        });
      }

      const hayChoque = reservas.some((reserva) => {
        const inicioExistente = horaAMinutos(reserva.hora_reserva);
        const finExistente = inicioExistente + reserva.duracion_minutos;

        return inicioNuevo < finExistente && finNuevo > inicioExistente;
      });

      if (hayChoque) {
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
          id_vehiculo,
          id_servicio,
          id_estado,
          fecha_reserva,
          hora_reserva,
          observaciones || null,
        ],
        (error, results) => {
          if (error) {
            return res.status(500).json({
              mensaje: "Error al registrar reserva",
              error: error.message,
            });
          }

          res.status(201).json({
            mensaje: "Reserva registrada correctamente",
            id_reserva: results.insertId,
          });
        },
      );
    });
  });
});

router.get("/reservas", (req, res) => {
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
      ma.nombre_marca AS marca,
      mo.nombre_modelo AS modelo,
      tv.nombre_tipo AS tipo_vehiculo,
      co.nombre_color AS color,
      v.patente,
      s.nombre_servicio,
      s.descripcion,
      s.duracion_minutos,
      s.precio,
      er.nombre_estado,
      r.fecha_reserva,
      r.hora_reserva,
      r.observaciones,
      r.fecha_creacion
    FROM RESERVA r
    INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
    INNER JOIN VEHICULO v ON r.id_vehiculo = v.id_vehiculo
    INNER JOIN MODELO_VEHICULO mo ON v.id_modelo = mo.id_modelo
    INNER JOIN MARCA_VEHICULO ma ON mo.id_marca = ma.id_marca
    INNER JOIN TIPO_VEHICULO tv ON mo.id_tipo = tv.id_tipo
    INNER JOIN COLOR_VEHICULO co ON v.id_color = co.id_color
    INNER JOIN SERVICIO s ON r.id_servicio = s.id_servicio
    INNER JOIN ESTADO_RESERVA er ON r.id_estado = er.id_estado
    ORDER BY r.id_reserva DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener reservas",
        error: error.message,
      });
    }

    res.json(results);
  });
});

router.get("/reservas/usuario/:id_usuario", (req, res) => {
  const { id_usuario } = req.params;

  const sql = `
    SELECT 
      r.id_reserva,
      r.id_usuario,
      r.id_vehiculo,
      r.id_servicio,
      r.id_estado,
      ma.nombre_marca AS marca,
      mo.nombre_modelo AS modelo,
      tv.nombre_tipo AS tipo_vehiculo,
      co.nombre_color AS color,
      v.patente,
      s.descripcion,
      s.duracion_minutos,
      s.precio,
      s.nombre_servicio,
      er.nombre_estado,
      r.fecha_reserva,
      r.hora_reserva,
      r.observaciones,
      r.fecha_creacion
    FROM RESERVA r
    INNER JOIN VEHICULO v ON r.id_vehiculo = v.id_vehiculo
    INNER JOIN MODELO_VEHICULO mo ON v.id_modelo = mo.id_modelo
    INNER JOIN MARCA_VEHICULO ma ON mo.id_marca = ma.id_marca
    INNER JOIN TIPO_VEHICULO tv ON mo.id_tipo = tv.id_tipo
    INNER JOIN COLOR_VEHICULO co ON v.id_color = co.id_color
    INNER JOIN SERVICIO s ON r.id_servicio = s.id_servicio
    INNER JOIN ESTADO_RESERVA er ON r.id_estado = er.id_estado
    WHERE r.id_usuario = ?
    ORDER BY r.id_reserva DESC
  `;

  db.query(sql, [id_usuario], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener reservas del usuario",
        error: error.message,
      });
    }

    res.json(results);
  });
});

router.get("/reservas/disponibilidad", (req, res) => {
  const { fecha, id_servicio } = req.query;

  if (!fecha || !id_servicio) {
    return res.status(400).json({
      mensaje: "La fecha y el servicio son obligatorios",
    });
  }

  const sqlServicio = `
    SELECT duracion_minutos 
    FROM SERVICIO 
    WHERE id_servicio = ? AND activo = 1
  `;

  db.query(sqlServicio, [id_servicio], (error, servicioResult) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener duración del servicio",
        error: error.message,
      });
    }

    if (servicioResult.length === 0) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado o inactivo",
      });
    }

    const duracionNueva = servicioResult[0].duracion_minutos;

    const sqlReservas = `
      SELECT 
        r.hora_reserva,
        s.duracion_minutos
      FROM RESERVA r
      INNER JOIN SERVICIO s ON r.id_servicio = s.id_servicio
      WHERE r.fecha_reserva = ?
      AND r.id_estado != 4
    `;

    db.query(sqlReservas, [fecha], (error, reservas) => {
      if (error) {
        return res.status(500).json({
          mensaje: "Error al consultar reservas existentes",
          error: error.message,
        });
      }

      const inicioJornada = 9 * 60;
      const finJornada = 18 * 60;
      const intervalo = 30;

      const horariosDisponibles = [];

      for (
        let inicioNuevo = inicioJornada;
        inicioNuevo + duracionNueva <= finJornada;
        inicioNuevo += intervalo
      ) {
        const finNuevo = inicioNuevo + duracionNueva;

        const hayChoque = reservas.some((reserva) => {
          const inicioExistente = horaAMinutos(reserva.hora_reserva);
          const finExistente = inicioExistente + reserva.duracion_minutos;

          return inicioNuevo < finExistente && finNuevo > inicioExistente;
        });

        if (!hayChoque) {
          horariosDisponibles.push(minutosAHora(inicioNuevo));
        }
      }

      res.json({
        fecha,
        id_servicio,
        duracion_minutos: duracionNueva,
        horarios: horariosDisponibles,
      });
    });
  });
});

router.get("/reservas/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      r.id_reserva,
      u.nombre,
      u.apellido,
      ma.nombre_marca AS marca,
      mo.nombre_modelo AS modelo,
      tv.nombre_tipo AS tipo_vehiculo,
      co.nombre_color AS color,
      v.patente,
      s.nombre_servicio,
      s.descripcion,
      s.duracion_minutos,
      s.precio,
      er.nombre_estado,
      r.fecha_reserva,
      r.hora_reserva,
      r.observaciones,
      r.fecha_creacion
    FROM RESERVA r
    INNER JOIN USUARIO u ON r.id_usuario = u.id_usuario
    INNER JOIN VEHICULO v ON r.id_vehiculo = v.id_vehiculo
    INNER JOIN MODELO_VEHICULO mo ON v.id_modelo = mo.id_modelo
    INNER JOIN MARCA_VEHICULO ma ON mo.id_marca = ma.id_marca
    INNER JOIN TIPO_VEHICULO tv ON mo.id_tipo = tv.id_tipo
    INNER JOIN COLOR_VEHICULO co ON v.id_color = co.id_color
    INNER JOIN SERVICIO s ON r.id_servicio = s.id_servicio
    INNER JOIN ESTADO_RESERVA er ON r.id_estado = er.id_estado
    WHERE r.id_reserva = ?
  `;

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al obtener la reserva",
        error: error.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        mensaje: "Reserva no encontrada",
      });
    }

    res.json(results[0]);
  });
});

router.put("/reservas/:id_reserva/estado", (req, res) => {
  const { id_reserva } = req.params;
  const { id_estado } = req.body;

  if (!id_estado) {
    return res.status(400).json({
      mensaje: "El id_estado es obligatorio",
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
        mensaje: "Error al actualizar estado de la reserva",
        error: error.message,
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "No se encontró la reserva",
      });
    }

    res.json({
      mensaje: "Estado de reserva actualizado correctamente",
    });
  });
});

router.put("/reservas/:id/cancelar", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE RESERVA
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

router.delete("/reservas/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM RESERVA WHERE id_reserva = ?";

  db.query(sql, [id], (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: "Error al eliminar la reserva",
        error: error.message,
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
