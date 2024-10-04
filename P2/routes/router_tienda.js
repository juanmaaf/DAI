import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();
      
// router.get('/', async (req, res)=>{
//   try {
//     const productos = await Productos.find({})   // todos los productos
//     res.render('home.html', { productos })    // ../views/portada.html, 
//   } catch (err) {                                // se le pasa { productos:productos }
//     res.status(500).send({err})
//   }
// })

// Ruta para la búsqueda de productos
// router.get('/buscar', async (req, res) => {
//   const searchQuery = req.query.q;  // Obtener el término de búsqueda de la query string
  
//   try {
//     let productos;
    
//     if (searchQuery) {
//       // Filtrar productos que coincidan con el término de búsqueda usando una expresión regular
//       productos = await Productos.find({ name: { $regex: searchQuery, $options: "i" } });
//     } else {
//       productos = await Productos.find({});
//     }

//     // Renderizar la vista con los resultados
//     res.render('home.html', { productos });
//   } catch (err) {
//     res.status(500).send({ err });
//   }
// });

router.get('/', async (req, res) => {
  try {
    // Definir categorías disponibles (estáticas por ahora)
    const categorias = [
      { name: "men's clothing", imageUrl: "/images/ropa_hombre.jpg" },
      { name: "women's clothing", imageUrl: "/images/ropa_mujer.jpg" },
      { name: "electronics", imageUrl: "/images/electronica.jpg" },
      { name: "jewelery", imageUrl: "/images/joyas.jpg" }
    ];

    // Renderizar la vista de la portada con las categorías
    res.render('home.html', { categorias });
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Nueva ruta para mostrar productos por categoría
router.get('/categoria/:categoria', async (req, res) => {
  try {
    const categoria = req.params.categoria;
    
    // Obtener productos de la categoría solicitada
    const productos = await Productos.find({ category: categoria });
    
    // Renderizar la vista para la categoría con los productos
    res.render('categoria.html', { categoria, productos });
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Nueva ruta para mostrar un producto específico
router.get('/producto/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const producto = await Productos.findById(id); // Encuentra el producto por su ID
    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('producto.html', { producto });
  } catch (err) {
    res.status(500).send({ err });
  }
});

router.get('/buscar', async (req, res) => {
  try {
    // Capturamos el término de búsqueda enviado por el formulario
    const query = req.query.q || ''; // req.query.q accede al valor de búsqueda en la URL

    // Usamos un $regex para realizar una búsqueda parcial en el título del producto
    const productos = await Productos.find({ 
      title: { $regex: query, $options: 'i' } // Búsqueda insensible a mayúsculas y minúsculas en el título
    });

    // Renderizamos la vista de resultados de búsqueda, pasando los productos y el término de búsqueda
    res.render('buscar.html', { productos, query });
  } catch (err) {
    res.status(500).send({ err });
  }
});

export default router