const vehiculoForm = document.getElementById("vehiculoForm");
const mensaje = document.getElementById("mensaje");
const usuarioLogueadoInput = document.getElementById("usuario_logueado");
const listaVehiculos = document.getElementById("listaVehiculos");

const selectMarca = document.getElementById("marca");
const selectModelo = document.getElementById("modelo");
const inputTipoVehiculo = document.getElementById("tipo_vehiculo");
const selectColor = document.getElementById("color");
const inputPatente = document.getElementById("patente");

const usuario = exigirCliente();

if (!usuario) {
  throw new Error("Acceso no autorizado");
}

usuarioLogueadoInput.textContent = `${usuario.nombre} ${usuario.apellido}`;

/* =========================
   MENSAJES
========================= */

function mostrarMensaje(texto, tipo = "error") {
  mensaje.style.color = tipo === "ok" ? "#00ff88" : "#ff6b6b";
  mensaje.textContent = texto;
}

function limpiarMensaje() {
  mensaje.textContent = "";
}

/* =========================
   ESTADO VACÍO
========================= */

function renderizarEstadoVacío(texto) {
  listaVehiculos.innerHTML = `
    <div class="col-12">
      <div class="aqua-empty-state">
        <i class="bi bi-car-front"></i>
        <p>${texto}</p>
      </div>
    </div>
  `;
}

/* =========================
   CARD VEHÍCULO
========================= */

function formatearVehiculo(vehiculo) {
  return `
    <div class="col-md-6 col-xl-4">
      <article class="vehicle-card h-100">
        
        <div class="aqua-card-topline"></div>

        <div class="vehicle-card-head d-flex align-items-start gap-3">
          <div 
            class="vehicle-icon"
            style="
              background:
              linear-gradient(
                135deg,
                var(--aqua-cyan-bright),
                var(--aqua-green-water)
              );
            "
          >
            <i class="bi bi-car-front"></i>
          </div>

          <div class="flex-grow-1">
            <h3 class="vehicle-title mb-1">
              ${vehiculo.marca} ${vehiculo.modelo}
            </h3>

            <p class="vehicle-subtitle mb-0">
              Patente ${vehiculo.patente}
            </p>
          </div>
        </div>

        <div class="vehicle-card-body">

          <div class="vehicle-meta">

            <div class="item-info">
              <i class="bi bi-tag"></i>
              <strong>Tipo:</strong>
              ${vehiculo.tipo_vehiculo}
            </div>

            <div class="item-info">
              <i class="bi bi-palette"></i>
              <strong>Color:</strong>
              ${vehiculo.color}
            </div>

            <div class="item-info">
              <i class="bi bi-123"></i>
              <strong>Patente:</strong>
              ${vehiculo.patente}
            </div>

          </div>
        </div>
      </article>
    </div>
  `;
}

/* =========================
   CERRAR SESIÓN
========================= */

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

/* =========================
   CARGAR MARCAS
========================= */

async function cargarMarcas() {
  try {
    const response = await fetch(`${API_BASE_URL}/vehiculos/catalogo/marcas`);

    const marcas = await response.json();

    if (!response.ok) {
      mostrarMensaje("No se pudieron cargar las marcas.");
      return;
    }

    selectMarca.innerHTML = '<option value="">Selecciona una marca</option>';

    marcas.forEach((marca) => {
      selectMarca.innerHTML += `
        <option value="${marca.id_marca}">
          ${marca.nombre_marca}
        </option>
      `;
    });
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor al cargar marcas.");
  }
}

/* =========================
   CARGAR COLORES
========================= */

async function cargarColores() {
  try {
    const response = await fetch(`${API_BASE_URL}/vehiculos/catalogo/colores`);

    const colores = await response.json();

    if (!response.ok) {
      mostrarMensaje("No se pudieron cargar los colores.");
      return;
    }

    selectColor.innerHTML = '<option value="">Selecciona un color</option>';

    colores.forEach((color) => {
      selectColor.innerHTML += `
        <option value="${color.id_color}">
          ${color.nombre_color}
        </option>
      `;
    });
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor al cargar colores.");
  }
}

/* =========================
   CARGAR MODELOS POR MARCA
========================= */

