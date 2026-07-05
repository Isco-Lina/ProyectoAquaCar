const usuarioLogueado = document.getElementById("usuario_logueado");
const listaClientes = document.getElementById("listaClientes");
const listaVehiculos = document.getElementById("listaVehiculos");
const inputBuscar = document.getElementById("inputBuscar");

let clientesGlobales = [];
let vehiculosGlobales = [];

function cerrarSesionSiNoAutorizado(response) {
  if (response.status === 401 || response.status === 403) {
    cerrarSesion();
    return true;
  }

  return false;
}

const usuario = exigirAdmin();
if (!usuario) throw new Error("Acceso no autorizado");

usuarioLogueado.textContent = `${usuario.nombre} ${usuario.apellido}`;

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

function crearTextoBusqueda(item) {
  return `
    ${item.nombre || ""}
    ${item.apellido || ""}
    ${item.correo || ""}
    ${item.telefono || ""}
    ${item.patente || ""}
    ${item.marca || ""}
    ${item.modelo || ""}
    ${item.tipo_vehiculo || ""}
    ${item.color || ""}
  `.toLowerCase();
}

function renderizarClientes(clientes) {
  if (clientes.length === 0) {
    listaClientes.innerHTML = `<p class="sin-datos">No hay clientes registrados.</p>`;
    return;
  }

  listaClientes.innerHTML = "";

  clientes.forEach((cliente) => {
    const card = document.createElement("article");
    card.className = "cliente-card";

    const totalVehiculos = cliente.total_vehiculos ?? 0;
    const totalReservas = cliente.total_reservas ?? 0;

    card.innerHTML = `
      <div class="cliente-header">
        <div>
          <h3>👥 ${cliente.nombre} ${cliente.apellido}</h3>
          <div class="chips">
            <span>${cliente.correo}</span>
            <span>${cliente.telefono || "Sin teléfono"}</span>
            <span>${totalVehiculos} vehículo${totalVehiculos == 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>

      <div class="cliente-body">
        <div class="dato">
          <small>Correo</small>
          <strong>${cliente.correo}</strong>
        </div>

        <div class="dato">
          <small>Teléfono</small>
          <strong>${cliente.telefono || "Sin teléfono"}</strong>
        </div>

        <div class="dato">
          <small>Fecha registro</small>
          <strong>${formatearFecha(cliente.fecha_registro)}</strong>
        </div>

        <div class="dato">
          <small>Reservas</small>
          <strong>${totalReservas}</strong>
        </div>
      </div>
    `;

    listaClientes.appendChild(card);
  });
}

function renderizarVehiculos(vehiculos) {
  if (vehiculos.length === 0) {
    listaVehiculos.innerHTML = `<p class="sin-datos">No hay vehículos registrados.</p>`;
    return;
  }

  listaVehiculos.innerHTML = "";

  vehiculos.forEach((vehiculo) => {
    const card = document.createElement("article");
    card.className = "vehiculo-card";

    card.innerHTML = `
      <div class="vehiculo-top">
        <div>
          <h3>🚘 ${vehiculo.marca} ${vehiculo.modelo}</h3>
          <p>${vehiculo.nombre} ${vehiculo.apellido}</p>
        </div>

        <span class="patente">${vehiculo.patente}</span>
      </div>

      <div class="vehiculo-datos">
        <span>Correo: ${vehiculo.correo}</span>
        <span>Teléfono: ${vehiculo.telefono || "Sin teléfono"}</span>
        <span>Tipo: ${vehiculo.tipo_vehiculo || "No informado"}</span>
        <span>Color: ${vehiculo.color || "No informado"}</span>
      </div>
    `;

    listaVehiculos.appendChild(card);
  });
}

async function cargarClientesYVehiculos() {
  try {
    const [clientesResponse, vehiculosResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/usuarios/clientes`, {
        method: "GET",
        headers: obtenerHeadersAuth(),
      }),
      fetch(`${API_BASE_URL}/vehiculos`, {
        method: "GET",
        headers: obtenerHeadersAuth(),
      }),
    ]);

    if (
      cerrarSesionSiNoAutorizado(clientesResponse) ||
      cerrarSesionSiNoAutorizado(vehiculosResponse)
    ) {
      return;
    }

    const clientes = await clientesResponse.json();
    const vehiculos = await vehiculosResponse.json();

    clientesGlobales = clientesResponse.ok ? clientes : [];
    vehiculosGlobales = vehiculosResponse.ok ? vehiculos : [];

    renderizarClientes(clientesGlobales);
    renderizarVehiculos(vehiculosGlobales);
  } catch {
    listaClientes.innerHTML = `<p class="sin-datos">Error al conectar con el servidor.</p>`;
    listaVehiculos.innerHTML = `<p class="sin-datos">Error al conectar con el servidor.</p>`;
  }
}

function filtrarDatos() {
  const texto = inputBuscar.value.toLowerCase().trim();

  if (!texto) {
    renderizarClientes(clientesGlobales);
    renderizarVehiculos(vehiculosGlobales);
    return;
  }

  renderizarClientes(
    clientesGlobales.filter((cliente) =>
      crearTextoBusqueda(cliente).includes(texto),
    ),
  );

  renderizarVehiculos(
    vehiculosGlobales.filter((vehiculo) =>
      crearTextoBusqueda(vehiculo).includes(texto),
    ),
  );
}

inputBuscar.addEventListener("input", filtrarDatos);

cargarClientesYVehiculos();
