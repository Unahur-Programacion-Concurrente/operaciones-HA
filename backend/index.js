require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// Conectar a MongoDB usando la variable de entorno
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Conectado a MongoDB");
}).catch((err) => {
    console.error("Error al conectar a MongoDB", err);
});

const GastoSchema = new mongoose.Schema({
    descripcion: String,
    cantidad: Number,
    categoria: String,
    fecha: String
});

const Gasto = mongoose.model('Gasto', GastoSchema);

// Middleware para parsear JSON
app.use(express.json());

// Habilitar CORS
app.use(cors());

// Ruta para ingresar gastos
app.post('/api/gastos', async (req, res) => {
    const gasto = new Gasto(req.body);
    await gasto.save();
    res.status(201).json(gasto);
});

// Ruta para obtener todos los gastos
app.get('/api/gastos', async (req, res) => {
    const gastos = await Gasto.find();
    res.json(gastos);
});

// Ruta para obtener el resumen de gastos por categoría
app.get('/api/resumen', async (req, res) => {
    const resumen = await Gasto.aggregate([
        {
            $group: {
                _id: "$categoria",
                total: { $sum: "$cantidad" },
                count: { $sum: 1 }
            }
        }
    ]);
    res.json(resumen);
});

app.listen(port, '0.0.0.0', () => {
    const host = process.env.NODE_ENV === 'production' ? `http://${process.env.SERVER_IP}:${port}` : `http://localhost:${port}`;
    console.log(`Backend escuchando en ${host}`);
});