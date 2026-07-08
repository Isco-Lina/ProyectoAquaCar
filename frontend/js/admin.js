const usuarioLogueado = document.getElementById("usuario_logueado");
const mensaje = document.getElementById("mensaje");
const listaReservas = document.getElementById("listaReservas");
const inputBuscar = document.getElementById("inputBuscar");
const filtroEstado = document.getElementById("filtroEstado");

let reservasGlobales = [];

function cerrarSesionSiNoAutorizado(response) {
  if (response.status === 401 || response.status === 403) {
    cerrarSesion();
    return true;
  }

  return false;
}

const usuario = exigirAdmin();

if (!usuario) {
  throw new Error("Acceso no autorizado");
}

if (usuarioLogueado) {
  usuarioLogueado.textContent = `${usuario.nombre} ${usuario.apellido}`;
}

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener("click", () => {
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
    const response = await fetch(`${API_BASE_URL}/reservas`, {
      method: "GET",
      headers: obtenerHeadersAuth(),
    });

    if (cerrarSesionSiNoAutorizado(response)) return;

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
    listaReservas.innerHTML = "";
    const p = document.createElement("p");
    p.className = "sin-datos";
    p.textContent = "No hay reservas que coincidan con el filtro.";
    listaReservas.appendChild(p);
    return;
  }

  listaReservas.innerHTML = "";

  reservas.forEach((reserva) => {
    const card = document.createElement("div");
    card.className = "reserva-item";

    // Título del servicio
    const h3 = document.createElement("h3");
    h3.textContent = reserva.nombre_servicio;
    card.appendChild(h3);

    // Cliente box
    const clienteBox = document.createElement("div");
    clienteBox.className = "cliente-box";

    const pCliente = document.createElement("p");
    pCliente.innerHTML = `<strong>Cliente:</strong> ${escaparHtml(reserva.nombre + " " + reserva.apellido)}`;
    clienteBox.appendChild(pCliente);

    const pCorreo = document.createElement("p");
    pCorreo.innerHTML = `<strong>Correo:</strong> ${escaparHtml(reserva.correo)}`;
    clienteBox.appendChild(pCorreo);

    const pTel = document.createElement("p");
    pTel.innerHTML = `<strong>Teléfono:</strong> ${escaparHtml(reserva.telefono || "Sin teléfono")}`;
    clienteBox.appendChild(pTel);

    card.appendChild(clienteBox);

    // Info grid
    const infoGrid = document.createElement("div");
    infoGrid.className = "info-grid";

    const pVehiculo = document.createElement("p");
    pVehiculo.innerHTML = `<strong>Vehículo:</strong> ${escaparHtml(reserva.marca + " " + reserva.modelo)}`;
    infoGrid.appendChild(pVehiculo);

    const pPatente = document.createElement("p");
    pPatente.innerHTML = `<strong>Patente:</strong> ${escaparHtml(reserva.patente)}`;
    infoGrid.appendChild(pPatente);

    const pTipo = document.createElement("p");
    pTipo.innerHTML = `<strong>Tipo:</strong> ${escaparHtml(reserva.tipo_vehiculo || "No informado")}`;
    infoGrid.appendChild(pTipo);

    const pColor = document.createElement("p");
    pColor.innerHTML = `<strong>Color:</strong> ${escaparHtml(reserva.color || "No informado")}`;
    infoGrid.appendChild(pColor);

    const pFecha = document.createElement("p");
    pFecha.innerHTML = `<strong>Fecha:</strong> ${formatearFecha(reserva.fecha_reserva)}`;
    infoGrid.appendChild(pFecha);

    const pHora = document.createElement("p");
    pHora.innerHTML = `<strong>Hora:</strong> ${formatearHora(reserva.hora_reserva)}`;
    infoGrid.appendChild(pHora);

    card.appendChild(infoGrid);

    // Estado box
    const estadoBox = document.createElement("div");
    estadoBox.className = "estado-box";

    const spanLabel = document.createElement("span");
    spanLabel.className = "estado-label";
    spanLabel.textContent = "Estado actual:";
    estadoBox.appendChild(spanLabel);

    const spanBadge = document.createElement("span");
    spanBadge.className = `estado-badge ${obtenerClaseEstado(reserva.nombre_estado)}`;
    spanBadge.textContent = reserva.nombre_estado;
    estadoBox.appendChild(spanBadge);

    card.appendChild(estadoBox);

    // Observaciones
    const pObs = document.createElement("p");
    pObs.className = "observacion-texto";
    pObs.innerHTML = `<strong>Observaciones:</strong> ${escaparHtml(reserva.observaciones || "Sin observaciones")}`;
    card.appendChild(pObs);

    // Acciones
    const accionesCard = document.createElement("div");
    accionesCard.className = "acciones-card";

    const label = document.createElement("label");
    label.className = "label-select";
    label.setAttribute("for", `estado_${reserva.id_reserva}`);
    label.textContent = "Cambiar estado";
    accionesCard.appendChild(label);

    const selectWrapper = document.createElement("div");
    selectWrapper.className = "select-wrapper";

    const select = document.createElement("select");
    select.id = `estado_${reserva.id_reserva}`;
    select.className = "select-estado";
    select.innerHTML = obtenerOpcionesEstado(reserva.nombre_estado);
    selectWrapper.appendChild(select);

    accionesCard.appendChild(selectWrapper);

    const btnGuardar = document.createElement("button");
    btnGuardar.className = "btn-estado";
    btnGuardar.setAttribute("data-action", "guardar-estado");
    btnGuardar.setAttribute("data-id-reserva", reserva.id_reserva);
    btnGuardar.textContent = "Guardar estado";
    accionesCard.appendChild(btnGuardar);

    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn-eliminar";
    btnEliminar.setAttribute("data-action", "eliminar-reserva");
    btnEliminar.setAttribute("data-id-reserva", reserva.id_reserva);
    btnEliminar.textContent = "Eliminar reserva";
    accionesCard.appendChild(btnEliminar);

    card.appendChild(accionesCard);

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
      headers: obtenerHeadersAuth(),
    });

    if (cerrarSesionSiNoAutorizado(response)) return;

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
  const nuevoEstadoTexto = select.options[select.selectedIndex].textContent;

  const reserva = reservasGlobales.find((r) => r.id_reserva == idReserva);

  try {
    const response = await fetch(
      `${API_BASE_URL}/reservas/${idReserva}/estado`,
      {
        method: "PUT",
        headers: obtenerHeadersAuth(),
        body: JSON.stringify({
          id_estado: nuevoEstado,
        }),
      },
    );

    if (cerrarSesionSiNoAutorizado(response)) return;

    const data = await response.json();

    if (response.ok) {
      mensaje.style.color = "#00ff88";
      mensaje.textContent = "Estado actualizado correctamente";

      if (reserva && reserva.telefono) {
        const mensajeCliente = `🚗✨ Hola ${reserva.nombre}

Tu reserva en *AquaCar* fue actualizada.

📌 Estado: *${nuevoEstadoTexto}*
🧼 Servicio: ${reserva.nombre_servicio}
🚘 Vehículo: ${reserva.marca} ${reserva.modelo} - ${reserva.patente}
📅 Fecha: ${formatearFecha(reserva.fecha_reserva)}
🕒 Hora: ${formatearHora(reserva.hora_reserva)}

Gracias por preferir *AquaCar* 💙
Seguimos cuidando tu vehículo como se merece.`;

        abrirWhatsApp(reserva.telefono, mensajeCliente);
      }

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

if (listaReservas) {
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
}

if (inputBuscar) {
  inputBuscar.addEventListener("input", filtrarReservas);
}

if (filtroEstado) {
  filtroEstado.addEventListener("change", filtrarReservas);
}

cargarReservas();
