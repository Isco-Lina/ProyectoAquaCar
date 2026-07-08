const reservaForm = document.getElementById("reservaForm");
const mensaje = document.getElementById("mensaje");
const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const selectVehiculo = document.getElementById("id_vehiculo");
const selectServicio = document.getElementById("id_servicio");
const fechaInput = document.getElementById("fecha_reserva");
const horaInput = document.getElementById("hora_reserva");
const fechasDisponibles = document.getElementById("fechasDisponibles");
const horariosDisponibles = document.getElementById("horariosDisponibles");
const detalleServicio = document.getElementById("detalleServicio");
const horaSeleccionadaTexto = document.getElementById("horaSeleccionadaTexto");

let servicios = [];

function cerrarSesionSiNoAutorizado(response) {
  if (response.status === 401 || response.status === 403) {
    cerrarSesion();
    return true;
  }

  return false;
}

const usuario = exigirCliente();
if (!usuario) throw new Error("Acceso no autorizado");

usuarioLogueadoInput.textContent = `${usuario.nombre} ${usuario.apellido}`;

document
  .getElementById("btnCerrarSesion")
  .addEventListener("click", cerrarSesion);

async function cargarVehiculos() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/vehiculos/usuario/${usuario.id_usuario}`,
      {
        method: "GET",
        headers: obtenerHeadersAuth(),
      },
    );

    if (cerrarSesionSiNoAutorizado(response)) return;

    const vehiculos = await response.json();

    selectVehiculo.innerHTML = '<option value="">Vehículo</option>';

    vehiculos.forEach((vehiculo) => {
      const option = document.createElement("option");
      option.value = vehiculo.id_vehiculo;
      option.textContent = `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}`;
      selectVehiculo.appendChild(option);
    });
  } catch {
    mostrarMensaje("Error al cargar vehículos", false);
  }
}

async function cargarServicios() {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios/activos`);
    servicios = await response.json();

    selectServicio.innerHTML = '<option value="">Servicio</option>';

    servicios.forEach((servicio) => {
      const option = document.createElement("option");
      option.value = servicio.id_servicio;
      option.textContent = servicio.nombre_servicio;
      selectServicio.appendChild(option);
    });
  } catch {
    mostrarMensaje("Error al cargar servicios", false);
  }
}

function generarFechas() {
  fechasDisponibles.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + i);

    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");
    const fechaSQL = `${yyyy}-${mm}-${dd}`;

    const textoDia = fecha.toLocaleDateString("es-CL", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "fecha-card";
    boton.innerHTML = `<span>${textoDia}</span><strong>${fechaSQL}</strong>`;

    boton.addEventListener("click", () => {
      document
        .querySelectorAll(".fecha-card")
        .forEach((b) => b.classList.remove("activo"));
      boton.classList.add("activo");
      fechaInput.value = fechaSQL;
      horaInput.value = "";
      horaSeleccionadaTexto.textContent = "ninguna";
      cargarHorariosDisponibles();
    });

    fechasDisponibles.appendChild(boton);

    if (i === 0) boton.click();
  }
}

selectServicio.addEventListener("change", () => {
  const servicio = servicios.find(
    (s) => String(s.id_servicio) === selectServicio.value,
  );

  if (!servicio) {
    detalleServicio.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = "Selecciona un servicio para ver precio y duración.";
    detalleServicio.appendChild(p);
    return;
  }

  detalleServicio.innerHTML = "";

  const h3 = document.createElement("h3");
  h3.textContent = servicio.nombre_servicio;
  detalleServicio.appendChild(h3);

  const p = document.createElement("p");
  p.textContent = servicio.descripcion;
  detalleServicio.appendChild(p);

  const div = document.createElement("div");
  div.className = "detalle-linea";

  const strong = document.createElement("strong");
  strong.textContent = formatearPrecio(servicio.precio);
  div.appendChild(strong);

  const span = document.createElement("span");
  span.textContent = `${servicio.duracion_minutos} min`;
  div.appendChild(span);

  detalleServicio.appendChild(div);

  cargarHorariosDisponibles();
});

