const vehiculoForm = document.getElementById("vehiculoForm");
const mensaje = document.getElementById("mensaje");
const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const listaVehiculos = document.getElementById("listaVehiculos");

const usuario = exigirCliente();
if (!usuario) {
  throw new Error("Acceso no autorizado");
}

usuarioLogueadoInput.textContent = `${usuario.nombre} ${usuario.apellido}`;

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

async function cargarVehiculosUsuario() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/vehiculos/usuario/${usuario.id_usuario}`,
    );
    const vehiculos = await response.json();

    if (!response.ok) {
      listaVehiculos.innerHTML =
        '<p class="sin-datos">No se pudieron cargar los vehículos.</p>';
      return;
    }

    if (vehiculos.length === 0) {
      listaVehiculos.innerHTML =
        '<p class="sin-datos">Aún no tienes vehículos registrados.</p>';
      return;
    }

    listaVehiculos.innerHTML = "";

    vehiculos.forEach((vehiculo) => {
      const card = document.createElement("div");
      card.className = "vehiculo-item";

      card.innerHTML = `
            <h3>${vehiculo.marca} ${vehiculo.modelo}</h3>
            <p><strong>Patente:</strong> ${vehiculo.patente}</p>
            <p><strong>Tipo:</strong> ${vehiculo.tipo_vehiculo}</p>
            <p><strong>Color:</strong> ${vehiculo.color}</p>
          `;

      listaVehiculos.appendChild(card);
    });
  } catch (error) {
    listaVehiculos.innerHTML =
      '<p class="sin-datos">Error al conectar con el servidor.</p>';
  }
}

vehiculoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id_usuario = usuario.id_usuario;
  const marca = document.getElementById("marca").value;
  const modelo = document.getElementById("modelo").value;
  const patente = document.getElementById("patente").value;
  const tipo_vehiculo = document.getElementById("tipo_vehiculo").value;
  const color = document.getElementById("color").value;

  try {
    const response = await fetch(`${API_BASE_URL}/vehiculos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_usuario,
        marca,
        modelo,
        patente,
        tipo_vehiculo,
        color,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.style.color = "#00ff88";
      mensaje.textContent = data.mensaje || "Vehículo registrado correctamente";
      vehiculoForm.reset();
      cargarVehiculosUsuario();
    } else {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = data.mensaje || "No se pudo registrar el vehículo";
    }
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "Error al conectar con el servidor";
  }
});

cargarVehiculosUsuario();
