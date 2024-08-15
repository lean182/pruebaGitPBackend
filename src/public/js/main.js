document.addEventListener('DOMContentLoaded', () => {
   
   // Verifica que io esté disponible
   if (typeof io === 'undefined') {
      console.error('Socket.io client library no cargada.');
      return;
   }

   const socket = io();

   const productosList = document.getElementById('productosList');
   const productoForm = document.getElementById('productoForm');

   // Función para agregar un producto al DOM
   const agregarProducto = (producto) => {
      const productoItem = document.createElement('div');
      productoItem.classList.add('product-card');
      productoItem.id = `product-${producto.code}`;
      productoItem.innerHTML = `
           <h2>${producto.title}</h2>
           <p>${producto.description}</p>
           <p>Código: ${producto.code}</p>
           <p>Precio: ${producto.price}</p>
           <p>Stock: ${producto.stock}</p>
           <p>Categoría: ${producto.category}</p>
           <p>Miniaturas: ${producto.thumbnails}</p>
           <button onclick="confirmarEliminacion('${producto.code}')">Eliminar</button>
       `;
      productosList.appendChild(productoItem);
   };

   // Escuchar eventos de actualización de productos
   socket.on('actualizarProductos', (productos) => {
      productosList.innerHTML = ''; // Limpiar la lista existente
      productos.forEach(agregarProducto);
   });

   // Enviar nuevo producto al servidor
   productoForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const newProduct = {
         title: productoForm.title.value,
         description: productoForm.description.value,
         code: productoForm.code.value,
         price: productoForm.price.value,
         stock: productoForm.stock.value,
         category: productoForm.category.value,
         thumbnails: productoForm.thumbnails.value,
      };
      socket.emit('nuevoProducto', newProduct);
      productoForm.reset(); // Limpiar el formulario
   });

   // Función para confirmar eliminación de productos
   window.confirmarEliminacion = (productoCode) => {
      if (confirm("¿Desea eliminar este producto?")) {
         socket.emit('eliminarProducto', productoCode);
      }
   };

   // Solicitar productos al conectar
   socket.emit('requestProducts');
});
