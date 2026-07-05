document.addEventListener("DOMContentLoaded", () => {
  // Proteger página - solo clientes
  const usuario = exigirCliente();
  if (!usuario) throw new Error("Acceso no autorizado");

  cargarUsuario();
  cargarServiciosActivos();
  configurarCerrarSesion();
});

function cargarUsuario() {
  const usuario = exigirCliente();
  const nombreUsuario = document.getElementById("nombreUsuario");

  if (!usuario) return;

  nombreUsuario.textContent = `${usuario.nombre} ${usuario.apellido}`;
}

const BASE_BACKEND_URL = API_BASE_URL.replace(/\/api$/, "");

function configurarCerrarSesion() {
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");

  if (!btnCerrarSesion) return;

  btnCerrarSesion.addEventListener("click", () => {
    cerrarSesion();
  });
}

async function cargarServiciosActivos() {
  const contenedor = document.getElementById("catalogoServicios");

  try {
    const respuesta = await fetch(`${API_BASE_URL}/servicios/activos`);
    const servicios = await respuesta.json();

    contenedor.innerHTML = "";

    if (!servicios.length) {
      const p = document.createElement("p");
      p.className = "mensaje-vacio";
      p.textContent = "No hay servicios activos disponibles.";
      contenedor.appendChild(p);
      return;
    }

    const grupos = agruparServicios(servicios);

    grupos
      .filter((grupo) => grupo.servicios.length > 0)
      .forEach((grupo) => {
        const bloque = crearBloqueCatalogo(grupo);
        contenedor.appendChild(bloque);
      });
  } catch (error) {
    contenedor.innerHTML = "";
    const p = document.createElement("p");
    p.className = "mensaje-vacio";
    p.textContent = "Error al cargar servicios.";
    contenedor.appendChild(p);
  }
}

function agruparServicios(servicios) {
  const gruposBase = [
    { titulo: "Sedán / City Car", clave: "sedan", servicios: [] },
    { titulo: "SUV / Camioneta", clave: "suv", servicios: [] },
    { titulo: "Servicios exclusivos", clave: "extra", servicios: [] },
    { titulo: "Promociones y otros servicios", clave: "otros", servicios: [] },
  ];

  servicios.forEach((servicio) => {
    const categoria = obtenerCategoriaServicio(servicio);
    const grupo =
      gruposBase.find((item) => item.clave === categoria) || gruposBase[3];

    grupo.servicios.push(servicio);
  });

  gruposBase.forEach((grupo) => {
    grupo.servicios.sort((a, b) => {
      return (
        obtenerOrdenServicio(a.nombre_servicio) -
        obtenerOrdenServicio(b.nombre_servicio)
      );
    });
  });

  return gruposBase;
}

function crearBloqueCatalogo(grupo) {
  const div = document.createElement("div");
  div.className = "catalogo-bloque";

  const h3 = document.createElement("h3");
  h3.textContent = grupo.titulo;
  div.appendChild(h3);

  const gallery = document.createElement("div");
  gallery.className = "hover-gallery";

  grupo.servicios.forEach((servicio) => {
    const panelArticle = crearPanelServicio(servicio);
    gallery.appendChild(panelArticle);
  });

  div.appendChild(gallery);
  return div;
}

function crearPanelServicio(servicio) {
  const imagen = resolverUrlImagen(
    servicio.imagen_url,
    servicio.nombre_servicio,
  );

  const article = document.createElement("article");
  article.className = "panel-servicio";
  article.style.backgroundImage = `url('${imagen}')`;

  const content = document.createElement("div");
  content.className = "panel-content";

  const h4 = document.createElement("h4");
  h4.textContent = servicio.nombre_servicio;
  content.appendChild(h4);

  const p = document.createElement("p");
  p.textContent = servicio.descripcion;
  content.appendChild(p);

  const strong = document.createElement("strong");
  strong.textContent = formatearPrecio(servicio.precio);
  content.appendChild(strong);

  const small = document.createElement("small");
  small.textContent = formatearDuracion(servicio.duracion_minutos);
  content.appendChild(small);

  const a = document.createElement("a");
  a.href = `./reservas.html?id_servicio=${servicio.id_servicio}`;
  a.textContent = "Reservar";
  content.appendChild(a);

  article.appendChild(content);
  return article;
}

function resolverUrlImagen(imagenUrl, nombreServicio = "") {
  if (!imagenUrl) {
    return obtenerImagenPorNombre(nombreServicio);
  }

  if (imagenUrl.startsWith("http")) {
    return imagenUrl;
  }

  if (imagenUrl.startsWith("/uploads")) {
    return `${BASE_BACKEND_URL}${imagenUrl}`;
  }

  return imagenUrl;
}

function obtenerCategoriaServicio(servicio) {
  if (servicio.categoria) return servicio.categoria;

  const nombre = normalizarTexto(servicio.nombre_servicio);

  if (nombre.includes("suv") || nombre.includes("camioneta")) return "suv";

  if (
    nombre.includes("foco") ||
    nombre.includes("motor") ||
    nombre.includes("moto")
  ) {
    return "extra";
  }

  if (
    nombre.includes("basico") ||
    nombre.includes("full") ||
    nombre.includes("encerado")
  ) {
    return "sedan";
  }

  return "otros";
}

function obtenerOrdenServicio(nombreServicio) {
  const nombre = normalizarTexto(nombreServicio);

  if (nombre.includes("basico")) return 1;
  if (nombre.includes("full") && !nombre.includes("encerado")) return 2;
  if (nombre.includes("encerado")) return 3;

  if (nombre.includes("foco")) return 1;
  if (nombre.includes("motor")) return 2;
  if (nombre.includes("moto")) return 3;

  return 99;
}

function obtenerImagenPorNombre(nombreServicio) {
  const nombre = normalizarTexto(nombreServicio);

  if (nombre.includes("suv") || nombre.includes("camioneta")) {
    if (nombre.includes("encerado")) {
      return "../images/catalogo/encerado-suv-camioneta.png";
    }

    if (nombre.includes("full")) {
      return "../images/catalogo/full-suv-camioneta.png";
    }

    return "../images/catalogo/basico-suv-camioneta.png";
  }

  if (nombre.includes("foco")) return "../images/catalogo/pulido-focos.png";
  if (nombre.includes("motor")) return "../images/catalogo/lavado-motor.png";
  if (nombre.includes("moto")) return "../images/catalogo/lavado-moto.png";

  if (nombre.includes("encerado"))
    return "../images/catalogo/lavado-encerado.png";

  if (nombre.includes("full")) return "../images/catalogo/lavado-full.png";

  return "../images/catalogo/lavado-basico.png";
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatearPrecio(precio) {
  if (Number(precio) === 0) return "Consultar";

  return Number(precio).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

function formatearDuracion(minutos) {
  const duracion = Number(minutos);

  if (!duracion) return "Según servicio";
  if (duracion <= 45) return "30 - 45 min";
  if (duracion <= 60) return "60 min";
  if (duracion <= 90) return "60 - 90 min";

  return "90 - 120 min";
}
