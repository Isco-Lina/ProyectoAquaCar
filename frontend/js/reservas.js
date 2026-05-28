const reservaForm = document.getElementById("reservaForm");
const mensaje = document.getElementById("mensaje");
const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const selectVehiculo = document.getElementById("id_vehiculo");
const selectServicio = document.getElementById("id_servicio");
const btnVerMisReservas = document.getElementById("btnVerMisReservas");

const inputFecha = document.getElementById("fecha_reserva");
const inputHora = document.getElementById("hora_reserva");
const diasDisponibles = document.getElementById("diasDisponibles");
const horariosManana = document.getElementById("horariosManana");
const horariosTarde = document.getElementById("horariosTarde");
const horariosDisponibles = document.getElementById("horariosDisponibles");
const mesActualAgenda = document.getElementById("mesActualAgenda");

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const usuario = exigirCliente();

if (!usuario) {
  throw new Error("Acceso no autorizado");
}

usuarioLogueadoInput.textContent = `${usuario.nombre} ${usuario.apellido}`;

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

btnVerMisReservas.addEventListener("click", () => {
  window.location.href = "./mis-reservas.html";
});

function formatearFechaInput(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatearHora(hora) {
  const [h, m] = hora.split(":");
  const horaNum = parseInt(h);
  const sufijo = horaNum >= 12 ? "pm" : "am";
  const hora12 = horaNum % 12 || 12;
  return `${hora12}:${m} ${sufijo}`;
}

function generarDiasAgenda() {
  diasDisponibles.innerHTML = "";
  horariosManana.innerHTML = "";
  horariosTarde.innerHTML = "";
  inputHora.value = "";
  horariosDisponibles.style.display = "block";
  horariosDisponibles.textContent =
    "Selecciona un servicio y una fecha para ver horarios disponibles.";

  const hoy = new Date();
  const hoySeleccionado = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate(),
  );

  for (let i = 0; i < 7; i++) {
    const fecha = new Date(hoySeleccionado);
    fecha.setDate(hoySeleccionado.getDate() + i);

    const fechaValor = formatearFechaInput(fecha);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "agenda-dia";
    btn.dataset.fecha = fechaValor;
    btn.setAttribute("aria-pressed", "false");

    btn.innerHTML = `
      <span>${DIAS_SEMANA[fecha.getDay()]}</span>
      <strong>${String(fecha.getDate()).padStart(2, "0")}</strong>
    `;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".agenda-dia").forEach((b) => {
        b.classList.remove("activo");
        b.setAttribute("aria-pressed", "false");
      });

      btn.classList.add("activo");
      btn.setAttribute("aria-pressed", "true");
      inputFecha.value = fechaValor;
      mesActualAgenda.textContent = `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
      cargarHorariosDisponibles();
    });

    diasDisponibles.appendChild(btn);

    if (i === 0) {
      btn.classList.add("activo");
      btn.setAttribute("aria-pressed", "true");
      inputFecha.value = fechaValor;
      mesActualAgenda.textContent = `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
    }
  }
}

async function cargarVehiculos() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/vehiculos/usuario/${usuario.id_usuario}`,
    );

    const vehiculos = await response.json();

    selectVehiculo.innerHTML =
      '<option value="">Seleccione un vehículo</option>';

    if (!response.ok) {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = "No se pudieron cargar tus vehículos";
      return;
    }

    if (vehiculos.length === 0) {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = "No tienes vehículos registrados";
      return;
    }

    vehiculos.forEach((vehiculo) => {
      const option = document.createElement("option");
      option.value = vehiculo.id_vehiculo;
      option.textContent = `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.patente}`;
      selectVehiculo.appendChild(option);
    });
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "Error al cargar vehículos";
  }
}

async function cargarServicios() {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios/activos`);
    const servicios = await response.json();

    selectServicio.innerHTML =
      '<option value="">Seleccione un servicio</option>';

    servicios.forEach((servicio) => {
      const option = document.createElement("option");
      option.value = servicio.id_servicio;
      option.textContent = `${servicio.nombre_servicio} - $${parseInt(servicio.precio)}`;
      selectServicio.appendChild(option);
    });
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "Error al cargar servicios";
  }
}

