function obtenerUsuario() {
  const usuarioGuardado = localStorage.getItem("usuario");
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

function cerrarSesion() {
  localStorage.removeItem("usuario");
  window.location.href = "./login.html";
}

function exigirLogin() {
  const usuario = obtenerUsuario();

  if (!usuario) {
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
