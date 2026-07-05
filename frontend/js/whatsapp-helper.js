function normalizarTelefonoChile(telefono) {
  if (!telefono) return null;

  let limpio = String(telefono).replace(/\D/g, "");

  if (limpio.startsWith("56") && limpio.length === 11) return limpio;
  if (limpio.startsWith("9") && limpio.length === 9) return `56${limpio}`;
  if (limpio.length === 8) return `569${limpio}`;

  return null;
}

function abrirWhatsApp(numero, mensaje) {
  const telefono = normalizarTelefonoChile(numero);

  if (!telefono) {
    alert("Número de WhatsApp inválido.");
    return;
  }

  const texto = encodeURIComponent(mensaje);
  window.open(`https://wa.me/${telefono}?text=${texto}`, "_blank");
}