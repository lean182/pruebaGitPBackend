import mongoose from 'mongoose';
import express from 'express';
import path from 'path';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import Product from './models/Product.js';

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conectar a MongoDB
const uri = "mongodb+srv://gozalvezleandro:F4C0hv3aQHjk3FJi@clusterpfb1.72tjnzc.mongodb.net/?retryWrites=true&w=majority&appName=ClusterPFB1";

mongoose.connect(uri, {
  dbName: 'ProyectoFinal',
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch(error => console.error('Error al conectar a MongoDB:', error));

// Ruta Home
app.get('/', async (req, res) => {
  try {
    const productos = await Product.find();
    res.render('home', { productos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos');
  }
});

// Ruta Real time
app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { title: 'Cargar Productos' });
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Configurar Socket.io
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Leer productos de MongoDB y emitir al nuevo cliente
  socket.on('requestProducts', async () => {
    try {
      const productos = await Product.find();
      socket.emit('actualizarProductos', productos);
    } catch (err) {
      console.error(err);
    }
  });

  // Manejar nuevos productos
  socket.on('nuevoProducto', async (producto) => {
    try {
      await Product.create(producto);
      const productos = await Product.find();
      io.emit('actualizarProductos', productos);
    } catch (err) {
      console.error(err);
    }
  });

  // Manejar eliminación de productos
  socket.on('eliminarProducto', async (productoCode) => {
    try {
      await Product.deleteOne({ code: productoCode });
      const productos = await Product.find();
      io.emit('actualizarProductos', productos);
    } catch (err) {
      console.error(err);
    }
  });
});
