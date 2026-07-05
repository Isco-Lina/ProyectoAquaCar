function escaparHtml(text) {
  if (!text) return "";

  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function crearElementoSeguro(tagName, text = "", attributes = {}) {
  const elemento = document.createElement(tagName);

  if (text) {
    elemento.textContent = text;
  }

  Object.keys(attributes).forEach((key) => {
    if (key === "class") {
      elemento.className = attributes[key];
    } else if (key !== "innerHTML" && key !== "html") {
      elemento.setAttribute(key, attributes[key]);
    }
  });

  return elemento;
}
