import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Función para realizar consultas
export async function RealizaConsultas(client, dbName) {
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

        return 'Las consultas se han realizado correctamente'

    } catch (err) {
        console.error('Error en las consultas:', err);
        throw err;
    }
}

// Función para descargar las imágenes de los productos
export async function DescargaImagenesProductos(__dirname) {
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
      return 'Las imágenes se han descargado correctamente'
  } catch (err) {
      console.error('Error en la descarga de imágenes:', err.message);
      throw err;
  }
}