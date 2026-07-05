/*
  Configuración central de la API AquaCar.

  Local:
    http://localhost:3000/api

  Producción Railway:
    1) Despliega primero el backend.
    2) Copia el dominio público que Railway entrega al backend.
    3) Reemplaza la URL de PRODUCCION_API_BASE_URL por:
       https://TU-BACKEND.up.railway.app/api
*/

const LOCAL_API_BASE_URL = "http://localhost:3000/api";
const PRODUCCION_API_BASE_URL = "https://TU-BACKEND.up.railway.app/api";

const ES_LOCAL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = ES_LOCAL ? LOCAL_API_BASE_URL : PRODUCCION_API_BASE_URL;
