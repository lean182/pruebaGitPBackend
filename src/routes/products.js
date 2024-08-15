import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Obtener productos con filtros, paginación y ordenamiento
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort = 'price', query = '' } = req.query;
    const filters = query ? { $text: { $search: query } } : {};

    const productos = await Product.find(filters)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filters);
    const hasPrevPage = page > 1;
    const hasNextPage = (page * limit) < total;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    res.json({
      productos,
      total,
      limit: Number(limit),
      page: Number(page),
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const nuevoProducto = new Product(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar producto por ID
router.put('/:id', async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar producto por ID
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Product.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
