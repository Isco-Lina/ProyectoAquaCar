const reservaForm = document.getElementById("reservaForm");
const mensaje = document.getElementById("mensaje");
const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const selectVehiculo = document.getElementById("id_vehiculo");
const selectServicio = document.getElementById("id_servicio");
const btnVerMisReservas = document.getElementById("btnVerMisReservas");

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

reservaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id_usuario = usuario.id_usuario;
  const id_vehiculo = document.getElementById("id_vehiculo").value;
  const id_servicio = document.getElementById("id_servicio").value;
  const id_estado = 1;
  const fecha_reserva = document.getElementById("fecha_reserva").value;
  const hora_reserva = document.getElementById("hora_reserva").value;
  const observaciones = document.getElementById("observaciones").value;

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
      mensaje.textContent = data.mensaje || "Reserva registrada correctamente";

      reservaForm.reset();
      cargarVehiculos();
      cargarServicios();
    } else {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = data.mensaje;
    }
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "Error al conectar con el servidor";
  }
});

cargarVehiculos();
cargarServicios();