async function cargarModelosPorMarca(idMarca) {
  selectModelo.innerHTML = '<option value="">Cargando modelos...</option>';

  selectModelo.disabled = true;

  inputTipoVehiculo.value = "";

  try {
    const response = await fetch(
      `${API_BASE_URL}/vehiculos/catalogo/modelos/${idMarca}`,
    );

    const modelos = await response.json();

    if (!response.ok) {
      selectModelo.innerHTML =
        '<option value="">No se pudieron cargar modelos</option>';

      mostrarMensaje("No se pudieron cargar los modelos.");

      return;
    }

    selectModelo.innerHTML = '<option value="">Selecciona un modelo</option>';

    modelos.forEach((modelo) => {
      selectModelo.innerHTML += `
        <option
          value="${modelo.id_modelo}"
          data-tipo="${modelo.nombre_tipo}"
        >
          ${modelo.nombre_modelo}
        </option>
      `;
    });

    selectModelo.disabled = modelos.length === 0;

    if (modelos.length === 0) {
      selectModelo.innerHTML =
        '<option value="">Sin modelos disponibles</option>';
    }
  } catch (error) {
    selectModelo.innerHTML =
      '<option value="">Error al cargar modelos</option>';

    mostrarMensaje("Error al conectar con el servidor al cargar modelos.");
  }
}

/* =========================
   CAMBIO MARCA
========================= */

selectMarca.addEventListener("change", () => {
  limpiarMensaje();

  const idMarca = selectMarca.value;

  if (!idMarca) {
    selectModelo.innerHTML =
      '<option value="">Primero selecciona una marca</option>';

    selectModelo.disabled = true;

    inputTipoVehiculo.value = "";

    return;
  }

  cargarModelosPorMarca(idMarca);
});

/* =========================
   CAMBIO MODELO
========================= */

selectModelo.addEventListener("change", () => {
  limpiarMensaje();

  const opcionSeleccionada = selectModelo.options[selectModelo.selectedIndex];

  inputTipoVehiculo.value = opcionSeleccionada.dataset.tipo || "";
});

/* =========================
   PATENTE MAYÚSCULA
========================= */

inputPatente.addEventListener("input", () => {
  inputPatente.value = inputPatente.value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
});

/* =========================
   CARGAR VEHÍCULOS
========================= */

async function cargarVehiculosUsuario() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/vehiculos/usuario/${usuario.id_usuario}`,
    );

    const vehiculos = await response.json();

    if (!response.ok) {
      renderizarEstadoVacío("No se pudieron cargar los vehículos.");

      return;
    }

    if (vehiculos.length === 0) {
      renderizarEstadoVacío("Aún no tienes vehículos registrados.");

      return;
    }

    listaVehiculos.innerHTML = vehiculos.map(formatearVehiculo).join("");
  } catch (error) {
    renderizarEstadoVacío("Error al conectar con el servidor.");
  }
}

/* =========================
   REGISTRAR VEHÍCULO
========================= */

vehiculoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  limpiarMensaje();

  const id_usuario = usuario.id_usuario;
  const id_modelo = selectModelo.value;
  const id_color = selectColor.value;

  const patente = inputPatente.value.trim().toUpperCase();

  if (!id_modelo || !id_color || !patente) {
    mostrarMensaje("Debes completar marca, modelo, color y patente.");

    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/vehiculos`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        id_usuario,
        id_modelo,
        id_color,
        patente,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(
        data.mensaje || "Vehículo registrado correctamente.",
        "ok",
      );
      mostrarToast("Vehículo registrado correctamente.", "success");

      vehiculoForm.reset();

      selectModelo.innerHTML =
        '<option value="">Primero selecciona una marca</option>';

      selectModelo.disabled = true;

      inputTipoVehiculo.value = "";

      cargarVehiculosUsuario();
    } else {
      const mensajeError = String(data.mensaje || "").toLowerCase();
      if (
        mensajeError.includes("patente") &&
        (mensajeError.includes("exist") ||
          mensajeError.includes("repet") ||
          mensajeError.includes("duplic"))
      ) {
        mostrarMensaje("La patente ya está registrada.");
        mostrarToast("La patente ya está registrada.", "error");
      } else {
        mostrarMensaje("No se pudo registrar el vehículo.");
        mostrarToast("No se pudo registrar el vehículo.", "error");
      }
    }
  } catch (error) {
    mostrarMensaje("No se pudo registrar el vehículo.");
    mostrarToast("No se pudo registrar el vehículo.", "error");
  }
});

/* =========================
   INICIO
========================= */

cargarMarcas();
cargarColores();
cargarVehiculosUsuario();
