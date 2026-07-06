const LOCAL_API_BASE_URL = "http://localhost:3000/api";
const PRODUCCION_API_BASE_URL = "https://aquacar-backen.onrender.com/api";
const ES_LOCAL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = ES_LOCAL ? LOCAL_API_BASE_URL : PRODUCCION_API_BASE_URL;
