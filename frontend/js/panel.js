const usuario = exigirCliente();

if (usuario) {
  document.getElementById("nombreUsuario").textContent =
    `${usuario.nombre} ${usuario.apellido}`;
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

    servicios.forEach((servicio) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="card-imagen">
          <img src="../images/catalogo/servicio-base-2.png" alt="Servicio AquaCar" />
        </div>
        <h3>${servicio.nombre_servicio}</h3>
        <p>${servicio.descripcion || "Sin descripción"}</p>
        <div class="precio">$${servicio.precio}</div>
      `;

      contenedor.appendChild(card);
    });
  } catch (error) {
    contenedor.innerHTML =
      '<p class="sin-datos">Error al conectar con el servidor.</p>';
  }
}

cargarServicios();
