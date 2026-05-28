const usuario = exigirCliente();

if (usuario) {
  document.getElementById("nombreUsuario").textContent =
    `${usuario.nombre} ${usuario.apellido}`;
}

const modalElement = document.getElementById("servicioModal");
const modalTitulo = document.getElementById("servicioModalLabel");
const modalImagen = document.getElementById("servicioModalImagen");
const modalDescripcion = document.getElementById("servicioModalDescripcion");
const modalPrecio = document.getElementById("servicioModalPrecio");
const modalDuracion = document.getElementById("servicioModalDuracion");
const modalAccion = document.getElementById("servicioModalAction");

const imagenesServicios = [
  "../images/fondos/audi.jpg",
  "../images/fondos/audi-2.jpg",
  "../images/fondos/audi-3.jpg",
  "../images/fondos/ferrari.jpg",
  "../images/fondos/ferrari-2.jpg",
  "../images/fondos/ferrari-3.jpg",
  "../images/fondos/ferrari-4.jpg",
  "../images/fondos/fondo-1.jpg",
  "../images/fondos/fondo-2.jpg",
  "../images/fondos/fondo-3.jpg",
];

function formatearPrecio(valor) {
  return Number(valor).toLocaleString("es-CL");
}

function resolverImagenServicio(servicio) {
  const nombre = (servicio.nombre_servicio || "").toLowerCase();

  if (nombre.includes("premium")) {
    return "../images/fondos/ferrari-4.jpg";
  }

  return "../images/fondos/audi.jpg";
}

function obtenerAccionServicio() {
  return {
    texto: "Reservar servicio",
    href: "./reservas.html",
  };
}

function abrirModalServicio(servicio) {
  if (!modalElement) return;

  modalTitulo.textContent = servicio.nombre_servicio;
  modalImagen.src = servicio.imagenServicio || resolverImagenServicio(servicio);
  modalImagen.alt = servicio.nombre_servicio;
  modalDescripcion.textContent = servicio.descripcion || "Sin descripción";
  modalPrecio.textContent = `$${formatearPrecio(servicio.precio)}`;
  modalDuracion.textContent = servicio.duracion_minutos
    ? `${servicio.duracion_minutos} minutos`
    : "No informada";

  const accion = obtenerAccionServicio();
  modalAccion.textContent = accion.texto;
  modalAccion.href = accion.href;

  const bootstrapModal = bootstrap.Modal.getOrCreateInstance(modalElement);
  bootstrapModal.show();
}

function limpiarModalServicio() {
  if (!modalElement) return;

  modalTitulo.textContent = "Servicio";
  modalImagen.src = "";
  modalDescripcion.textContent = "";
  modalPrecio.textContent = "";
  modalDuracion.textContent = "";
  modalAccion.href = "./reservas.html";
  modalAccion.textContent = "Reservar servicio";
}

document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  cerrarSesion();
});

async function cargarServicios() {
  const contenedor = document.getElementById("catalogoServicios");

  try {
    const response = await fetch(`${API_BASE_URL}/servicios/activos`);
    const servicios = await response.json();

    if (!response.ok) {
      contenedor.innerHTML =
        '<p class="sin-datos">No se pudieron cargar los servicios.</p>';
      return;
    }

    if (servicios.length === 0) {
      contenedor.innerHTML =
        '<p class="sin-datos">No hay servicios disponibles.</p>';
      return;
    }

    contenedor.innerHTML = "";

    servicios.forEach((servicio, index) => {
      const imagenServicio =
        imagenesServicios[index % imagenesServicios.length];
      const servicioRender = {
        ...servicio,
        imagenServicio,
      };

      const card = document.createElement("div");
      card.className = "col-md-6 col-xl-4 mb-4";

      card.innerHTML = `
        <article class="service-card is-clickable h-100" role="button" tabindex="0" data-servicio='${encodeURIComponent(JSON.stringify(servicioRender))}' data-service-image="${imagenServicio}">
          <div class="service-card-img">
            <img class="service-card-image" src="${imagenServicio}" alt="${servicio.nombre_servicio}" loading="lazy" />
          </div>
          <div class="service-card-body">
            <h3 class="service-card-title">${servicio.nombre_servicio}</h3>
            <p class="service-card-text">${servicio.descripcion || "Sin descripción"}</p>
            <div class="service-card-meta">
              <div class="d-flex justify-content-between align-items-center">
                <span class="aqua-subtext"><i class="bi bi-clock"></i> ${servicio.duracion_minutos ? `${servicio.duracion_minutos} min` : "Duración no informada"}</span>
                <span class="service-price">$${formatearPrecio(servicio.precio)}</span>
              </div>
            </div>
            <div class="service-card-footer mt-3">
              <span class="btn-aqua-secondary w-100 justify-content-center">
                <i class="bi bi-eye"></i> Ver detalles
              </span>
            </div>
          </div>
        </article>
      `;

      contenedor.appendChild(card);
    });
  } catch (error) {
    contenedor.innerHTML =
      '<p class="sin-datos">Error al conectar con el servidor.</p>';
  }
}

cargarServicios();

if (modalElement) {
  modalElement.addEventListener("hidden.bs.modal", limpiarModalServicio);
}

document.getElementById("catalogoServicios").addEventListener("click", (e) => {
  const card = e.target.closest("[data-servicio]");
  if (!card) return;

  const servicio = JSON.parse(decodeURIComponent(card.dataset.servicio));
  servicio.imagenServicio =
    card.dataset.serviceImage || servicio.imagenServicio;
  abrirModalServicio(servicio);
});

document
  .getElementById("catalogoServicios")
  .addEventListener("keypress", (e) => {
    const card = e.target.closest("[data-servicio]");
    if (!card) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const servicio = JSON.parse(decodeURIComponent(card.dataset.servicio));
      servicio.imagenServicio =
        card.dataset.serviceImage || servicio.imagenServicio;
      abrirModalServicio(servicio);
    }
  });
