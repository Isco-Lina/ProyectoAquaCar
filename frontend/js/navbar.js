document.addEventListener("DOMContentLoaded", () => {
  const boton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  const links = document.querySelectorAll(".navbar nav a");

  if (boton && menu) {
    boton.addEventListener("click", () => {
      boton.classList.toggle("activo");
      menu.classList.toggle("activo");
    });
  }

  const paginaActual = window.location.pathname.split("/").pop();

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href) return;

    if (href.startsWith("#")) {
      link.addEventListener("click", () => {
        links.forEach((item) => item.classList.remove("activo"));
        link.classList.add("activo");

        if (menu) menu.classList.remove("activo");
        if (boton) boton.classList.remove("activo");
      });

      return;
    }

    const paginaLink = href.split("/").pop();

    link.classList.remove("activo");

    if (paginaActual === paginaLink) {
      link.classList.add("activo");
    }
  });
});
