(function () {
  const serviceData = {
    basico: {
      title: "Lavado Básico",
      description:
        "Limpieza exterior rápida y efectiva. Ideal para mantenimiento diario.",
      price: "$12.000",
      duration: "30 min",
      image: "./images/fondos/audi.jpg",
      icon: "bi-water",
    },
    full: {
      title: "Lavado Full",
      description:
        "Limpieza exterior e interior completa con detalle superior.",
      price: "$15.000",
      duration: "60 min",
      image: "./images/fondos/ferrari.jpg",
      icon: "bi-stars",
    },
    premium: {
      title: "Lavado Premium + Encerado",
      description:
        "Servicio completo con protección de cera para máximo brillo.",
      price: "$17.000",
      duration: "90 min",
      image: "./images/fondos/ferrari-4.jpg",
      icon: "bi-gem",
    },
  };

  function initServiceModal() {
    const modalElement = document.getElementById("servicioModal");
    if (!modalElement || typeof bootstrap === "undefined") {
      return;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    const titleElement = document.getElementById("servicioModalLabel");
    const imageElement = document.getElementById("servicioModalImagen");
    const iconElement = document.getElementById("servicioModalIcon");
    const priceElement = document.getElementById("servicioModalPrecio");
    const durationElement = document.getElementById("servicioModalDuracion");
    const descriptionElement = document.getElementById(
      "servicioModalDescripcion",
    );

    document.querySelectorAll(".service-card.is-clickable").forEach((card) => {
      const openModal = () => {
        const key = card.dataset.serviceKey;
        const service = serviceData[key];

        if (!service) {
          return;
        }

        if (titleElement) {
          titleElement.textContent = service.title;
        }

        if (imageElement) {
          imageElement.src = service.image;
          imageElement.alt = service.title;
        }

        if (iconElement) {
          iconElement.className = "vehicle-icon";
          iconElement.innerHTML = `<i class="bi ${service.icon}"></i>`;
        }

        if (priceElement) {
          priceElement.textContent = service.price;
        }

        if (durationElement) {
          durationElement.textContent = service.duration;
        }

        if (descriptionElement) {
          descriptionElement.textContent = service.description;
        }

        modal.show();
      };

      card.addEventListener("click", openModal);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openModal();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initServiceModal);
})();
