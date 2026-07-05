const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO_CL = /^\+569\d{8}$/;
const REGEX_PATENTE = /^([A-Z]{2}\d{4}|[A-Z]{4}\d{2}|[A-Z]{3}\d{3})$/;

function validarEmail(email) {
  if (!email || typeof email !== "string") {
    return { valido: false, error: "Email es requerido" };
  }

  email = email.trim();

  if (email.length > 254) {
    return { valido: false, error: "Email muy largo" };
  }

  if (!REGEX_EMAIL.test(email)) {
    return { valido: false, error: "Email debe ser válido" };
  }

  return { valido: true };
}

function validarContrasena(contrasena) {
  if (!contrasena || typeof contrasena !== "string") {
    return { valido: false, error: "Contraseña es requerida" };
  }

  if (contrasena.length < 8) {
    return {
      valido: false,
      error: "Contraseña debe tener mínimo 8 caracteres",
    };
  }

  if (contrasena.length > 128) {
    return { valido: false, error: "Contraseña muy larga" };
  }

  return { valido: true };
}

function validarTelefonoChileno(telefono) {
  if (!telefono || typeof telefono !== "string") {
    return { valido: false, error: "Teléfono es requerido" };
  }

  telefono = telefono.trim();

  if (!REGEX_TELEFONO_CL.test(telefono)) {
    return {
      valido: false,
      error: "Teléfono debe ser formato +569XXXXXXXX",
    };
  }

  return { valido: true };
}

function validarPatente(patente) {
  if (!patente || typeof patente !== "string") {
    return { valido: false, error: "Patente es requerida" };
  }

  patente = patente.trim().toUpperCase();

  if (!REGEX_PATENTE.test(patente)) {
    return {
      valido: false,
      error:
        "Patente debe ser formato TR3454, YTGY98 o TTR667, sin guiones ni espacios",
    };
  }

  return { valido: true, valorNormalizado: patente };
}

function validarNumeroPositivo(valor, campo = "número") {
  if (valor === undefined || valor === "" || valor === null) {
    return { valido: false, error: `${campo} es requerido` };
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return { valido: false, error: `${campo} debe ser un número válido` };
  }

  if (numero < 0) {
    return {
      valido: false,
      error: `${campo} debe ser un número positivo`,
    };
  }

  return { valido: true, valor: numero };
}

function validarIdNumerico(id, campoNombre = "ID") {
  if (id === undefined || id === "" || id === null) {
    return { valido: false, error: `${campoNombre} es requerido` };
  }

  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    return {
      valido: false,
      error: `${campoNombre} debe ser un número entero positivo`,
    };
  }

  return { valido: true, valor: numero };
}

function validarFechaNoEsPasada(fecha) {
  if (!fecha || typeof fecha !== "string") {
    return { valido: false, error: "Fecha es requerida" };
  }

  const fechaSolicitada = new Date(fecha);

  if (isNaN(fechaSolicitada.getTime())) {
    return { valido: false, error: "Fecha inválida" };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaSolicitada < hoy) {
    return { valido: false, error: "La fecha no puede ser pasada" };
  }

  return { valido: true };
}

function validarHora(hora) {
  if (!hora || typeof hora !== "string") {
    return { valido: false, error: "Hora es requerida" };
  }

  if (!/^\d{2}:\d{2}$/.test(hora)) {
    return { valido: false, error: "Hora debe ser formato HH:MM" };
  }

  const [horas, minutos] = hora.split(":").map(Number);

  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
    return { valido: false, error: "Hora inválida" };
  }

  return { valido: true };
}

function sanitizarString(valor, maxLength = 255) {
  if (!valor || typeof valor !== "string") {
    return "";
  }

  let sanitizado = valor.trim();

  if (sanitizado.length > maxLength) {
    sanitizado = sanitizado.substring(0, maxLength);
  }

  return sanitizado;
}

function validarLargoMinimo(valor, minLength, campoNombre) {
  if (!valor || typeof valor !== "string") {
    return { valido: false, error: `${campoNombre} es requerido` };
  }

  if (valor.trim().length < minLength) {
    return {
      valido: false,
      error: `${campoNombre} debe tener mínimo ${minLength} caracteres`,
    };
  }

  return { valido: true };
}

module.exports = {
  validarEmail,
  validarContrasena,
  validarTelefonoChileno,
  validarPatente,
  validarNumeroPositivo,
  validarIdNumerico,
  validarFechaNoEsPasada,
  validarHora,
  sanitizarString,
  validarLargoMinimo,
};
