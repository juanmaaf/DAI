import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { RealizaConsultas } from './consultas_descarga.js';
import { DescargaImagenesProductos } from './consultas_descarga.js';


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

// Inserción consecutiva y luego consultas y descargas
Inserta_datos_en_colección('productos', 'https://fakestoreapi.com/products')
    .then((r) => console.log(`Todo bien: ${r}`))
    .then(() => Inserta_datos_en_colección('usuarios', 'https://fakestoreapi.com/users'))
    .then((r) => console.log(`Todo bien: ${r}`))
    .then(() => RealizaConsultas(client, dbName))  // Ejecuta las consultas después de la inserción
    .then((r) => console.log(`Todo bien: ${r}`))
    .then(() => DescargaImagenesProductos(__dirname))
    .then((r) => console.log(`Todo bien: ${r}`))
    .then(() => client.close() )
    .catch((err) => console.error('Algo mal: ', err.errorResponse));

console.log('Lo primero que pasa');
