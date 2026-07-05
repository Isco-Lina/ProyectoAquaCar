const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const router = express.Router();
const db = require("../db");
const { verificarToken, soloAdmin } = require("../middlewares/authMiddleware");
const { validarIdNumerico } = require("../utils/validaciones");

const uploadsServiciosDir = path.join(__dirname, "..", "uploads", "servicios");
const categoriasValidas = new Set(["sedan", "suv", "extra", "otros"]);
const tiposImagenValidos = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/pjpeg",
]);
const extensionesValidas = new Set([".jpg", ".jpeg", ".png", ".webp"]);

fs.mkdirSync(uploadsServiciosDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadsServiciosDir);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombreSeguro = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    callback(null, nombreSeguro);
  },
});

const uploadServicio = multer({
  storage,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeValido =
      tiposImagenValidos.has(file.mimetype) ||
      String(file.mimetype).startsWith("image/");

    if (!extensionesValidas.has(extension) || !mimeValido) {
      const error = new Error("Solo se permiten imágenes JPG, PNG o WEBP");
      error.codigo = "TIPO_IMAGEN_INVALIDO";
      return callback(error);
    }

    callback(null, true);
  },
});

function procesarImagenServicio(req, res, next) {
  uploadServicio.single("imagen")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        mensaje: "La imagen supera el límite máximo de 3MB",
        detalle: error.message,
        codigo: error.code || "LIMIT_FILE_SIZE",
      });
    }

    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        mensaje: "No se pudo procesar la imagen",
        detalle: error.message,
        codigo: error.code,
      });
    }

    if (error.codigo === "TIPO_IMAGEN_INVALIDO") {
      return res.status(400).json({
        mensaje: "Solo se permiten imágenes JPG, PNG o WEBP",
        detalle: error.message,
        codigo: error.code || error.codigo || "TIPO_IMAGEN_INVALIDO",
      });
    }

    return res.status(400).json({
      mensaje: "No se pudo procesar la imagen",
      detalle: error.message,
      codigo: error.code || error.codigo || "ERROR_IMAGEN",
    });
  });
}

function limpiarTexto(valor) {
  return String(valor ?? "").trim();
}

function normalizarCategoria(categoria) {
  if (categoria === undefined || categoria === null || categoria === "") {
    return { valor: null };
  }

  const valor = limpiarTexto(categoria).toLowerCase();

  if (!categoriasValidas.has(valor)) {
    return {
      error: "La categoría debe ser sedan, suv, extra u otros",
    };
  }

  return { valor };
}

function construirImagenServicio(req, imagenActual = null) {
  if (req.file) {
    return `/uploads/servicios/${req.file.filename}`;
  }

  const imagenFormulario = limpiarTexto(req.body.imagen_url);

  return imagenFormulario || imagenActual || null;
}

// Obtener todos los servicios
router.get("/servicios", verificarToken, soloAdmin, (req, res) => {
  const sql = `
    SELECT 
      id_servicio,
      nombre_servicio,
      descripcion,
      duracion_minutos,
      precio,
      activo,
      categoria,
      imagen_url
    FROM SERVICIO
    ORDER BY id_servicio DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error obtener servicios:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
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
      activo,
      categoria,
      imagen_url
    FROM SERVICIO
    WHERE activo = 1
    ORDER BY id_servicio DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error obtener servicios activos:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
      });
    }

    res.json(results);
  });
});

// Crear servicio
router.post(
  "/servicios",
  verificarToken,
  soloAdmin,
  procesarImagenServicio,
  (req, res) => {
    const {
      nombre_servicio,
      descripcion,
      duracion_minutos,
      precio,
      activo,
      categoria,
    } = req.body;

    const nombreServicio = limpiarTexto(nombre_servicio);
    const descripcionServicio = limpiarTexto(descripcion);
    const duracion = Number(duracion_minutos);
    const precioServicio = Number(precio);
    const estadoServicio =
      activo === undefined || activo === "" ? 1 : Number(activo);
    const categoriaNormalizada = normalizarCategoria(categoria);
    const imagenServicio = construirImagenServicio(req);

    if (!nombreServicio || !descripcionServicio) {
      return res.status(400).json({
        mensaje: "El nombre y la descripción son obligatorios",
      });
    }

    if (
      duracion_minutos === undefined ||
      duracion_minutos === "" ||
      !Number.isFinite(duracion) ||
      duracion < 0
    ) {
      return res.status(400).json({
        mensaje: "La duración debe ser un número válido mayor o igual a 0",
      });
    }

    if (
      precio === undefined ||
      precio === "" ||
      !Number.isFinite(precioServicio) ||
      precioServicio < 0
    ) {
      return res.status(400).json({
        mensaje: "El precio debe ser un número válido mayor o igual a 0",
      });
    }

    if (categoriaNormalizada.error) {
      return res.status(400).json({
        mensaje: categoriaNormalizada.error,
      });
    }

    if (![0, 1].includes(estadoServicio)) {
      return res.status(400).json({
        mensaje: "El estado del servicio debe ser 0 o 1",
      });
    }

    const sql = `
      INSERT INTO SERVICIO
      (nombre_servicio, descripcion, duracion_minutos, precio, activo, categoria, imagen_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        nombreServicio,
        descripcionServicio,
        duracion,
        precioServicio,
        estadoServicio,
        categoriaNormalizada.valor,
        imagenServicio,
      ],
      (error, result) => {
        if (error) {
          console.error("Error crear servicio:", error);
          return res.status(500).json({
            mensaje: "Error interno del servidor",
          });
        }

        res.status(201).json({
          mensaje: "Servicio creado correctamente",
          id_servicio: result.insertId,
        });
      },
    );
  },
);

