const usuarioLogueado = document.getElementById("usuario_logueado");
const mensaje = document.getElementById("mensaje");
const listaReservas = document.getElementById("listaReservas");
const inputBuscar = document.getElementById("inputBuscar");
const filtroEstado = document.getElementById("filtroEstado");

let reservasGlobales = [];

const usuario = exigirAdmin();
if (!usuario) {
  throw new Error("Acceso no autorizado");
}

usuarioLogueado.textContent = `${usuario.nombre} ${usuario.apellido}`;

document
  .getElementById("btnClientesVehiculos")
  .addEventListener("click", () => {
    window.location.href = "./clientes-vehiculos.html";
  });

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

const btnCerrarSesionPanel = document.getElementById("btnCerrarSesionPanel");
if (btnCerrarSesionPanel) {
  btnCerrarSesionPanel.addEventListener("click", () => {
    cerrarSesion();
  });
}

function obtenerOpcionesEstado(nombreEstadoActual) {
  const estados = [
    { id: 1, nombre: "Pendiente" },
    { id: 2, nombre: "Confirmada" },
    { id: 3, nombre: "Completada" },
    { id: 4, nombre: "Cancelada" },
  ];

  return estados
    .map((estado) => {
      const selected = estado.nombre === nombreEstadoActual ? "selected" : "";
      return `<option value="${estado.id}" ${selected}>${estado.nombre}</option>`;
    })
    .join("");
}

function obtenerClaseEstado(estado) {
  switch (estado) {
    case "Pendiente":
      return "estado-pendiente";
    case "Confirmada":
      return "estado-confirmada";
    case "Completada":
      return "estado-completada";
    case "Cancelada":
      return "estado-cancelada";
    default:
      return "";
  }
}

function formatearFecha(fechaIso) {
  if (!fechaIso) return "Sin fecha";

  const fechaTexto = String(fechaIso).split("T")[0];
  const partes = fechaTexto.split("-");

  if (partes.length !== 3) return fechaIso;

  const [anio, mes, dia] = partes;

  return `${dia}-${mes}-${anio}`;
}

function formatearHora(hora) {
  if (!hora) return "";
  return hora.slice(0, 5);
}

function actualizarResumen(reservas) {
  const total = reservas.length;
  const pendientes = reservas.filter(
    (r) => r.nombre_estado === "Pendiente",
  ).length;
  const confirmadas = reservas.filter(
    (r) => r.nombre_estado === "Confirmada",
  ).length;
  const completadas = reservas.filter(
    (r) => r.nombre_estado === "Completada",
  ).length;
  const canceladas = reservas.filter(
    (r) => r.nombre_estado === "Cancelada",
  ).length;

  document.getElementById("totalReservas").textContent = total;
  document.getElementById("totalPendientes").textContent = pendientes;
  document.getElementById("totalConfirmadas").textContent = confirmadas;
  document.getElementById("totalCompletadas").textContent = completadas;
  document.getElementById("totalCanceladas").textContent = canceladas;
}

async function cargarReservas() {
  try {
    const response = await fetch(`${API_BASE_URL}/reservas`);
    const reservas = await response.json();

    if (!response.ok) {
      listaReservas.innerHTML =
        '<p class="sin-datos">No se pudieron cargar las reservas.</p>';
      return;
    }

    reservasGlobales = reservas;
    actualizarResumen(reservasGlobales);
    renderizarReservas(reservasGlobales);
  } catch (error) {
    listaReservas.innerHTML =
      '<p class="sin-datos">Error al conectar con el servidor.</p>';
  }
}

