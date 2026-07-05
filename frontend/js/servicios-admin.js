const usuarioLogueado = document.getElementById("usuario_logueado");
const mensaje = document.getElementById("mensaje");
const listaServicios = document.getElementById("listaServicios");
const formServicio = document.getElementById("formServicio");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnSubmit = document.getElementById("btnSubmit");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");

const idServicioInput = document.getElementById("id_servicio");
const nombreServicioInput = document.getElementById("nombre_servicio");
const descripcionInput = document.getElementById("descripcion");
const duracionInput = document.getElementById("duracion_minutos");
const precioInput = document.getElementById("precio");
const categoriaInput = document.getElementById("categoria");
const activoInput = document.getElementById("activo");
const imagenInput = document.getElementById("imagen");
const imagenUrlInput = document.getElementById("imagen_url");
const previewImagen = document.getElementById("previewImagen");

const BASE_BACKEND_URL = API_BASE_URL.replace(/\/api$/, "");
let imagenActualServicio = "";

const usuario = exigirAdmin();
if (!usuario) throw new Error("Acceso no autorizado");

function cerrarSesionSiNoAutorizado(response) {
  if (response.status === 401 || response.status === 403) {
    cerrarSesion();
    return true;
  }

  return false;
}

usuarioLogueado.textContent = `${usuario.nombre} ${usuario.apellido}`;

document
  .getElementById("btnCerrarSesion")
  .addEventListener("click", cerrarSesion);

function cargarDuraciones() {
  duracionInput.innerHTML = '<option value="">Selecciona duración</option>';

  for (let minutos = 30; minutos <= 180; minutos += 15) {
    const option = document.createElement("option");
    option.value = minutos;
    option.textContent = `${minutos} min`;
    duracionInput.appendChild(option);
  }
}

function formatearPrecio(valor) {
  return Number(valor || 0).toLocaleString("es-CL");
}

function obtenerBadgeEstado(activo) {
  return activo == 1
    ? '<span class="estado-badge estado-activo">Activo</span>'
    : '<span class="estado-badge estado-inactivo">Inactivo</span>';
}

function obtenerClaseServicio(index) {
  const clases = ["cyan", "green", "yellow", "red", "blue", "purple"];
  return clases[index % clases.length];
}

function resolverUrlImagen(imagenUrl, nombreServicio = "") {
  if (!imagenUrl) {
    return obtenerImagenPorNombre(nombreServicio);
  }

  if (imagenUrl.startsWith("http")) {
    return imagenUrl;
  }

  if (imagenUrl.startsWith("/uploads")) {
    return `${BASE_BACKEND_URL}${imagenUrl}`;
  }

  return imagenUrl;
}

function mostrarPreviewImagen(url) {
  if (!url) {
    previewImagen.removeAttribute("src");
    previewImagen.classList.remove("visible");
    return;
  }

  previewImagen.src = url;
  previewImagen.classList.add("visible");
}

function ocultarPreviewImagen() {
  previewImagen.removeAttribute("src");
  previewImagen.classList.remove("visible");
}

function limpiarFormulario() {
  idServicioInput.value = "";
  nombreServicioInput.value = "";
  descripcionInput.value = "";
  duracionInput.value = "";
  precioInput.value = "";
  categoriaInput.value = "";
  activoInput.value = "1";
  imagenInput.value = "";
  imagenUrlInput.value = "";
  imagenActualServicio = "";
  ocultarPreviewImagen();

  tituloFormulario.textContent = "Crear Servicio";
  btnSubmit.textContent = "Guardar Servicio";
}

function mostrarMensaje(texto, tipo = "ok") {
  mensaje.textContent = texto;
  mensaje.className = tipo === "ok" ? "message ok" : "message error";
}

