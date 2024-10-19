import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();

function obtenerCarrito(req) {
  return req.session.carrito || [];
}

router.get('/', async (req, res) => {
  try {
    // Definir categorías disponibles (estáticas por ahora)
    const categorias = [
      { name: "men's clothing", imageUrl: "/images/ropa_hombre.jpg" },
      { name: "women's clothing", imageUrl: "/images/ropa_mujer.jpg" },
      { name: "electronics", imageUrl: "/images/electronica.jpg" },
      { name: "jewelery", imageUrl: "/images/joyas.jpg" }
    ];
    // Obtener el carrito desde la sesión
    const carrito = obtenerCarrito(req);

    // Renderizar la vista de la portada con las categorías y el carrito
    res.render('home.html', { categorias, carrito });

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
    
    // Obtener el carrito desde la sesión
    const carrito = obtenerCarrito(req);

    // Renderizar la vista para la categoría con los productos
    res.render('categoria.html', { categoria, productos, carrito });
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

    // Obtener el carrito desde la sesión
    const carrito = obtenerCarrito(req);

    res.render('producto.html', { producto, carrito });
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Ruta POST para la búsqueda
router.post('/buscar', async (req, res) => {
  try {
    // Capturamos el término de búsqueda enviado por el formulario
    const query = req.body.q || ''; // req.body.q accede al valor enviado en el formulario

    // Usamos un $regex para realizar una búsqueda parcial en el título o descripción del producto
    const productos = await Productos.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },  // Búsqueda en el título (insensible a mayúsculas/minúsculas)
        { description: { $regex: query, $options: 'i' } }  // Búsqueda en la descripción (insensible a mayúsculas/minúsculas)
      ]
    });

    // Obtener el carrito desde la sesión
    const carrito = obtenerCarrito(req);

    // Renderizamos la vista de resultados de búsqueda, pasando los productos y el término de búsqueda
    res.render('buscar.html', { productos, query, carrito });
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Ruta para agregar al carrito
router.post("/agregar-al-carrito", async (req, res) => {
  const productoId = req.body.productoId;

  // Verificamos si ya existe un carrito en la sesión, si no, lo creamos
  if (!req.session.carrito) {
    req.session.carrito = [];
  }

  // Buscar el producto por ID en la base de datos
  try {
    const producto = await Productos.findById(productoId);

    // Si el producto existe, lo añadimos al carrito
    if (producto) {
      req.session.carrito.push(producto);
      console.log(`Producto añadido al carrito: ${producto.title}`);
    }

    // Redirigir al usuario a la página del carrito
    res.redirect('/carrito');
  } catch (err) {
    console.error('Error añadiendo al carrito:', err);
    res.status(500).send('Error añadiendo al carrito');
  }
});

// Ruta para eliminar del carrito
router.post('/eliminar-del-carrito', (req, res) => {
  const productoId = req.body.productoId;

  // Si el carrito existe en la sesión, buscamos y eliminamos el producto por su ID
  if (req.session.carrito) {
    req.session.carrito = req.session.carrito.filter(producto => producto._id != productoId);
  }

  // Verificar si el carrito está vacío
  if (req.session.carrito.length === 0) {
    // Si el carrito está vacío, redirigimos al home
    return res.redirect('/');
  }

  // Si el carrito no está vacío, redirigimos al carrito
  res.redirect('/carrito');
});

// Ruta para ver el carrito
router.get("/carrito", (req, res) => {
  const carrito = req.session.carrito || [];  // Obtener el carrito de la sesión, si no hay, devolver un array vacío

  if (carrito.length === 0) {
    // Si el carrito está vacío, redirigimos al home
    return res.redirect('/');
  }

  // Calcular el total del carrito
  const total = carrito.reduce((sum, producto) => sum + producto.price, 0);

  res.render("carrito.html", { carrito, total });
});

export default router