async function cargarHorariosDisponibles() {
  const fecha = inputFecha.value;
  const id_servicio = selectServicio.value;

  inputHora.value = "";
  document
    .querySelectorAll(".agenda-hora")
    .forEach((b) => b.classList.remove("activo"));
  horariosManana.innerHTML = "";
  horariosTarde.innerHTML = "";

  if (!fecha || !id_servicio) {
    horariosDisponibles.style.display = "block";
    horariosDisponibles.textContent =
      "Selecciona un servicio y una fecha para ver horarios disponibles.";
    return;
  }

  horariosDisponibles.style.display = "block";
  horariosDisponibles.textContent = "Cargando horarios disponibles...";

  try {
    const response = await fetch(
      `${API_BASE_URL}/reservas/disponibilidad?fecha=${fecha}&id_servicio=${id_servicio}`,
    );

    const data = await response.json();

    if (!response.ok) {
      horariosDisponibles.textContent =
        data.mensaje || "No se pudieron cargar los horarios.";
      return;
    }

    if (!data.horarios || data.horarios.length === 0) {
      horariosDisponibles.textContent =
        "No quedan horarios disponibles para esta fecha.";
      return;
    }

    horariosDisponibles.style.display = "none";

    data.horarios.forEach((hora) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "agenda-hora";
      btn.textContent = formatearHora(hora);
      btn.setAttribute("aria-pressed", "false");

      btn.addEventListener("click", () => {
        document.querySelectorAll(".agenda-hora").forEach((b) => {
          b.classList.remove("activo");
          b.setAttribute("aria-pressed", "false");
        });

        btn.classList.add("activo");
        btn.setAttribute("aria-pressed", "true");
        inputHora.value = hora;
      });

      const horaNumero = parseInt(hora.split(":")[0]);

      if (horaNumero < 12) {
        horariosManana.appendChild(btn);
      } else {
        horariosTarde.appendChild(btn);
      }
    });
  } catch (error) {
    horariosDisponibles.style.display = "block";
    horariosDisponibles.textContent = "Error al conectar con el servidor.";
  }
}

selectServicio.addEventListener("change", cargarHorariosDisponibles);

reservaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id_usuario = usuario.id_usuario;
  const id_vehiculo = selectVehiculo.value;
  const id_servicio = selectServicio.value;
  const id_estado = 1;
  const fecha_reserva = inputFecha.value;
  const hora_reserva = inputHora.value;
  const observaciones = document.getElementById("observaciones").value;

  if (!hora_reserva) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "Debes seleccionar un horario disponible";
    mostrarToast("El horario seleccionado no está disponible.", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reservas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_usuario,
        id_vehiculo,
        id_servicio,
        id_estado,
        fecha_reserva,
        hora_reserva,
        observaciones,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.style.color = "#00ff88";
      mensaje.textContent = data.mensaje || "Reserva creada correctamente.";
      mostrarToast("Reserva creada correctamente.", "success");

      reservaForm.reset();
      inputHora.value = "";

      horariosManana.innerHTML = "";
      horariosTarde.innerHTML = "";
      horariosDisponibles.style.display = "block";
      horariosDisponibles.textContent =
        "Selecciona un servicio y una fecha para ver horarios disponibles.";

      generarDiasAgenda();
      cargarVehiculos();
      cargarServicios();
    } else {
      mensaje.style.color = "#ff6b6b";
      const mensajeError = String(data.mensaje || "").toLowerCase();
      if (
        mensajeError.includes("dispon") ||
        mensajeError.includes("horario") ||
        mensajeError.includes("choque")
      ) {
        mensaje.textContent =
          data.mensaje || "El horario seleccionado no está disponible.";
        mostrarToast("El horario seleccionado no está disponible.", "warning");
      } else {
        mensaje.textContent = data.mensaje || "No se pudo procesar la reserva.";
        mostrarToast("No se pudo procesar la reserva.", "error");
      }
    }
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "No se pudo procesar la reserva.";
    mostrarToast("No se pudo procesar la reserva.", "error");
  }
});

generarDiasAgenda();
cargarVehiculos();
cargarServicios();
