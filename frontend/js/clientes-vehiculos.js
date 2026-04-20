const usuarioLogueado = document.getElementById("usuario_logueado");
const listaClientes = document.getElementById("listaClientes");
const listaVehiculos = document.getElementById("listaVehiculos");
const inputBuscar = document.getElementById("inputBuscar");

let clientesGlobales = [];
let vehiculosGlobales = [];

const usuario = exigirAdmin();
if (!usuario) {
  throw new Error("Acceso no autorizado");
}

usuarioLogueado.textContent = `${usuario.nombre} ${usuario.apellido}`;

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

function formatearFecha(fechaIso) {
  if (!fechaIso) return "No informada";

  const fecha = new Date(fechaIso);
  if (isNaN(fecha)) return fechaIso;

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  return `${dia}-${mes}-${anio}`;
}

function crearTextoBusqueda(item) {
  return `
    ${item.nombre || ""}
    ${item.apellido || ""}
    ${item.correo || ""}
    ${item.patente || ""}
    ${item.marca || ""}
    ${item.modelo || ""}
  `
    .toLowerCase()
    .trim();
}

function renderizarClientes(clientes) {
  if (clientes.length === 0) {
    listaClientes.innerHTML =
      '<p class="sin-datos">No hay clientes registrados.</p>';
    return;
  }

  listaClientes.innerHTML = "";

  clientes.forEach((cliente) => {
    const card = document.createElement("article");
    card.className = "info-item";

    const totalVehiculosTexto =
      cliente.total_vehiculos !== undefined && cliente.total_vehiculos !== null
        ? cliente.total_vehiculos
        : "No informado";

    const totalReservasTexto =
      cliente.total_reservas !== undefined && cliente.total_reservas !== null
        ? cliente.total_reservas
        : "No informado";

    card.innerHTML = `
      <h3>${cliente.nombre} ${cliente.apellido}</h3>
      <div class="info-grid">
        <p><strong>Correo:</strong> ${cliente.correo}</p>
        <p><strong>Teléfono:</strong> ${cliente.telefono || "Sin teléfono"}</p>
        <p><strong>Fecha de registro:</strong> ${formatearFecha(cliente.fecha_registro)}</p>
        <p><strong>Total de vehículos:</strong> ${totalVehiculosTexto}</p>
        <p><strong>Total de reservas:</strong> ${totalReservasTexto}</p>
      </div>
    `;

    listaClientes.appendChild(card);
  });
}

function renderizarVehiculos(vehiculos) {
  if (vehiculos.length === 0) {
    listaVehiculos.innerHTML =
      '<p class="sin-datos">No hay vehículos registrados.</p>';
    return;
  }

  listaVehiculos.innerHTML = "";

  vehiculos.forEach((vehiculo) => {
    const card = document.createElement("article");
    card.className = "info-item";

    card.innerHTML = `
      <h3>${vehiculo.marca} ${vehiculo.modelo}</h3>
      <div class="cliente-box">
        <p><strong>Cliente:</strong> ${vehiculo.nombre} ${vehiculo.apellido}</p>
        <p><strong>Correo:</strong> ${vehiculo.correo}</p>
        <p><strong>Teléfono:</strong> ${vehiculo.telefono || "Sin teléfono"}</p>
      </div>
      <div class="info-grid">
        <p><strong>Patente:</strong> ${vehiculo.patente}</p>
        <p><strong>Tipo de vehículo:</strong> ${vehiculo.tipo_vehiculo || "No informado"}</p>
        <p><strong>Color:</strong> ${vehiculo.color || "No informado"}</p>
      </div>
    `;

    listaVehiculos.appendChild(card);
  });
}

async function cargarClientesYVehiculos() {
  try {
    const [clientesResponse, vehiculosResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/usuarios/clientes`),
      fetch(`${API_BASE_URL}/vehiculos`),
    ]);

    const clientes = await clientesResponse.json();
    const vehiculos = await vehiculosResponse.json();

    if (!clientesResponse.ok) {
      listaClientes.innerHTML =
        '<p class="sin-datos">No se pudieron cargar los clientes.</p>';
    } else {
      clientesGlobales = clientes;
      renderizarClientes(clientesGlobales);
    }

    if (!vehiculosResponse.ok) {
      listaVehiculos.innerHTML =
        '<p class="sin-datos">No se pudieron cargar los vehículos.</p>';
    } else {
      vehiculosGlobales = vehiculos;
      renderizarVehiculos(vehiculosGlobales);
    }
  } catch (error) {
    listaClientes.innerHTML =
      '<p class="sin-datos">Error al conectar con el servidor.</p>';
    listaVehiculos.innerHTML =
      '<p class="sin-datos">Error al conectar con el servidor.</p>';
  }
}

function filtrarDatos() {
  const texto = inputBuscar.value.toLowerCase().trim();

  if (texto === "") {
    renderizarClientes(clientesGlobales);
    renderizarVehiculos(vehiculosGlobales);
    return;
  }

  const clientesFiltrados = clientesGlobales.filter((cliente) =>
    crearTextoBusqueda(cliente).includes(texto),
  );

  const vehiculosFiltrados = vehiculosGlobales.filter((vehiculo) =>
    crearTextoBusqueda(vehiculo).includes(texto),
  );

  renderizarClientes(clientesFiltrados);
  renderizarVehiculos(vehiculosFiltrados);
}

inputBuscar.addEventListener("input", filtrarDatos);

cargarClientesYVehiculos();
