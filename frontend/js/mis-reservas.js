const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const listaReservas = document.getElementById("listaReservas");
const mensaje = document.getElementById("mensaje");
let reservasGlobales = [];

const usuario = exigirCliente();
if (!usuario) throw new Error("Acceso no autorizado");

function cerrarSesionSiNoAutorizado(response) {
  if (response.status === 401 || response.status === 403) {
    cerrarSesion();
    return true;
  }

  return false;
}

usuarioLogueadoInput.textContent = `${usuario.nombre} ${usuario.apellido}`;

document
  .getElementById("btnCerrarSesion")
  .addEventListener("click", cerrarSesion);

function formatearFecha(fechaIso) {
  if (!fechaIso) return "Sin fecha";

  const fechaTexto = String(fechaIso).split("T")[0];
  const [anio, mes, dia] = fechaTexto.split("-");

  if (!anio || !mes || !dia) return fechaIso;

  return `${dia}-${mes}-${anio}`;
}

function formatearHora(hora) {
  if (!hora) return "Sin hora";
  return String(hora).slice(0, 5);
}

function esCancelable(reserva) {
  return reserva.id_estado == 1 || reserva.id_estado == 2;
}

function mostrarMensaje(texto, esExito) {
  mensaje.textContent = texto;
  mensaje.className = esExito ? "message exito" : "message error";
}

function obtenerClaseEstado(estado) {
  const estadoNormalizado = String(estado || "").toLowerCase();

  if (estadoNormalizado.includes("pendiente")) return "estado-pendiente";
  if (estadoNormalizado.includes("confirmada")) return "estado-confirmada";
  if (estadoNormalizado.includes("completada")) return "estado-completada";
  if (estadoNormalizado.includes("cancelada")) return "estado-cancelada";

  return "estado-default";
}

function obtenerIconoEstado(estado) {
  const estadoNormalizado = String(estado || "").toLowerCase();

  if (estadoNormalizado.includes("pendiente")) return "◷";
  if (estadoNormalizado.includes("confirmada")) return "✓";
  if (estadoNormalizado.includes("completada")) return "✓✓";
  if (estadoNormalizado.includes("cancelada")) return "✕";

  return "•";
}

async function cargarReservasUsuario() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reservas/usuario/${usuario.id_usuario}`,
      {
        method: "GET",
        headers: obtenerHeadersAuth(),
      },
    );

    if (cerrarSesionSiNoAutorizado(response)) return;

    const reservas = await response.json();
    reservasGlobales = reservas;

    if (!response.ok) {
      listaReservas.innerHTML = `<p class="sin-datos">No se pudieron cargar tus reservas.</p>`;
      return;
    }

    if (reservas.length === 0) {
      listaReservas.innerHTML = `
        <div class="sin-reservas-card">
          <h3>Aún no tienes reservas registradas</h3>
          <p>Agenda tu primer servicio y aparecerá en esta sección.</p>
          <a href="./reservas.html">Reservar ahora</a>
        </div>
      `;
      return;
    }

    listaReservas.innerHTML = "";

    reservas.forEach((reserva) => {
      const card = document.createElement("article");
      card.className = "reserva-card";

      const claseEstado = obtenerClaseEstado(reserva.nombre_estado);
      const iconoEstado = obtenerIconoEstado(reserva.nombre_estado);

      card.innerHTML = `
        <div class="reserva-top">
          <div>
            <h3>${reserva.nombre_servicio}</h3>
            <p>${reserva.marca} ${reserva.modelo} - ${reserva.patente}</p>
          </div>

          <span class="estado-badge ${claseEstado}">
            ${iconoEstado} ${reserva.nombre_estado}
          </span>
        </div>

        <div class="reserva-datos">
          <div>
            <small>Fecha</small>
            <strong>${formatearFecha(reserva.fecha_reserva)}</strong>
          </div>

          <div>
            <small>Hora</small>
            <strong>${formatearHora(reserva.hora_reserva)}</strong>
          </div>

          <div>
            <small>Observaciones</small>
            <strong>${reserva.observaciones || "Sin observaciones"}</strong>
          </div>
        </div>

        <div class="reserva-actions">
          ${
            esCancelable(reserva)
              ? `<button class="btn-cancelar" data-action="cancelar-reserva" data-id-reserva="${reserva.id_reserva}">
                  ✕ Cancelar reserva
                </button>`
              : `<span class="no-cancelable">Esta reserva ya no se puede cancelar</span>`
          }
        </div>
      `;

      listaReservas.appendChild(card);
    });
  } catch {
    listaReservas.innerHTML = `<p class="sin-datos">Error al conectar con el servidor.</p>`;
  }
}

async function cancelarReserva(idReserva) {
  const reserva = reservasGlobales.find((r) => r.id_reserva == idReserva);

  const confirmar = confirm("¿Seguro que deseas cancelar esta reserva?");
  if (!confirmar) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/reservas/${idReserva}/cancelar`,
      {
        method: "PUT",
        headers: obtenerHeadersAuth(),
      },
    );

    if (response.status === 401 || response.status === 403) {
      cerrarSesion();
      return;
    }

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(data.mensaje || "Reserva cancelada correctamente", true);

      if (reserva) {
        const mensajeAdmin = `
Reserva cancelada AquaCar

Cliente: ${usuario.nombre} ${usuario.apellido}
Servicio: ${reserva.nombre_servicio}
Vehículo: ${reserva.marca} ${reserva.modelo} - ${reserva.patente}
Fecha: ${formatearFecha(reserva.fecha_reserva)}
Hora: ${formatearHora(reserva.hora_reserva)}
Observaciones: ${reserva.observaciones || "Sin observaciones"}

El cliente canceló esta reserva desde su panel.
`;

        abrirWhatsApp("56982820443", mensajeAdmin);
      }

      cargarReservasUsuario();
    } else {
      mostrarMensaje(data.mensaje || "No se pudo cancelar la reserva", false);
    }
  } catch {
    mostrarMensaje("Error al conectar con el servidor", false);
  }
}

listaReservas.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-action='cancelar-reserva']");
  if (!boton) return;

  cancelarReserva(Number(boton.dataset.idReserva));
});

cargarReservasUsuario();
