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

function renderizarEstadoVacío(contenedor, texto, icono = "bi-people") {
  contenedor.innerHTML = `
    <div class="col-12">
      <div class="aqua-empty-state">
        <i class="bi ${icono}"></i>
        <p>${texto}</p>
      </div>
    </div>
  `;
}

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

function formatearFecha(fechaIso) {
  if (!fechaIso) return "Sin fecha";

  const fechaTexto = String(fechaIso).split("T")[0];
  const partes = fechaTexto.split("-");

  if (partes.length !== 3) return fechaIso;

  const [anio, mes, dia] = partes;

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

function claveCliente(item) {
  return item.id_usuario || item.correo || `${item.nombre}-${item.apellido}`;
}

function agruparVehiculosPorCliente(vehiculos) {
  return vehiculos.reduce((acumulador, vehiculo) => {
    const clave =
      vehiculo.id_usuario ||
      vehiculo.correo ||
      vehiculo.correo_usuario ||
      "sin-clave";
    if (!acumulador[clave]) {
      acumulador[clave] = [];
    }

    acumulador[clave].push(vehiculo);
    return acumulador;
  }, {});
}

function formatearVehiculo(vehiculo, mostrarCliente = false) {
  return `
    <article class="vehicle-card h-100">
      <div class="aqua-card-topline"></div>
      <div class="vehicle-card-head d-flex align-items-start gap-3">
        <div class="vehicle-icon" style="background: linear-gradient(135deg, var(--aqua-cyan-bright), var(--aqua-green-water));">
          <i class="bi bi-car-front"></i>
        </div>
        <div class="flex-grow-1">
          <h4 class="vehicle-title mb-1">${vehiculo.marca} ${vehiculo.modelo}</h4>
          <p class="vehicle-subtitle mb-0">${vehiculo.patente}</p>
        </div>
      </div>
      <div class="vehicle-card-body">
        <div class="vehicle-meta">
          <div class="item-info"><i class="bi bi-tag"></i><strong>Tipo:</strong> ${vehiculo.tipo_vehiculo || "No informado"}</div>
          <div class="item-info"><i class="bi bi-palette"></i><strong>Color:</strong> ${vehiculo.color || "No informado"}</div>
          ${mostrarCliente ? `<div class="item-info"><i class="bi bi-person"></i><strong>Cliente:</strong> ${vehiculo.nombre || ""} ${vehiculo.apellido || ""}</div>` : ""}
          ${mostrarCliente && vehiculo.correo ? `<div class="item-info"><i class="bi bi-envelope"></i><strong>Correo:</strong> ${vehiculo.correo}</div>` : ""}
        </div>
      </div>
    </article>
  `;
}

function formatearVehiculoModal(vehiculo) {
  return `
    <article class="vehicle-modal-card h-100">
      <div class="vehicle-modal-topline"></div>
      <div class="vehicle-modal-head">
        <div class="vehicle-modal-icon">
          <i class="bi bi-car-front"></i>
        </div>
        <div class="flex-grow-1">
          <h4 class="vehicle-modal-title mb-1">${vehiculo.marca} ${vehiculo.modelo}</h4>
          <p class="vehicle-modal-subtitle mb-0">${vehiculo.patente}</p>
        </div>
      </div>
      <div class="vehicle-modal-body">
        <div class="vehicle-modal-meta">
          <div class="item-info"><i class="bi bi-tag"></i><strong>Tipo:</strong> ${vehiculo.tipo_vehiculo || "No informado"}</div>
          <div class="item-info"><i class="bi bi-palette"></i><strong>Color:</strong> ${vehiculo.color || "No informado"}</div>
        </div>
      </div>
    </article>
  `;
}

function abrirModalVehiculos(cliente, vehiculosCliente) {
  const modalTitle = document.querySelector("#modalVehiculosLabel");
  const modalMeta = document.getElementById("modalVehiculosMeta");
  const modalContent = document.getElementById("modalVehiculosContent");

  modalTitle.textContent = "Vehículos de Cliente";
  modalMeta.innerHTML = `
    <span class="admin-client-modal-name">${cliente.nombre} ${cliente.apellido}</span>
    <span class="admin-client-modal-email">${cliente.correo || "Sin correo"}</span>
  `;

  if (vehiculosCliente.length === 0) {
    modalContent.innerHTML = `
      <div class="vehicle-modal-empty aqua-empty-state py-4">
        <i class="bi bi-car-front"></i>
        <p>Este cliente no tiene vehículos registrados.</p>
      </div>
    `;
  } else {
    modalContent.innerHTML = `
      <div class="vehicle-modal-grid">
        ${vehiculosCliente
          .map((vehiculo) => formatearVehiculoModal(vehiculo))
          .join("")}
      </div>
    `;
  }

  const modal = new bootstrap.Modal(document.getElementById("modalVehiculos"));
  modal.show();
}

function formatearClienteCompacto(cliente, vehiculosCliente) {
  const totalVehiculos = cliente.total_vehiculos ?? vehiculosCliente.length;

  return `
    <div class="col-lg-4 col-md-6 col-12">
      <article class="service-admin-card h-100">
        <div class="aqua-card-topline"></div>
        <div class="service-card-head d-flex align-items-start gap-3">
          <div class="service-icon" style="background: linear-gradient(135deg, var(--aqua-cyan-bright), var(--aqua-green-water));">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="flex-grow-1">
            <h3 class="service-title mb-1">${cliente.nombre} ${cliente.apellido}</h3>
            <p class="service-subtitle mb-0">${cliente.correo}</p>
          </div>
        </div>
        <div class="service-admin-card-body">
          <div class="service-card-meta">
            <div class="item-info"><i class="bi bi-telephone"></i><strong>Teléfono:</strong> ${cliente.telefono || "No informado"}</div>
            <div class="item-info"><i class="bi bi-car-front"></i><strong>Vehículos:</strong> ${totalVehiculos}</div>
            <div class="item-info"><i class="bi bi-receipt"></i><strong>Reservas:</strong> ${cliente.total_reservas ?? 0}</div>
          </div>
          <div class="service-card-footer mt-4">
            ${
              totalVehiculos > 0
                ? `<button class="btn btn-outline-info flex-grow-1" onclick="mostrarVehiculosDelCliente(this, ${JSON.stringify(cliente).replace(/"/g, "&quot;")}, ${vehiculosCliente.length})">
                  <i class="bi bi-car-front"></i> Ver vehículos
                </button>`
                : `<button class="btn btn-outline-secondary flex-grow-1" disabled>
                  <i class="bi bi-car-front"></i> Sin vehículos
                </button>`
            }
          </div>
        </div>
      </article>
    </div>
  `;
}

