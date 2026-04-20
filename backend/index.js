const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const usuarioRoutes = require('./routes/usuarioRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const servicioRoutes = require('./routes/servicioRoutes');
const reservaRoutes = require('./routes/reservaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Servidor AquaCar funcionando');
});

app.get('/test-db', (req, res) => {
  db.query('SELECT 1 AS test', (error, results) => {
    if (error) {
      return res.status(500).json({
        mensaje: 'Error al consultar la base de datos',
        error: error.message
      });
    }

    res.json({
      mensaje: 'Conexión a la base de datos exitosa',
      resultado: results
    });
  });
});

app.use('/api', usuarioRoutes);
app.use('/api', vehiculoRoutes);
app.use('/api', servicioRoutes);
app.use('/api', reservaRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
});