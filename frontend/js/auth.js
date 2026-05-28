function obtenerUsuario() {
  const usuarioGuardado = localStorage.getItem("usuario");
  return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
}

function obtenerIconoToast(tipo) {
  switch (tipo) {
    case "error":
      return "bi-x-circle";
    case "warning":
      return "bi-exclamation-triangle";
    case "info":
      return "bi-info-circle";
    case "success":
    default:
      return "bi-check-circle";
  }
}

function obtenerClaseToast(tipo) {
  switch (tipo) {
    case "error":
      return "aqua-toast--error";
    case "warning":
      return "aqua-toast--warning";
    case "info":
      return "aqua-toast--info";
    case "success":
    default:
      return "aqua-toast--success";
  }
}

function asegurarToastContainer() {
  let container = document.getElementById("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    document.body.appendChild(container);
  }

  return container;
}

function mostrarToast(mensaje, tipo = "success") {
  if (!mensaje) return;

  const container = asegurarToastContainer();
  const toast = document.createElement("div");
  toast.className = `aqua-toast ${obtenerClaseToast(tipo)}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const icono = document.createElement("i");
  icono.className = `bi ${obtenerIconoToast(tipo)} aqua-toast-icon`;

  const contenido = document.createElement("div");
  contenido.className = "aqua-toast-content";
  contenido.textContent = mensaje;

  const cerrar = document.createElement("button");
  cerrar.type = "button";
  cerrar.className = "aqua-toast-close";
  cerrar.setAttribute("aria-label", "Cerrar mensaje");
  cerrar.innerHTML = '<i class="bi bi-x-lg"></i>';
  cerrar.addEventListener("click", () => {
    toast.classList.add("is-hiding");
    setTimeout(() => toast.remove(), 220);
  });

  toast.appendChild(icono);
  toast.appendChild(contenido);
  toast.appendChild(cerrar);
  container.appendChild(toast);

  window.setTimeout(() => {
    if (!toast.isConnected) return;
    toast.classList.add("is-hiding");
    window.setTimeout(() => toast.remove(), 220);
  }, 3000);
}

function guardarToastPendiente(mensaje, tipo) {
  sessionStorage.setItem("aquaToast", JSON.stringify({ mensaje, tipo }));
}

function mostrarToastPendiente() {
  const data = sessionStorage.getItem("aquaToast");
  if (!data) return;

  try {
    const { mensaje, tipo } = JSON.parse(data);
    mostrarToast(mensaje, tipo);
  } catch (error) {
    sessionStorage.removeItem("aquaToast");
    return;
  }

  sessionStorage.removeItem("aquaToast");
}

function cerrarSesion() {
  localStorage.removeItem("usuario");
  guardarToastPendiente("Sesión cerrada correctamente.", "success");
  window.location.href = "./login.html";
}

function exigirLogin() {
  const usuario = obtenerUsuario();

  if (!usuario) {
    guardarToastPendiente("Debes iniciar sesión primero.", "warning");
    window.location.href = "./login.html";
    return null;
  }

  return usuario;
}

function exigirAdmin() {
  const usuario = exigirLogin();
  if (!usuario) return null;

  if (usuario.rol !== "admin") {
    guardarToastPendiente("Acceso no autorizado.", "error");
    window.location.href = "./panel.html";
    return null;
  }

  return usuario;
}

mostrarToastPendiente();

function exigirCliente() {
  const usuario = exigirLogin();
  if (!usuario) return null;

  if (usuario.rol === "admin") {
    window.location.href = "./admin.html";
    return null;
  }

  return usuario;
}
