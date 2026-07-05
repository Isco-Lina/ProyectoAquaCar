const vehiculoForm = document.getElementById("vehiculoForm");
const mensaje = document.getElementById("mensaje");
const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const listaVehiculos = document.getElementById("listaVehiculos");

const selectMarca = document.getElementById("marca");
const selectModelo = document.getElementById("modelo");

const usuario = exigirCliente();
if (!usuario) throw new Error("Acceso no autorizado");

usuarioLogueadoInput.textContent = `${usuario.nombre} ${usuario.apellido}`;

document
  .getElementById("btnCerrarSesion")
  .addEventListener("click", cerrarSesion);

const modelosPorMarca = {
  Kia: ["Rio", "Cerato", "Sportage", "Sorento", "Morning"],
  Suzuki: ["Swift", "Baleno", "Vitara", "Grand Vitara", "S-Cross"],
  Toyota: ["Yaris", "Corolla", "RAV4", "Hilux", "Fortuner"],
  Hyundai: ["Accent", "Elantra", "Tucson", "Santa Fe", "Creta"],
  Nissan: ["Versa", "Sentra", "Kicks", "Qashqai", "Navara"],
  Chevrolet: ["Sail", "Onix", "Tracker", "Captiva", "Montana"],
  Ford: ["Fiesta", "Focus", "EcoSport", "Ranger", "Territory"],
  Mazda: ["Mazda 2", "Mazda 3", "CX-3", "CX-5", "BT-50"],
  Volkswagen: ["Gol", "Polo", "Virtus", "T-Cross", "Amarok"],
  Peugeot: ["208", "301", "2008", "3008", "Partner"],
};

function cargarMarcas() {
  selectMarca.innerHTML = '<option value="">Marca</option>';

  Object.keys(modelosPorMarca).forEach((marca) => {
    const option = document.createElement("option");
    option.value = marca;
    option.textContent = marca;
    selectMarca.appendChild(option);
  });
}

selectMarca.addEventListener("change", () => {
  const marca = selectMarca.value;
  const modelos = modelosPorMarca[marca] || [];

  selectModelo.innerHTML = '<option value="">Modelo</option>';
  selectModelo.disabled = !marca;

  modelos.forEach((modelo) => {
    const option = document.createElement("option");
    option.value = modelo;
    option.textContent = modelo;
    selectModelo.appendChild(option);
  });
});

async function cargarVehiculosUsuario() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/vehiculos/usuario/${usuario.id_usuario}`,
      {
        method: "GET",
        headers: obtenerHeadersAuth(),
      },
    );

    if (response.status === 401 || response.status === 403) {
      cerrarSesion();
      return;
    }

    const vehiculos = await response.json();

    if (!response.ok) {
      listaVehiculos.innerHTML = `<p class="sin-datos">No se pudieron cargar los vehículos.</p>`;
      return;
    }

    if (vehiculos.length === 0) {
      listaVehiculos.innerHTML = `
        <div class="sin-vehiculos-card">
          <h3>Aún no tienes vehículos registrados</h3>
          <p>Registra tu primer vehículo para poder reservar servicios.</p>
        </div>
      `;
      return;
    }

    listaVehiculos.innerHTML = "";

    vehiculos.forEach((vehiculo) => {
      const card = document.createElement("article");
      card.className = "vehiculo-card";

      card.innerHTML = `
        <div class="vehiculo-top">
          <div>
            <h3>${vehiculo.marca} ${vehiculo.modelo}</h3>
            <p>${vehiculo.tipo_vehiculo}</p>
          </div>

          <span class="patente-badge">${vehiculo.patente}</span>
        </div>

        <div class="vehiculo-tags">
          <span>Color: ${vehiculo.color || "Sin color"}</span>
          <span>Tipo: ${vehiculo.tipo_vehiculo}</span>
        </div>
      `;

      listaVehiculos.appendChild(card);
    });
  } catch {
    listaVehiculos.innerHTML = `<p class="sin-datos">Error al conectar con el servidor.</p>`;
  }
}

vehiculoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const patente = document.getElementById("patente").value.trim().toUpperCase();
  const marca = selectMarca.value;
  const modelo = selectModelo.value;
  const tipo_vehiculo = document.getElementById("tipo_vehiculo").value;
  const color = document.getElementById("color").value;

  try {
    const response = await fetch(`${API_BASE_URL}/vehiculos`, {
      method: "POST",
      headers: obtenerHeadersAuth(),
      body: JSON.stringify({
        marca,
        modelo,
        patente,
        tipo_vehiculo,
        color,
      }),
    });

    if (response.status === 401 || response.status === 403) {
      cerrarSesion();
      return;
    }

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(data.mensaje || "Vehículo registrado correctamente", true);
      vehiculoForm.reset();
      selectModelo.innerHTML = '<option value="">Modelo</option>';
      selectModelo.disabled = true;
      cargarVehiculosUsuario();
    } else {
      mostrarMensaje(data.mensaje || "No se pudo registrar el vehículo", false);
    }
  } catch {
    mostrarMensaje("Error al conectar con el servidor", false);
  }
});

function mostrarMensaje(texto, ok) {
  mensaje.textContent = texto;
  mensaje.className = ok ? "message exito" : "message error";
}

cargarMarcas();
cargarVehiculosUsuario();
