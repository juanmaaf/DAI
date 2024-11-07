import express from "express";
import Productos from "../model/productos.js";
import logger from '../utils/logger.js';
const router = express.Router();

// 1. GET /api/ratings - Lista de ratings de todos los productos
router.get('/', async (req, res) => {
    try {
        const { desde = 0, hasta = 10 } = req.query; // Paginación Nota
        const productos = await Productos.find({}, 'rating')
        .skip(parseInt(desde))
        .limit(parseInt(hasta) - parseInt(desde) + 1);

        res.json(productos);
    } catch (error) {
        logger.error("Error al obtener los ratings:", error);
        // console.error("Error al obtener los ratings:", error);
        res.status(500).json({ message: "Error al obtener los ratings" });
    }
});

// 2. GET /api/ratings/:id - Rating de un producto por su ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const producto = await Productos.findById(id, 'rating');
        if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

        res.json(producto.rating);
    } catch (error) {
        logger.error("Error al obtener el rating:", error);
        // console.error("Error al obtener el rating:", error);
        res.status(500).json({ message: "Error al obtener el rating" });
    }
});

// 3. POST /api/ratings/:id - Modificar el rating de un producto
router.post('/:id', async (req, res) => {
    const { id } = req.params;
    const { rate, count } = req.body;

    try {
        // Encuentra el producto y actualiza solo el rating con validaciones activadas
        const producto = await Productos.findByIdAndUpdate(
        id,
        { "rating.rate": rate, "rating.count": count },
        { new: true, runValidators: true, fields: { rating: 1 } }
        );

        if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

        res.json(producto.rating);
    } catch (error) {
        logger.error("Error al actualizar el rating:", error);
        // console.error("Error al actualizar el rating:", error);
        res.status(400).json({ message: "Error al actualizar el rating" });
    }
});

export default router;

