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
  const fecha = new Date(fechaIso);

  if (isNaN(fecha)) return fechaIso;

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

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

  listaReservas.innerHTML = "";

  reservas.forEach((reserva) => {
    const card = document.createElement("div");
    card.className = "reserva-item";

    card.innerHTML = `
      <h3>${reserva.nombre_servicio}</h3>

      <div class="cliente-box">
        <p><strong>Cliente:</strong> ${reserva.nombre} ${reserva.apellido}</p>
        <p><strong>Correo:</strong> ${reserva.correo}</p>
        <p><strong>Teléfono:</strong> ${reserva.telefono || "Sin teléfono"}</p>
      </div>

      <div class="info-grid">
        <p><strong>Vehículo:</strong> ${reserva.marca} ${reserva.modelo}</p>
        <p><strong>Patente:</strong> ${reserva.patente}</p>
        <p><strong>Tipo:</strong> ${reserva.tipo_vehiculo || "No informado"}</p>
        <p><strong>Color:</strong> ${reserva.color || "No informado"}</p>
        <p><strong>Fecha:</strong> ${formatearFecha(reserva.fecha_reserva)}</p>
        <p><strong>Hora:</strong> ${formatearHora(reserva.hora_reserva)}</p>
      </div>

      <div class="estado-box">
        <span class="estado-label">Estado actual:</span>
        <span class="estado-badge ${obtenerClaseEstado(reserva.nombre_estado)}">
          ${reserva.nombre_estado}
        </span>
      </div>

      <p class="observacion-texto">
        <strong>Observaciones:</strong> ${reserva.observaciones || "Sin observaciones"}
      </p>

      <div class="acciones-card">
        <label for="estado_${reserva.id_reserva}" class="label-select">
          Cambiar estado
        </label>

        <div class="select-wrapper">
          <select id="estado_${reserva.id_reserva}" class="select-estado">
            ${obtenerOpcionesEstado(reserva.nombre_estado)}
          </select>
        </div>

        <button class="btn-estado" data-action="guardar-estado" data-id-reserva="${reserva.id_reserva}">
          Guardar estado
        </button>

        <button class="btn-eliminar" data-action="eliminar-reserva" data-id-reserva="${reserva.id_reserva}">
          Eliminar reserva
        </button>
      </div>
    `;

    listaReservas.appendChild(card);
  });
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
      cargarReservas();
    } else {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = data.mensaje || "No se pudo eliminar la reserva";
    }
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "Error al conectar con el servidor";
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
      mensaje.textContent = "Estado actualizado correctamente";
      cargarReservas();
    } else {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = data.mensaje || "No se pudo actualizar el estado";
    }
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "Error al actualizar estado";
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
