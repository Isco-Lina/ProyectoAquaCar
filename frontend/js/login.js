const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const contrasena = document.getElementById("contrasena").value;

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasena }),
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.style.color = "#00ff88";
      mensaje.textContent = data.mensaje;

      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      setTimeout(() => {
        if (data.usuario.rol === "admin") {
          window.location.href = "./admin.html";
        } else {
          window.location.href = "./panel.html";
        }
      }, 800);
    } else {
      mensaje.style.color = "#ff6b6b";
      mensaje.textContent = data.mensaje || "Credenciales incorrectas";
    }
  } catch (error) {
    mensaje.style.color = "#ff6b6b";
    mensaje.textContent = "Error al conectar con el servidor";
  }
});
