const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/expense-tracker');

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

app.listen(port, () => {
    console.log(`Backend escuchando en http://localhost:${port}`);
});
