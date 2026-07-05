function obtenerUsuario() {
  const usuarioGuardado = localStorage.getItem("usuario");
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

function obtenerToken() {
  return localStorage.getItem("token");
}

function guardarSesion(usuario, token) {
  localStorage.setItem("usuario", JSON.stringify(usuario));
  localStorage.setItem("token", token);
}

function cerrarSesion() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");

  window.location.href = "./login.html";
}

function exigirLogin() {
  const usuario = obtenerUsuario();
  const token = obtenerToken();

  if (!usuario || !token) {
    alert("Debes iniciar sesión primero");

    window.location.href = "./login.html";
    return null;
  }

  return usuario;
}

function exigirAdmin() {
  const usuario = exigirLogin();

  if (!usuario) return null;

  if (usuario.rol !== "admin") {
    alert("Acceso no autorizado");

    window.location.href = "./panel.html";
    return null;
  }

  return usuario;
}

function exigirCliente() {
  const usuario = exigirLogin();

  if (!usuario) return null;

  if (usuario.rol === "admin") {
    window.location.href = "./admin.html";
    return null;
  }

  return usuario;
}

function obtenerHeadersAuth() {
  const token = obtenerToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
