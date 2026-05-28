const serviciosHome = {
  basico: {
    nombre: "Lavado Básico",
    descripcion:
      "Limpieza exterior rápida y efectiva. Ideal para mantenimiento diario y para mantener tu vehículo impecable con una atención premium.",
    precio: 12000,
    duracion: "25 minutos",
    imagen: "./images/fondos/audi.jpg",
    icono: "bi-water",
    accion: "Comenzar ahora",
  },
  full: {
    nombre: "Lavado Full",
    descripcion:
      "Limpieza exterior e interior completa con detalle superior, ideal para quienes buscan una presentación más cuidada.",
    precio: 15000,
    duracion: "40 minutos",
    imagen: "./images/fondos/ferrari.jpg",
    icono: "bi-sparkles",
    accion: "Reservar ahora",
  },
  premium: {
    nombre: "Lavado Premium + Encerado",
    descripcion:
      "Servicio completo con protección de cera para lograr máximo brillo, mejor acabado y una experiencia de alto nivel.",
    precio: 17000,
    duracion: "60 minutos",
    imagen: "./images/fondos/ferrari-4.jpg",
    icono: "bi-gem",
    accion: "Reservar premium",
  },
};

const modalElement = document.getElementById("servicioModal");
const modalTitle = document.getElementById("servicioModalLabel");
const modalImage = document.getElementById("servicioModalImagen");
const modalDescription = document.getElementById("servicioModalDescripcion");
const modalPrice = document.getElementById("servicioModalPrecio");
const modalDuration = document.getElementById("servicioModalDuracion");
const modalAction = document.getElementById("servicioModalAction");
const modalIcon = document.getElementById("servicioModalIcon");

function formatearPrecio(valor) {
  return Number(valor).toLocaleString("es-CL");
}

function obtenerRutaAccion() {
  const usuarioGuardado = localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    return {
      texto: "Iniciar sesión",
      href: "./pages/login.html",
    };
  }

  try {
    const usuario = JSON.parse(usuarioGuardado);
    if (usuario?.rol === "admin") {
      return {
        texto: "Ir al panel",
        href: "./pages/admin.html",
      };
    }
  } catch (error) {
    // Si el almacenamiento está corrupto, se muestra el flujo de acceso.
  }

  return {
    texto: "Reservar servicio",
    href: "./pages/reservas.html",
  };
}

function abrirModalServicio(claveServicio, tarjeta) {
  const servicio = serviciosHome[claveServicio];
  if (!servicio || !modalElement) return;

  modalTitle.textContent = servicio.nombre;
  modalImage.src = tarjeta?.dataset.serviceImage || servicio.imagen;
  modalImage.alt = servicio.nombre;
  modalDescription.textContent = servicio.descripcion;
  modalPrice.textContent = `$${formatearPrecio(servicio.precio)}`;
  modalDuration.textContent = servicio.duracion || "No informada";
  modalIcon.innerHTML = `<i class="bi ${servicio.icono}"></i>`;

  const accion = obtenerRutaAccion();
  modalAction.textContent = accion.texto;
  modalAction.href = accion.href;

  const bootstrapModal = bootstrap.Modal.getOrCreateInstance(modalElement);
  bootstrapModal.show();
}

function inicializarCardsServicios() {
  document.querySelectorAll("[data-service-key]").forEach((card) => {
    card.addEventListener("click", () => {
      abrirModalServicio(card.dataset.serviceKey, card);
    });

    card.addEventListener("keypress", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        abrirModalServicio(card.dataset.serviceKey, card);
      }
    });
  });
}

if (modalElement) {
  modalElement.addEventListener("hidden.bs.modal", () => {
    modalImage.src = "";
    modalTitle.textContent = "";
    modalDescription.textContent = "";
    modalPrice.textContent = "";
    modalDuration.textContent = "";
  });
}

inicializarCardsServicios();
