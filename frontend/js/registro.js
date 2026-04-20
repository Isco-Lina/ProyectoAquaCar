const registroForm = document.getElementById("registroForm");
const mensaje = document.getElementById("mensaje");

registroForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

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
        telefono,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.style.color = "#00ff88";
      mensaje.textContent = data.mensaje || "Usuario registrado correctamente";
      registroForm.reset();

      setTimeout(() => {
        window.location.href = "./login.html";
      }, 1000);
    } else {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = data.mensaje || "No se pudo registrar el usuario";
    }
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "Error al conectar con el servidor";
  }
});
