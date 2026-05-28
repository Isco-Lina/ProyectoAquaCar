const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const listaReservas = document.getElementById("listaReservas");
const mensaje = document.getElementById("mensaje");

const usuario = exigirCliente();
if (!usuario) {
  throw new Error("Acceso no autorizado");
}

usuarioLogueadoInput.textContent = `${usuario.nombre} ${usuario.apellido}`;

function renderizarEstadoVacío(texto) {
  return `
    <div class="col-12">
      <div class="aqua-empty-state">
        <i class="bi bi-calendar-x"></i>
        <p>${texto}</p>
      </div>
    </div>
  `;
}

function obtenerClaseBadge(estado) {
  switch (estado) {
    case "Pendiente":
      return "badge-pending";
    case "Confirmada":
      return "badge-confirmed";
    case "Completada":
      return "badge-completed";
    case "Cancelada":
      return "badge-cancelled";
    default:
      return "badge-pending";
  }
}

function formatearReserva(reserva) {
  const cancelar = esCancelable(reserva)
    ? `
      <div class="reservation-card-footer mt-4">
        <button class="btn btn-outline-danger w-100" data-action="cancelar-reserva" data-id-reserva="${reserva.id_reserva}">
          <i class="bi bi-x-circle"></i> Cancelar reserva
        </button>
      </div>
    `
    : "";

  return `
    <div class="col-lg-6 col-xl-4">
      <article class="reservation-card h-100">
        <div class="aqua-card-topline"></div>
        <div class="reservation-card-head d-flex align-items-start gap-3">
          <div class="reservation-icon" style="background: linear-gradient(135deg, var(--aqua-cyan-bright), var(--aqua-green-water));">
            <i class="bi bi-calendar2-check"></i>
          </div>
          <div class="flex-grow-1">
            <h3 class="reservation-title mb-1">${reserva.nombre_servicio}</h3>
            <p class="reservation-subtitle mb-0">Vehículo ${reserva.marca} ${reserva.modelo}</p>
          </div>
        </div>
        <div class="reservation-card-body">
          <div class="reservation-meta">
            <div class="item-info"><i class="bi bi-123"></i><strong>Patente:</strong> ${reserva.patente}</div>
            <div class="item-info"><i class="bi bi-calendar-event"></i><strong>Fecha:</strong> ${formatearFecha(reserva.fecha_reserva)}</div>
            <div class="item-info"><i class="bi bi-clock"></i><strong>Hora:</strong> ${formatearHora(reserva.hora_reserva)}</div>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="badge-status ${obtenerClaseBadge(reserva.nombre_estado)}">${reserva.nombre_estado}</span>
            </div>
            <div class="item-info align-items-start"><i class="bi bi-chat-dots"></i><strong>Observaciones:</strong> ${reserva.observaciones || "Sin observaciones"}</div>
          </div>
          ${cancelar}
        </div>
      </article>
    </div>
  `;
}

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

function formatearFecha(fechaIso) {
  if (!fechaIso) return "Sin fecha";

  const fechaTexto = String(fechaIso).split("T")[0];
  const partes = fechaTexto.split("-");

  if (partes.length !== 3) return fechaIso;

  const [anio, mes, dia] = partes;

  return `${dia}-${mes}-${anio}`;
}

function formatearHora(hora) {
  if (!hora) return "Sin hora";
  return hora.slice(0, 5);
}

function esCancelable(reserva) {
  return reserva.id_estado == 1 || reserva.id_estado == 2;
}

function mostrarMensaje(texto, esExito) {
  mensaje.style.color = esExito ? "#00ff88" : "#ff6b6b";
  mensaje.textContent = texto;
}

async function cargarReservasUsuario() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reservas/usuario/${usuario.id_usuario}`,
    );
    const reservas = await response.json();

    if (!response.ok) {
      listaReservas.innerHTML =
        '<p class="sin-datos">No se pudieron cargar tus reservas.</p>';
      return;
    }

    if (reservas.length === 0) {
      listaReservas.innerHTML = renderizarEstadoVacío(
        "Aún no tienes reservas registradas.",
      );
      return;
    }

    listaReservas.innerHTML = reservas.map(formatearReserva).join("");
  } catch (error) {
    listaReservas.innerHTML = renderizarEstadoVacío(
      "Error al conectar con el servidor.",
    );
  }
}

async function cancelarReserva(idReserva) {
  const confirmar = confirm("¿Seguro que deseas cancelar esta reserva?");

  if (!confirmar) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/reservas/${idReserva}/cancelar`,
      {
        method: "PUT",
      },
    );

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(data.mensaje || "Reserva cancelada correctamente", true);
      mostrarToast("Reserva cancelada correctamente.", "success");
      cargarReservasUsuario();
    } else {
      mostrarMensaje(
        data.mensaje || "No se pudo actualizar la reserva.",
        false,
      );
      mostrarToast("No se pudo actualizar la reserva.", "error");
    }
  } catch (error) {
    mostrarMensaje("No se pudo actualizar la reserva.", false);
    mostrarToast("No se pudo actualizar la reserva.", "error");
  }
}

listaReservas.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-action='cancelar-reserva']");
  if (!boton) return;

  const idReserva = Number(boton.dataset.idReserva);
  if (!idReserva) return;

  cancelarReserva(idReserva);
});

cargarReservasUsuario();