async function cargarHorariosDisponibles() {
  const idServicio = selectServicio.value;
  const fecha = fechaInput.value;

  if (!idServicio || !fecha) {
    horariosDisponibles.innerHTML = "";
    const div = document.createElement("div");
    div.className = "aviso";
    div.textContent = "Selecciona un servicio y una fecha.";
    horariosDisponibles.appendChild(div);
    return;
  }

  const horariosBase = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
  ];

  let ocupados = [];

  try {
    const response = await fetch(
      `${API_BASE_URL}/reservas/ocupadas?fecha_reserva=${fecha}&id_servicio=${idServicio}`,
      {
        method: "GET",
        headers: obtenerHeadersAuth(),
      },
    );

    if (cerrarSesionSiNoAutorizado(response)) return;

    if (response.ok) {
      ocupados = await response.json();
    }
  } catch {
    ocupados = [];
  }

  const horasOcupadas = ocupados.map((r) => String(r.hora_reserva).slice(0, 5));

  horariosDisponibles.innerHTML = "";

  horariosBase.forEach((hora) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "hora-card";
    boton.textContent = hora;

    if (horasOcupadas.includes(hora)) {
      boton.disabled = true;
      boton.classList.add("ocupado");
    }

    boton.addEventListener("click", () => {
      document
        .querySelectorAll(".hora-card")
        .forEach((b) => b.classList.remove("activo"));
      boton.classList.add("activo");
      horaInput.value = hora;
      horaSeleccionadaTexto.textContent = hora;
    });

    horariosDisponibles.appendChild(boton);
  });
}

reservaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!horaInput.value) {
    mostrarMensaje("Debes seleccionar una hora disponible", false);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reservas`, {
      method: "POST",
      headers: obtenerHeadersAuth(),
      body: JSON.stringify({
        id_vehiculo: selectVehiculo.value,
        id_servicio: selectServicio.value,
        fecha_reserva: fechaInput.value,
        hora_reserva: horaInput.value,
        observaciones: document.getElementById("observaciones").value,
      }),
    });

    if (cerrarSesionSiNoAutorizado(response)) return;

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(data.mensaje || "Reserva registrada correctamente", true);

      const vehiculoSeleccionado =
        selectVehiculo.options[selectVehiculo.selectedIndex]?.textContent ||
        "Vehículo no informado";

      const servicioSeleccionado =
        selectServicio.options[selectServicio.selectedIndex]?.textContent ||
        "Servicio no informado";

      const observaciones =
        document.getElementById("observaciones").value || "Sin observaciones";

      const mensajeAdmin = `🚗✨ Hola AquaCar

Quiero solicitar una nueva reserva.

👤 Cliente: ${usuario.nombre} ${usuario.apellido}
🚘 Vehículo: ${vehiculoSeleccionado}
🧼 Servicio: ${servicioSeleccionado}
📅 Fecha: ${fechaInput.value}
🕒 Hora: ${horaInput.value}
📝 Observaciones: ${observaciones || "Sin observaciones"}

Quedo atento(a) a la confirmación.
¡Muchas gracias! 💙`;
      // numero administrador
      abrirWhatsApp("56982820443", mensajeAdmin);

      reservaForm.reset();
      horaSeleccionadaTexto.textContent = "ninguna";
      generarFechas();
      cargarHorariosDisponibles();
    } else {
      mostrarMensaje(data.mensaje || "No se pudo registrar la reserva", false);
    }
  } catch {
    mostrarMensaje("Error al conectar con el servidor", false);
  }
});

function mostrarMensaje(texto, ok) {
  mensaje.textContent = texto;
  mensaje.style.color = ok ? "#00ffae" : "#ff6b6b";
}

function formatearPrecio(precio) {
  return Number(precio).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

cargarVehiculos();
cargarServicios();
generarFechas();
