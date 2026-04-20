const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const listaReservas = document.getElementById("listaReservas");
const mensaje = document.getElementById("mensaje");

const usuario = exigirCliente();
if (!usuario) {
  throw new Error("Acceso no autorizado");
}

usuarioLogueadoInput.textContent = `${usuario.nombre} ${usuario.apellido}`;

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

function formatearFecha(fechaIso) {
  const fecha = new Date(fechaIso);

  if (isNaN(fecha)) return fechaIso || "Sin fecha";

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

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
      listaReservas.innerHTML =
        '<p class="sin-datos">Aún no tienes reservas registradas.</p>';
      return;
    }

    listaReservas.innerHTML = "";

    reservas.forEach((reserva) => {
      const card = document.createElement("article");
      card.className = "reserva-item";

      card.innerHTML = `
        <h3>${reserva.nombre_servicio}</h3>
        <p><strong>Vehículo:</strong> ${reserva.marca} ${reserva.modelo}</p>
        <p><strong>Patente:</strong> ${reserva.patente}</p>
        <p><strong>Fecha:</strong> ${formatearFecha(reserva.fecha_reserva)}</p>
        <p><strong>Hora:</strong> ${formatearHora(reserva.hora_reserva)}</p>
        <p><strong>Estado:</strong> ${reserva.nombre_estado}</p>
        <p><strong>Observaciones:</strong> ${reserva.observaciones || "Sin observaciones"}</p>
        ${
          esCancelable(reserva)
            ? `<button class="btn-cancelar" data-action="cancelar-reserva" data-id-reserva="${reserva.id_reserva}">Cancelar reserva</button>`
            : ""
        }
      `;

      listaReservas.appendChild(card);
    });
  } catch (error) {
    listaReservas.innerHTML =
      '<p class="sin-datos">Error al conectar con el servidor.</p>';
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
      cargarReservasUsuario();
    } else {
      mostrarMensaje(data.mensaje || "No se pudo cancelar la reserva", false);
    }
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor", false);
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