function renderizarReservas(reservas) {
  if (reservas.length === 0) {
    listaReservas.innerHTML =
      '<p class="sin-datos">No hay reservas que coincidan con el filtro.</p>';
    return;
  }

  listaReservas.innerHTML = reservas
    .map(
      (reserva) => `
    <article class="admin-reserva-card service-admin-card h-100">
        <div class="aqua-card-topline"></div>
        <div class="admin-reserva-head">
          <div class="admin-reserva-icon" style="background: linear-gradient(135deg, var(--aqua-cyan-bright), var(--aqua-green-water));">
            <i class="bi bi-calendar2-event"></i>
          </div>
          <div class="flex-grow-1">
            <h3 class="admin-reserva-title mb-1">${reserva.nombre_servicio}</h3>
            <span class="badge-estado ${obtenerClaseEstado(reserva.nombre_estado)}">
                ${reserva.nombre_estado}
            </span>
          </div>
        </div>
        <div class="admin-reserva-body">
          <div class="admin-reserva-meta">
            <div class="item-info"><i class="bi bi-person"></i><strong>Cliente:</strong> ${reserva.nombre} ${reserva.apellido}</div>
            <div class="item-info"><i class="bi bi-car-front"></i><strong>Vehículo:</strong> ${reserva.marca} ${reserva.modelo}</div>
            <div class="item-info"><i class="bi bi-receipt"></i><strong>Patente:</strong> <code>${reserva.patente}</code></div>
            <div class="item-info"><i class="bi bi-calendar"></i><strong>Fecha:</strong> ${formatearFecha(reserva.fecha_reserva)} ${formatearHora(reserva.hora_reserva)}</div>
            ${reserva.observaciones ? `<div class="item-info"><i class="bi bi-chat-dots"></i><strong>Obs:</strong> ${reserva.observaciones}</div>` : ""}
          </div>
          <div class="admin-reserva-actions">
            <select id="estado_${reserva.id_reserva}" class="admin-status-select" aria-label="Cambiar estado">
              ${obtenerOpcionesEstado(reserva.nombre_estado)}
            </select>
            <div class="admin-action-buttons">
              <button class="admin-action-btn admin-action-save" data-action="guardar-estado" data-id-reserva="${reserva.id_reserva}" title="Guardar estado">
                <i class="bi bi-check-lg"></i>
                <span>Guardar</span>
              </button>
              <button class="admin-action-btn admin-action-danger" data-action="eliminar-reserva" data-id-reserva="${reserva.id_reserva}" title="Eliminar reserva">
                <i class="bi bi-trash"></i>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `,
    )
    .join("");
}

function filtrarReservas() {
  const texto = inputBuscar.value.toLowerCase().trim();
  const estadoSeleccionado = filtroEstado.value;

  const reservasFiltradas = reservasGlobales.filter((reserva) => {
    const textoBusqueda = `
      ${reserva.nombre || ""}
      ${reserva.apellido || ""}
      ${reserva.correo || ""}
      ${reserva.patente || ""}
      ${reserva.marca || ""}
      ${reserva.modelo || ""}
      ${reserva.nombre_servicio || ""}
    `
      .toLowerCase()
      .trim();

    const coincideTexto = texto === "" || textoBusqueda.includes(texto);

    const coincideEstado =
      estadoSeleccionado === "" || reserva.nombre_estado === estadoSeleccionado;

    return coincideTexto && coincideEstado;
  });

  renderizarReservas(reservasFiltradas);
}

async function eliminarReserva(idReserva) {
  const confirmar = confirm("¿Seguro que deseas eliminar esta reserva?");

  if (!confirmar) return;

  try {
    const response = await fetch(`${API_BASE_URL}/reservas/${idReserva}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.style.color = "#00ff88";
      mensaje.textContent = data.mensaje || "Reserva eliminada correctamente";
      mostrarToast("Reserva eliminada correctamente.", "success");
      cargarReservas();
    } else {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = data.mensaje || "No se pudo actualizar la reserva.";
      mostrarToast("No se pudo actualizar la reserva.", "error");
    }
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "No se pudo actualizar la reserva.";
    mostrarToast("No se pudo actualizar la reserva.", "error");
  }
}

async function guardarEstado(idReserva) {
  const select = document.getElementById(`estado_${idReserva}`);
  const nuevoEstado = select.value;

  try {
    const response = await fetch(
      `${API_BASE_URL}/reservas/${idReserva}/estado`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_estado: nuevoEstado,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      mensaje.style.color = "#00ff88";
      mensaje.textContent = "Estado de reserva actualizado correctamente.";
      mostrarToast("Estado de reserva actualizado correctamente.", "success");
      cargarReservas();
    } else {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = data.mensaje || "No se pudo actualizar la reserva.";
      mostrarToast("No se pudo actualizar la reserva.", "error");
    }
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "No se pudo actualizar la reserva.";
    mostrarToast("No se pudo actualizar la reserva.", "error");
  }
}

listaReservas.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-action]");
  if (!boton) return;

  const idReserva = Number(boton.dataset.idReserva);
  if (!idReserva) return;

  if (boton.dataset.action === "guardar-estado") {
    guardarEstado(idReserva);
    return;
  }

  if (boton.dataset.action === "eliminar-reserva") {
    eliminarReserva(idReserva);
  }
});

inputBuscar.addEventListener("input", filtrarReservas);
filtroEstado.addEventListener("change", filtrarReservas);

cargarReservas();