window.mostrarVehiculosDelCliente = function (btn, cliente, count) {
  const vehiculosDelCliente = vehiculosGlobales.filter(
    (v) =>
      v.id_usuario === cliente.id_usuario ||
      v.correo_usuario === cliente.correo ||
      v.correo === cliente.correo,
  );
  abrirModalVehiculos(cliente, vehiculosDelCliente);
};

function renderizarClientes(clientes) {
  if (clientes.length === 0) {
    renderizarEstadoVacío(
      listaClientes,
      "No hay clientes registrados.",
      "bi-people",
    );
    return;
  }

  const vehiculosPorCliente = agruparVehiculosPorCliente(vehiculosGlobales);
  listaClientes.innerHTML = clientes
    .map((cliente) => {
      const vehicles = vehiculosPorCliente[claveCliente(cliente)] || [];
      return formatearClienteCompacto(cliente, vehicles);
    })
    .join("");
}

function renderizarVehiculos(vehiculos) {
  if (vehiculos.length === 0) {
    renderizarEstadoVacío(
      listaVehiculos,
      "No hay vehículos registrados.",
      "bi-car-front",
    );
    return;
  }

  listaVehiculos.innerHTML = vehiculos
    .map(
      (vehiculo) => `
        <div class="col-lg-4 col-md-6 col-12">
          ${formatearVehiculo(vehiculo, true)}
        </div>
      `,
    )
    .join("");
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
      renderizarEstadoVacío(
        listaClientes,
        "No se pudieron cargar los clientes.",
        "bi-people",
      );
    } else {
      clientesGlobales = clientes;
      renderizarClientes(clientesGlobales);
    }

    if (!vehiculosResponse.ok) {
      renderizarEstadoVacío(
        listaVehiculos,
        "No se pudieron cargar los vehículos.",
        "bi-car-front",
      );
      mostrarToast("No se pudieron cargar los vehículos del cliente.", "error");
    } else {
      vehiculosGlobales = vehiculos;
      renderizarVehiculos(vehiculosGlobales);
    }
  } catch (error) {
    renderizarEstadoVacío(
      listaClientes,
      "Error al conectar con el servidor.",
      "bi-people",
    );
    renderizarEstadoVacío(
      listaVehiculos,
      "Error al conectar con el servidor.",
      "bi-car-front",
    );
    mostrarToast("No se pudieron cargar los vehículos del cliente.", "error");
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
