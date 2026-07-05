const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      mensaje: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuario;
    next();
  } catch (error) {
    // No exponer detalles del error JWT
    return res.status(401).json({
      mensaje: "Token inválido o expirado",
    });
  }
}

function soloAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== "admin") {
    return res.status(403).json({
      mensaje: "Acceso solo para administradores",
    });
  }

  next();
}

function soloCliente(req, res, next) {
  if (!req.usuario || req.usuario.rol !== "cliente") {
    return res.status(403).json({
      mensaje: "Acceso solo para clientes",
    });
  }

  next();
}

module.exports = {
  verificarToken,
  soloAdmin,
  soloCliente,
};
