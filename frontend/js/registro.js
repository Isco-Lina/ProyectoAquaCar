const registroForm = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");
const telefonoInput = document.getElementById("telefono");

function mostrarMensaje(texto, esExito = false) {
  mensaje.style.color = esExito ? "#00ff88" : "#ff6b6b";
  mensaje.textContent = texto;
}

function normalizarTelefonoLocal(valor) {
  return String(valor || "")
    .replace(/\D/g, "")
    .slice(0, 8);
}

if (telefonoInput) {
  telefonoInput.addEventListener("input", () => {
    const normalizado = normalizarTelefonoLocal(telefonoInput.value);
    telefonoInput.value = normalizado;
  });
}

registroForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const telefono = normalizarTelefonoLocal(
    document.getElementById("telefono").value,
  );

  if (telefono.length !== 8) {
    mostrarMensaje("Ingresa un teléfono chileno válido.");
    mostrarToast("Ingresa un teléfono chileno válido.", "warning");
    return;
  }

  const telefonoFinal = `+569${telefono}`;

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        apellido,
        correo,
        contrasena,
        telefono: telefonoFinal,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      mostrarMensaje(data.mensaje || "Cuenta creada correctamente.", true);
      guardarToastPendiente("Cuenta creada correctamente.", "success");
      registroForm.reset();

      setTimeout(() => {
        window.location.href = "./login.html";
      }, 1000);
    } else {
      const mensajeError = String(data.mensaje || "").toLowerCase();
      if (
        mensajeError.includes("correo") &&
        (mensajeError.includes("registr") || mensajeError.includes("existe"))
      ) {
        mostrarMensaje("Este correo ya está registrado.");
        mostrarToast("Este correo ya está registrado.", "error");
      } else if (
        mensajeError.includes("telefono") ||
        mensajeError.includes("teléfono") ||
        mensajeError.includes("celular")
      ) {
        mostrarMensaje("Ingresa un teléfono chileno válido.");
        mostrarToast("Ingresa un teléfono chileno válido.", "warning");
      } else {
        mostrarMensaje("No se pudo crear la cuenta.");
        mostrarToast("No se pudo crear la cuenta.", "error");
      }
    }
  } catch (error) {
    mostrarMensaje("No se pudo crear la cuenta.");
    mostrarToast("No se pudo crear la cuenta.", "error");
  }
});
