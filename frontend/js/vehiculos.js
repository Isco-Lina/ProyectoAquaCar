const vehiculoForm = document.getElementById("vehiculoForm");
const mensaje = document.getElementById("mensaje");
const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const listaVehiculos = document.getElementById("listaVehiculos");

const selectMarca = document.getElementById("marca");
const selectModelo = document.getElementById("modelo");
const inputOtraMarca = document.getElementById("otraMarca");
const inputOtroModelo = document.getElementById("otroModelo");

const usuario = exigirCliente();
if (!usuario) throw new Error("Acceso no autorizado");

usuarioLogueadoInput.textContent = `${usuario.nombre} ${usuario.apellido}`;

document
  .getElementById("btnCerrarSesion")
  .addEventListener("click", cerrarSesion);

const modelosPorMarca = {
  Kia: [
    "Morning",
    "Rio",
    "Rio 4",
    "Cerato",
    "Soluto",
    "Sportage",
    "Sorento",
    "Seltos",
  ],
  Suzuki: [
    "Alto",
    "Celerio",
    "Swift",
    "Baleno",
    "Vitara",
    "Grand Vitara",
    "S-Cross",
    "Jimny",
  ],
  Toyota: [
    "Yaris",
    "Corolla",
    "Corolla Cross",
    "RAV4",
    "Raize",
    "Fortuner",
    "Hilux",
    "Land Cruiser",
  ],
  Hyundai: [
    "Grand i10",
    "Accent",
    "Elantra",
    "Creta",
    "Tucson",
    "Santa Fe",
    "H-1",
    "Porter",
  ],
  Nissan: [
    "March",
    "Versa",
    "Sentra",
    "Kicks",
    "Qashqai",
    "X-Trail",
    "Navara",
    "Frontier",
  ],
  Chevrolet: [
    "Spark",
    "Spark GT",
    "Sail",
    "Onix",
    "Tracker",
    "Captiva",
    "Groove",
    "Montana",
  ],
  Ford: [
    "Fiesta",
    "Focus",
    "EcoSport",
    "Escape",
    "Territory",
    "Explorer",
    "Ranger",
    "F-150",
  ],
  Mazda: [
    "Mazda 2",
    "Mazda 3",
    "Mazda 6",
    "CX-3",
    "CX-30",
    "CX-5",
    "CX-9",
    "BT-50",
  ],
  Volkswagen: [
    "Gol",
    "Polo",
    "Virtus",
    "Vento",
    "T-Cross",
    "Tiguan",
    "Saveiro",
    "Amarok",
  ],
  Peugeot: ["206", "207", "208", "301", "308", "2008", "3008", "Partner"],

  Chery: [
    "IQ",
    "Arrizo 5",
    "Tiggo 2",
    "Tiggo 3",
    "Tiggo 4",
    "Tiggo 7",
    "Tiggo 8",
  ],
  MG: ["MG3", "MG5", "MG GT", "ZS", "ZX", "HS", "RX5", "Extender"],
  Renault: [
    "Kwid",
    "Clio",
    "Symbol",
    "Logan",
    "Sandero",
    "Duster",
    "Captur",
    "Koleos",
  ],
  Citroen: [
    "C3",
    "C4",
    "C-Elysee",
    "C3 Aircross",
    "C4 Cactus",
    "Berlingo",
    "Jumpy",
  ],
  Honda: ["Fit", "City", "Civic", "Accord", "WR-V", "HR-V", "CR-V", "Pilot"],
  Mitsubishi: [
    "Mirage",
    "Lancer",
    "ASX",
    "Eclipse Cross",
    "Outlander",
    "Montero Sport",
    "L200",
  ],
  Subaru: [
    "Impreza",
    "Legacy",
    "Outback",
    "Forester",
    "XV",
    "Crosstrek",
    "WRX",
  ],
  JAC: ["J2", "J3", "S2", "S3", "JS2", "JS3", "JS4", "JS5", "JS6", "T6", "T8"],
  BYD: ["Dolphin", "Seal", "Yuan Plus", "Song Plus", "Tang", "Han"],
};

function crearOption(valor, texto) {
  const option = document.createElement("option");
  option.value = valor;
  option.textContent = texto;
  return option;
}

function cargarMarcas() {
  selectMarca.innerHTML = '<option value="">Marca</option>';

  Object.keys(modelosPorMarca).forEach((marca) => {
    selectMarca.appendChild(crearOption(marca, marca));
  });

  selectMarca.appendChild(crearOption("OTRA_MARCA", "Otra marca"));
}

function ocultarInput(input) {
  input.classList.add("oculto");
  input.required = false;
  input.value = "";
}

function mostrarInput(input) {
  input.classList.remove("oculto");
  input.required = true;
  input.focus();
}

function cargarModelosPorMarca() {
  const marca = selectMarca.value;
  const modelos = modelosPorMarca[marca] || [];
  const esOtraMarca = marca === "OTRA_MARCA";

  selectModelo.innerHTML = '<option value="">Modelo</option>';
  selectModelo.disabled = !marca || esOtraMarca;

  ocultarInput(inputOtraMarca);
  ocultarInput(inputOtroModelo);

  if (esOtraMarca) {
    mostrarInput(inputOtraMarca);
    mostrarInput(inputOtroModelo);
    return;
  }

  modelos.forEach((modelo) => {
    selectModelo.appendChild(crearOption(modelo, modelo));
  });

  if (marca) {
    selectModelo.appendChild(crearOption("OTRO_MODELO", "Otro modelo"));
  }
}

selectMarca.addEventListener("change", cargarModelosPorMarca);

selectModelo.addEventListener("change", () => {
  if (selectModelo.value === "OTRO_MODELO") {
    mostrarInput(inputOtroModelo);
  } else {
    ocultarInput(inputOtroModelo);
  }
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
  const marca =
    selectMarca.value === "OTRA_MARCA"
      ? inputOtraMarca.value.trim()
      : selectMarca.value;

  const modelo =
    selectModelo.value === "OTRO_MODELO" || selectMarca.value === "OTRA_MARCA"
      ? inputOtroModelo.value.trim()
      : selectModelo.value;

  const tipo_vehiculo = document.getElementById("tipo_vehiculo").value;
  const color = document.getElementById("color").value;

  if (!marca || !modelo) {
    mostrarMensaje("Debes completar marca y modelo del vehículo", false);
    return;
  }

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
      ocultarInput(inputOtraMarca);
      ocultarInput(inputOtroModelo);
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