// Actualizar servicio
router.put(
  "/servicios/:id",
  verificarToken,
  soloAdmin,
  procesarImagenServicio,
  (req, res) => {
    const { id } = req.params;
    const {
      nombre_servicio,
      descripcion,
      duracion_minutos,
      precio,
      activo,
      categoria,
    } = req.body;

    // Validar ID numérico
    const validacionId = validarIdNumerico(id, "ID servicio");
    if (!validacionId.valido) {
      return res.status(400).json({ mensaje: validacionId.error });
    }

    const nombreServicio = limpiarTexto(nombre_servicio);
    const descripcionServicio = limpiarTexto(descripcion);
    const duracion = Number(duracion_minutos);
    const precioServicio = Number(precio);

    if (!nombreServicio || !descripcionServicio) {
      return res.status(400).json({
        mensaje: "El nombre y la descripción son obligatorios",
      });
    }

    if (
      duracion_minutos === undefined ||
      duracion_minutos === "" ||
      !Number.isFinite(duracion) ||
      duracion < 0
    ) {
      return res.status(400).json({
        mensaje: "La duración debe ser un número válido mayor o igual a 0",
      });
    }

    if (
      precio === undefined ||
      precio === "" ||
      !Number.isFinite(precioServicio) ||
      precioServicio < 0
    ) {
      return res.status(400).json({
        mensaje: "El precio debe ser un número válido mayor o igual a 0",
      });
    }

    db.query(
      `SELECT categoria, imagen_url, activo FROM SERVICIO WHERE id_servicio = ?`,
      [validacionId.valor],
      (error, resultados) => {
        if (error) {
          console.error("Error actualizar servicio:", error);
          return res.status(500).json({
            mensaje: "Error interno del servidor",
          });
        }

        if (resultados.length === 0) {
          return res.status(404).json({
            mensaje: "Servicio no encontrado",
          });
        }

        const servicioActual = resultados[0];
        const categoriaNormalizada = normalizarCategoria(categoria);

        if (categoriaNormalizada.error) {
          return res.status(400).json({
            mensaje: categoriaNormalizada.error,
          });
        }

        const estadoServicio =
          activo === undefined || activo === ""
            ? Number(servicioActual.activo)
            : Number(activo);

        if (![0, 1].includes(estadoServicio)) {
          return res.status(400).json({
            mensaje: "El estado del servicio debe ser 0 o 1",
          });
        }

        const imagenServicio = construirImagenServicio(
          req,
          servicioActual.imagen_url,
        );
        const categoriaServicio =
          categoriaNormalizada.valor === null
            ? servicioActual.categoria
            : categoriaNormalizada.valor;

        const sql = `
          UPDATE SERVICIO
          SET 
            nombre_servicio = ?,
            descripcion = ?,
            duracion_minutos = ?,
            precio = ?,
            activo = ?,
            categoria = ?,
            imagen_url = ?
          WHERE id_servicio = ?
        `;

        db.query(
          sql,
          [
            nombreServicio,
            descripcionServicio,
            duracion,
            precioServicio,
            estadoServicio,
            categoriaServicio,
            imagenServicio,
            validacionId.valor,
          ],
          (errorActualizacion, result) => {
            if (errorActualizacion) {
              console.error("Error actualizar servicio:", errorActualizacion);
              return res.status(500).json({
                mensaje: "Error interno del servidor",
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
      },
    );
  },
);

// Cambiar estado activo/inactivo
router.put("/servicios/:id/estado", verificarToken, soloAdmin, (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  // Validar ID numérico
  const validacionId = validarIdNumerico(id, "ID servicio");
  if (!validacionId.valido) {
    return res.status(400).json({ mensaje: validacionId.error });
  }

  const estadoServicio = Number(activo);

  if (![0, 1].includes(estadoServicio)) {
    return res.status(400).json({
      mensaje: "El estado del servicio debe ser 0 o 1",
    });
  }

  const sql = `
    UPDATE SERVICIO
    SET activo = ?
    WHERE id_servicio = ?
  `;

  db.query(sql, [estadoServicio, validacionId.valor], (error, result) => {
    if (error) {
      console.error("Error cambiar estado servicio:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
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
router.delete("/servicios/:id", verificarToken, soloAdmin, (req, res) => {
  const { id } = req.params;

  // Validar ID numérico
  const validacionId = validarIdNumerico(id, "ID servicio");
  if (!validacionId.valido) {
    return res.status(400).json({ mensaje: validacionId.error });
  }

  const sql = `DELETE FROM SERVICIO WHERE id_servicio = ?`;

  db.query(sql, [validacionId.valor], (error, result) => {
    if (error) {
      console.error("Error eliminar servicio:", error);
      return res.status(500).json({
        mensaje: "Error interno del servidor",
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
