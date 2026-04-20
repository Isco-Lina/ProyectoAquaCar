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
const activoInput = document.getElementById("activo");

const usuario = exigirAdmin();
if (!usuario) {
  throw new Error("Acceso no autorizado");
}

usuarioLogueado.textContent = `${usuario.nombre} ${usuario.apellido}`;

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

function formatearPrecio(valor) {
  return Number(valor).toLocaleString("es-CL");
}

function obtenerBadgeEstado(activo) {
  return activo == 1
    ? '<span class="estado-badge estado-activo">Activo</span>'
    : '<span class="estado-badge estado-inactivo">Inactivo</span>';
}

function limpiarFormulario() {
  idServicioInput.value = "";
  nombreServicioInput.value = "";
  descripcionInput.value = "";
  duracionInput.value = "";
  precioInput.value = "";
  activoInput.value = "1";

  tituloFormulario.textContent = "Crear servicio";
  btnSubmit.textContent = "Guardar servicio";
}

function mostrarMensaje(texto, tipo = "ok") {
  mensaje.textContent = texto;
  mensaje.style.color = tipo === "ok" ? "#00ff88" : "#ff6b6b";
}

async function cargarServicios() {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios`);
    const servicios = await response.json();

    if (!response.ok) {
      listaServicios.innerHTML =
        '<p class="sin-datos">No se pudieron cargar los servicios.</p>';
      return;
    }

    if (servicios.length === 0) {
      listaServicios.innerHTML =
        '<p class="sin-datos">No hay servicios registrados.</p>';
      return;
    }

    listaServicios.innerHTML = "";

    servicios.forEach((servicio) => {
      const card = document.createElement("div");
      card.className = "servicio-item";

      card.innerHTML = `
              <h3>${servicio.nombre_servicio}</h3>

              <div class="estado-box">
                ${obtenerBadgeEstado(servicio.activo)}
              </div>

              <div class="info-grid">
                <p><strong>Descripción:</strong> ${servicio.descripcion}</p>
                <p><strong>Duración:</strong> ${servicio.duracion_minutos} min</p>
                <p><strong>Precio:</strong> $${formatearPrecio(servicio.precio)}</p>
              </div>

              <div class="acciones-card">
                <button class="btn-editar" data-action="editar-servicio" data-servicio='${encodeURIComponent(
                  JSON.stringify(servicio),
                )}'>
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
  } catch (error) {
    listaServicios.innerHTML =
      '<p class="sin-datos">Error al conectar con el servidor.</p>';
  }
}

function editarServicio(servicio) {
  idServicioInput.value = servicio.id_servicio;
  nombreServicioInput.value = servicio.nombre_servicio;
  descripcionInput.value = servicio.descripcion;
  duracionInput.value = servicio.duracion_minutos;
  precioInput.value = parseInt(servicio.precio);
  activoInput.value = String(servicio.activo);

  tituloFormulario.textContent = "Editar servicio";
  btnSubmit.textContent = "Actualizar servicio";

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

async function cambiarEstadoServicio(idServicio, nuevoEstado) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/servicios/${idServicio}/estado`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          activo: nuevoEstado,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(data.mensaje || "Estado actualizado correctamente");
      cargarServicios();
    } else {
      mostrarMensaje(data.mensaje || "No se pudo cambiar el estado", "error");
    }
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor", "error");
  }
}

async function eliminarServicio(idServicio) {
  const confirmar = confirm("¿Seguro que deseas eliminar este servicio?");

  if (!confirmar) return;

  try {
    const response = await fetch(`${API_BASE_URL}/servicios/${idServicio}`, {
      method: "DELETE",
    });

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
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor", "error");
  }
}

formServicio.addEventListener("submit", async (e) => {
  e.preventDefault();

  const idServicio = idServicioInput.value.trim();

  const servicioData = {
    nombre_servicio: nombreServicioInput.value.trim(),
    descripcion: descripcionInput.value.trim(),
    duracion_minutos: Number(duracionInput.value),
    precio: Number(precioInput.value),
    activo: Number(activoInput.value),
  };

  try {
    let response;

    if (idServicio) {
      response = await fetch(`${API_BASE_URL}/servicios/${idServicio}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(servicioData),
      });
    } else {
      response = await fetch(`${API_BASE_URL}/servicios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(servicioData),
      });
    }

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
      mostrarMensaje(data.mensaje || "No se pudo guardar el servicio", "error");
    }
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor", "error");
  }
});

btnCancelarEdicion.addEventListener("click", () => {
  limpiarFormulario();
});

listaServicios.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-action]");
  if (!boton) return;

  const { action } = boton.dataset;

  if (action === "editar-servicio") {
    const servicio = JSON.parse(decodeURIComponent(boton.dataset.servicio));
    editarServicio(servicio);
    return;
  }

  if (action === "cambiar-estado") {
    const idServicio = Number(boton.dataset.idServicio);
    const nuevoEstado = Number(boton.dataset.nuevoEstado);
    if (!idServicio && idServicio !== 0) return;
    cambiarEstadoServicio(idServicio, nuevoEstado);
    return;
  }

  if (action === "eliminar-servicio") {
    const idServicio = Number(boton.dataset.idServicio);
    if (!idServicio && idServicio !== 0) return;
    eliminarServicio(idServicio);
  }
});

cargarServicios();
