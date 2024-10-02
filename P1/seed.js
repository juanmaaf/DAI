import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏁 seed.js ----------------->');

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Nombre de la base de datos
const dbName = 'myProject';

// Función para insertar datos
async function Inserta_datos_en_colección(colección, url) {
    try {
        const datos = await fetch(url).then(res => res.json());
        //console.log(datos);

        const database = client.db(dbName);
        const colect = database.collection(colección);

        // Vamos a realizar la inserción si no existe la colección en la Base de Datos.
        // Si los insertase en cada ejecución, las consultas serían infinitas.
        const coleccionesExistentes = await database.listCollections({ name: colección }).toArray();

        if (coleccionesExistentes.length > 0) {
            return `La colección "${colección}" ya existe. No se insertaron datos.`;
        }

        const options = { ordered: true };

        const result = await colect.insertMany(datos, options);
        console.log(`${result.insertedCount} documentos fueron insertados`);

        return `${datos.length} datos traidos para ${colección}`;
    } catch (err) {
        err.errorResponse += ` en fetch ${colección}`;
        throw err;
    }
}

// Función para realizar consultas
async function RealizaConsultas() {
    try {
        const database = client.db(dbName);
        const productosCollection = database.collection('productos');
        const usuariosCollection = database.collection('usuarios');

        // 1. Productos de más de 100 $
        const productosCaros = await productosCollection.find({ price: { $gt: 100 } }).toArray();
        console.log('Productos de más de 100 $:', productosCaros);

        // 2. Productos que contengan 'winter' en la descripción, ordenados por precio
        const productosWinter = await productosCollection.find({ description: /winter/i }).sort({ price: 1 }).toArray();
        console.log('Productos que contengan "winter" en la descripción, ordenados por precio:', productosWinter);

        // 3. Productos de joyería ordenados por rating
        const productosJoyeria = await productosCollection.find({ category: 'jewelery' }).sort({ 'rating.rate': -1 }).toArray();
        console.log('Productos de joyería ordenados por rating:', productosJoyeria);

        // 4. Reseñas totales (count en rating)
        const reseñasTotales = await productosCollection.aggregate([
            { $group: { _id: null, totalReseñas: { $sum: '$rating.count' } } }
        ]).toArray();
        console.log('Reseñas totales:', reseñasTotales[0].totalReseñas);

        // 5. Puntuación media por categoría de producto
        const puntuacionMediaPorCategoria = await productosCollection.aggregate([
            { $group: { _id: '$category', puntuacionMedia: { $avg: '$rating.rate' } } }
        ]).toArray();
        console.log('Puntuación media por categoría:', puntuacionMediaPorCategoria);

        // 6. Usuarios sin dígitos en el password
        const usuariosSinDigitos = await usuariosCollection.find({ password: { $not: /\d/ } }).toArray();
        console.log('Usuarios sin dígitos en el password:', usuariosSinDigitos);

    } catch (err) {
        console.error('Error en las consultas:', err);
        throw err;
    }
}

// Función para descargar las imágenes de los productos
async function DescargaImagenesProductos() {
  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir);
  }
  try {
      const datos = await fetch('https://fakestoreapi.com/products').then(res => res.json());
      await Promise.all(datos.map(async (producto) => {
          const imageUrl = producto.image; // Ensure this is the correct property
          const imageResponse = await fetch(imageUrl);
          const arrayBuffer = await imageResponse.arrayBuffer(); // Use arrayBuffer instead of buffer
          const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer
          const imageName = path.basename(imageUrl); // Extract image name from URL
          fs.writeFileSync(path.join(imagesDir, imageName), buffer); // Save image in folder
      }));
  } catch (err) {
      console.error('Error en la descarga de imágenes:', err.message);
      throw err;
  } finally{
    client.close()
  }
}

// Inserción consecutiva y luego consultas y descargas
Inserta_datos_en_colección('productos', 'https://fakestoreapi.com/products')
    .then((r) => console.log(`Todo bien: ${r}`))
    .then(() => Inserta_datos_en_colección('usuarios', 'https://fakestoreapi.com/users'))
    .then((r) => console.log(`Todo bien: ${r}`))
    .then(() => RealizaConsultas())  // Ejecuta las consultas después de la inserción
    .then((r) => console.log(`Todo bien: ${r}`))
    .then(() => DescargaImagenesProductos())
    .catch((err) => console.error('Algo mal: ', err.errorResponse));

console.log('Lo primero que pasa');
