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

function limpiarTextoMoneda(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function formatearPrecioChileno(valor) {
  const limpio = limpiarTextoMoneda(valor);
  return limpio ? `$ ${Number(limpio).toLocaleString("es-CL")}` : "";
}

function establecerPrecioFormateado(valor) {
  precioInput.value = formatearPrecioChileno(valor);
}

function limpiarPrecioParaEnvio(valor) {
  return limpiarTextoMoneda(valor);
}

const usuario = exigirAdmin();
if (!usuario) {
  throw new Error("Acceso no autorizado");
}

usuarioLogueado.textContent = `${usuario.nombre} ${usuario.apellido}`;

function renderizarEstadoVacío(texto) {
  listaServicios.innerHTML = `
    <div class="col-12">
      <div class="aqua-empty-state">
        <i class="bi bi-gear-wide-connected"></i>
        <p>${texto}</p>
      </div>
    </div>
  `;
}

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

precioInput.addEventListener("input", () => {
  const limpio = limpiarTextoMoneda(precioInput.value);
  precioInput.value = limpio
    ? `$ ${Number(limpio).toLocaleString("es-CL")}`
    : "";
});

precioInput.addEventListener("blur", () => {
  if (precioInput.value.trim() !== "") {
    establecerPrecioFormateado(precioInput.value);
  }
});

function formatearPrecio(valor) {
  return formatearPrecioChileno(valor);
}

function obtenerBadgeEstado(activo) {
  return activo == 1
    ? '<span class="estado-badge estado-activo">Activo</span>'
    : '<span class="estado-badge estado-inactivo">Inactivo</span>';
}

function formatearServicio(servicio) {
  return `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="service-admin-card h-100">
        <div class="aqua-card-topline"></div>
        <div class="service-card-head d-flex align-items-start gap-3">
          <div class="service-icon" style="background: linear-gradient(135deg, var(--aqua-cyan-bright), var(--aqua-green-water));">
            <i class="bi bi-gear-wide-connected"></i>
          </div>
          <div class="flex-grow-1">
            <h3 class="service-title mb-1">${servicio.nombre_servicio}</h3>
            <p class="service-subtitle mb-0">${obtenerBadgeEstado(servicio.activo)}</p>
          </div>
        </div>
        <div class="service-admin-card-body">
          <div class="service-card-meta">
            <div class="item-info align-items-start"><i class="bi bi-chat-dots"></i><strong>Descripción:</strong> ${servicio.descripcion}</div>
            <div class="item-info"><i class="bi bi-clock"></i><strong>Duración:</strong> ${servicio.duracion_minutos} min</div>
            <div class="item-info"><i class="bi bi-currency-dollar"></i><strong>Precio:</strong> ${formatearPrecio(servicio.precio)}</div>
          </div>
          <div class="service-card-footer mt-4 admin-service-actions">
            <button class="btn btn-outline-info flex-grow-1" data-action="editar-servicio" data-servicio='${encodeURIComponent(
              JSON.stringify(servicio),
            )}'>
              <i class="bi bi-pencil-square"></i> Editar
            </button>
            <button
              class="btn btn-outline-warning flex-grow-1"
              data-action="cambiar-estado"
              data-id-servicio="${servicio.id_servicio}"
              data-nuevo-estado="${servicio.activo == 1 ? 0 : 1}"
            >
              <i class="bi bi-toggle-${servicio.activo == 1 ? "on" : "off"}"></i> ${servicio.activo == 1 ? "Desactivar" : "Activar"}
            </button>
            <button class="btn btn-outline-danger flex-grow-1" data-action="eliminar-servicio" data-id-servicio="${servicio.id_servicio}">
              <i class="bi bi-trash"></i> Eliminar
            </button>
          </div>
        </div>
      </article>
    </div>
  `;
}

function limpiarFormulario() {
  idServicioInput.value = "";
  nombreServicioInput.value = "";
  descripcionInput.value = "";
  duracionInput.value = "";
  precioInput.value = "";
  activoInput.value = "1";

  tituloFormulario.textContent = "Crear Servicio";
  btnSubmit.textContent = "Guardar Servicio";
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
      renderizarEstadoVacío("No se pudieron cargar los servicios.");
      return;
    }

    if (servicios.length === 0) {
      renderizarEstadoVacío("No hay servicios registrados.");
      return;
    }

    listaServicios.innerHTML = servicios.map(formatearServicio).join("");
  } catch (error) {
    renderizarEstadoVacío("Error al conectar con el servidor.");
  }
}

function editarServicio(servicio) {
  idServicioInput.value = servicio.id_servicio;
  nombreServicioInput.value = servicio.nombre_servicio;
  descripcionInput.value = servicio.descripcion;
  duracionInput.value = servicio.duracion_minutos;
  establecerPrecioFormateado(servicio.precio);
  activoInput.value = String(servicio.activo);

  tituloFormulario.textContent = "Editar Servicio";
  btnSubmit.textContent = "Actualizar Servicio";

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
      mostrarToast(
        nuevoEstado === 1
          ? "Servicio activado correctamente."
          : "Servicio desactivado correctamente.",
        "success",
      );
      cargarServicios();
    } else {
      mostrarMensaje(data.mensaje || "No se pudo cambiar el estado", "error");
      mostrarToast("No se pudo procesar el servicio.", "error");
    }
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor", "error");
    mostrarToast("No se pudo procesar el servicio.", "error");
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
      mostrarToast("Servicio eliminado correctamente.", "success");
      cargarServicios();
      limpiarFormulario();
    } else {
      mostrarMensaje(
        data.mensaje || "No se pudo eliminar el servicio",
        "error",
      );
      mostrarToast("No se pudo procesar el servicio.", "error");
    }
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor", "error");
    mostrarToast("No se pudo procesar el servicio.", "error");
  }
}

formServicio.addEventListener("submit", async (e) => {
  e.preventDefault();

  const idServicio = idServicioInput.value.trim();

  const servicioData = {
    nombre_servicio: nombreServicioInput.value.trim(),
    descripcion: descripcionInput.value.trim(),
    duracion_minutos: Number(duracionInput.value),
    precio: Number(limpiarPrecioParaEnvio(precioInput.value)),
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
      mostrarToast(
        idServicio
          ? "Servicio actualizado correctamente."
          : "Servicio creado correctamente.",
        "success",
      );
      limpiarFormulario();
      cargarServicios();
    } else {
      mostrarMensaje(data.mensaje || "No se pudo guardar el servicio", "error");
      mostrarToast("No se pudo procesar el servicio.", "error");
    }
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor", "error");
    mostrarToast("No se pudo procesar el servicio.", "error");
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
