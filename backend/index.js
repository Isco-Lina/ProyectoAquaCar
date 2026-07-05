const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const db = require("./db");

const usuarioRoutes = require("./routes/usuarioRoutes");
const vehiculoRoutes = require("./routes/vehiculoRoutes");
const servicioRoutes = require("./routes/servicioRoutes");
const reservaRoutes = require("./routes/reservaRoutes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

const localOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const productionOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : [];

const allowedOrigins = [...localOrigins, ...productionOrigins];

const corsOptions = {
  origin(origin, callback) {
    // Permite Postman, curl o llamadas internas sin Origin.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origen no permitido por CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "20kb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    mensaje: "Demasiadas solicitudes. Intenta nuevamente más tarde.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: {
    mensaje: "Demasiados intentos de login. Intenta nuevamente en unos minutos.",
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    mensaje: "Demasiados intentos de registro. Intenta nuevamente en una hora.",
  },
});

app.use("/api", apiLimiter);
app.use("/api/login", loginLimiter);
app.use("/api/usuarios", registerLimiter);

app.get("/", (req, res) => {
  res.send("Servidor AquaCar funcionando");
});

app.get("/health", (req, res) => {
  res.json({ estado: "ok", servicio: "AquaCar API" });
});

app.get("/test-db", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ mensaje: "No autorizado" });
  }

  db.query("SELECT 1 AS test", (error, results) => {
    if (error) {
      console.error("Error test-db:", error);
      return res.status(500).json({ mensaje: "Error interno del servidor" });
    }

    res.json({
      mensaje: "Conexión a la base de datos exitosa",
      resultado: results,
    });
  });
});

app.use("/api", usuarioRoutes);
app.use("/api", vehiculoRoutes);
app.use("/api", servicioRoutes);
app.use("/api", reservaRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

app.use((error, req, res, next) => {
  console.error("Error global:", error);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor AquaCar corriendo en puerto ${PORT}`);
});
