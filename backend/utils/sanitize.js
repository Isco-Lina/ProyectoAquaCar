function escaparHtml(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  const mapa = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (char) => mapa[char]);
}

function escaparSqlLike(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text.replace(/[%_\\]/g, "\\$&");
}

module.exports = {
  escaparHtml,
  escaparSqlLike,
};