async function cargarServicios() {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios`, {
      method: "GET",
      headers: obtenerHeadersAuth(),
    });

    if (cerrarSesionSiNoAutorizado(response)) return;

    const servicios = await response.json();

    if (!response.ok) {
      listaServicios.innerHTML = `<p class="sin-datos">No se pudieron cargar los servicios.</p>`;
      return;
    }

    if (servicios.length === 0) {
      listaServicios.innerHTML = `<p class="sin-datos">No hay servicios registrados.</p>`;
      return;
    }

    listaServicios.innerHTML = "";

    servicios.forEach((servicio, index) => {
      const card = document.createElement("article");
      card.className = `servicio-card servicio-${obtenerClaseServicio(index)}`;
      const imagenServicio = servicio.imagen_url
        ? resolverUrlImagen(servicio.imagen_url, servicio.nombre_servicio)
        : null;

      card.innerHTML = `
        ${
          imagenServicio
            ? `<div class="servicio-thumb" style="background-image: url('${imagenServicio}')"></div>`
            : `<div class="servicio-thumb servicio-thumb-empty"><span>Sin imagen</span></div>`
        }

        <div class="servicio-top">
          <div>
            <span class="icono-servicio">⚙</span>
            <h3>${servicio.nombre_servicio}</h3>
          </div>
          ${obtenerBadgeEstado(servicio.activo)}
        </div>

        <p class="descripcion">${servicio.descripcion}</p>

        <div class="servicio-meta">
          <div>
            <small>Duración</small>
            <strong>${servicio.duracion_minutos} min</strong>
          </div>

          <div>
            <small>Precio</small>
            <strong>$${formatearPrecio(servicio.precio)}</strong>
          </div>
        </div>

        <div class="acciones-card">
          <button class="btn-editar" data-action="editar-servicio" data-servicio='${encodeURIComponent(JSON.stringify(servicio))}'>
            Editar
          </button>

          <button
            class="btn-estado"
            data-action="cambiar-estado"
            data-id-servicio="${servicio.id_servicio}"
            data-nuevo-estado="${servicio.activo == 1 ? 0 : 1}"
          >
            ${servicio.activo == 1 ? "Desactivar" : "Activar"}
          </button>

          <button class="btn-eliminar" data-action="eliminar-servicio" data-id-servicio="${servicio.id_servicio}">
            Eliminar
          </button>
        </div>
      `;

      listaServicios.appendChild(card);
    });
  } catch {
    listaServicios.innerHTML = `<p class="sin-datos">Error al conectar con el servidor.</p>`;
  }
}

function editarServicio(servicio) {
  idServicioInput.value = servicio.id_servicio;
  nombreServicioInput.value = servicio.nombre_servicio;
  descripcionInput.value = servicio.descripcion;
  duracionInput.value = servicio.duracion_minutos;
  precioInput.value = parseInt(servicio.precio);
  categoriaInput.value = servicio.categoria || "";
  activoInput.value = String(servicio.activo);
  imagenActualServicio = servicio.imagen_url || "";
  imagenUrlInput.value = imagenActualServicio;

  if (imagenActualServicio) {
    mostrarPreviewImagen(
      resolverUrlImagen(imagenActualServicio, servicio.nombre_servicio),
    );
  } else {
    ocultarPreviewImagen();
  }

  tituloFormulario.textContent = "Editar Servicio";
  btnSubmit.textContent = "Actualizar Servicio";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

imagenInput.addEventListener("change", () => {
  const archivo = imagenInput.files[0];

  if (!archivo) {
    if (imagenUrlInput.value) {
      mostrarPreviewImagen(
        resolverUrlImagen(imagenUrlInput.value, nombreServicioInput.value),
      );
    } else {
      ocultarPreviewImagen();
    }

    return;
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type)) {
    mostrarMensaje("La imagen debe ser JPG, PNG o WEBP", "error");
    imagenInput.value = "";

    if (imagenUrlInput.value) {
      mostrarPreviewImagen(
        resolverUrlImagen(imagenUrlInput.value, nombreServicioInput.value),
      );
    } else {
      ocultarPreviewImagen();
    }

    return;
  }

  const urlTemporal = URL.createObjectURL(archivo);
  mostrarPreviewImagen(urlTemporal);
});

async function cambiarEstadoServicio(idServicio, nuevoEstado) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/servicios/${idServicio}/estado`,
      {
        method: "PUT",
        headers: obtenerHeadersAuth(),
        body: JSON.stringify({ activo: nuevoEstado }),
      },
    );

    if (cerrarSesionSiNoAutorizado(response)) return;

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(data.mensaje || "Estado actualizado correctamente");
      cargarServicios();
    } else {
      mostrarMensaje(data.mensaje || "No se pudo cambiar el estado", "error");
    }
  } catch {
    mostrarMensaje("Error al conectar con el servidor", "error");
  }
}

async function eliminarServicio(idServicio) {
  const confirmar = confirm("¿Seguro que deseas eliminar este servicio?");
  if (!confirmar) return;

  try {
    const response = await fetch(`${API_BASE_URL}/servicios/${idServicio}`, {
      method: "DELETE",
      headers: obtenerHeadersAuth(),
    });

    if (cerrarSesionSiNoAutorizado(response)) return;

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(data.mensaje || "Servicio eliminado correctamente");
      cargarServicios();
      limpiarFormulario();
    } else {
      mostrarMensaje(
        data.mensaje || "No se pudo eliminar el servicio",
        "error",
      );
    }
  } catch {
    mostrarMensaje("Error al conectar con el servidor", "error");
  }
}

formServicio.addEventListener("submit", async (e) => {
  e.preventDefault();

  const idServicio = idServicioInput.value.trim();
  const formData = new FormData();

  formData.append("nombre_servicio", nombreServicioInput.value.trim());
  formData.append("descripcion", descripcionInput.value.trim());
  formData.append("duracion_minutos", duracionInput.value);
  formData.append("precio", precioInput.value);
  formData.append("activo", activoInput.value);
  formData.append("categoria", categoriaInput.value);

  if (imagenInput.files[0]) {
    formData.append("imagen", imagenInput.files[0]);
  }

  if (imagenUrlInput.value) {
    formData.append("imagen_url", imagenUrlInput.value);
  }

  try {
    const url = idServicio
      ? `${API_BASE_URL}/servicios/${idServicio}`
      : `${API_BASE_URL}/servicios`;

    const method = idServicio ? "PUT" : "POST";
    const headers = obtenerHeadersAuth();
    delete headers["Content-Type"];
    delete headers["content-type"];

    const response = await fetch(url, {
      method,
      headers,
      body: formData,
    });

    if (cerrarSesionSiNoAutorizado(response)) return;

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(
        data.mensaje ||
          (idServicio
            ? "Servicio actualizado correctamente"
            : "Servicio creado correctamente"),
      );
      limpiarFormulario();
      cargarServicios();
    } else {
      mostrarMensaje(
        data.mensaje || data.detalle || "No se pudo guardar el servicio",
        "error",
      );
    }
  } catch {
    mostrarMensaje("Error al conectar con el servidor", "error");
  }
});

btnCancelarEdicion.addEventListener("click", limpiarFormulario);

listaServicios.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-action]");
  if (!boton) return;

  const { action } = boton.dataset;

  if (action === "editar-servicio") {
    editarServicio(JSON.parse(decodeURIComponent(boton.dataset.servicio)));
    return;
  }

  if (action === "cambiar-estado") {
    cambiarEstadoServicio(
      Number(boton.dataset.idServicio),
      Number(boton.dataset.nuevoEstado),
    );
    return;
  }

  if (action === "eliminar-servicio") {
    eliminarServicio(Number(boton.dataset.idServicio));
  }
});

cargarDuraciones();
cargarServicios();
