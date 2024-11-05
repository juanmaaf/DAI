import express from "express";
import jwt from "jsonwebtoken"
import Usuarios from "../model/usuarios_bd.js";
import bcrypt from 'bcrypt';

const router = express.Router();

function obtenerCarrito(req) {
    return req.session.carrito || [];
}

// Para mostrar formulario de login
router.get('/login', (req, res)=>{
    // Obtener el carrito desde la sesión
    const carrito = obtenerCarrito(req);

    // Obtener el user
    const usuario = req.username || null;

    res.render("login.html", {carrito, usuario})
})

// Para recoger datos del formulario de login 
router.post('/login', async (req, res)=> {
    try {
        const { username, password } = req.body;

        const user = await Usuarios.findOne({ username: username });

        // Obtener el carrito desde la sesión
        const carrito = obtenerCarrito(req);

        if (!user) {
            return res.status(401).render("login.html", { error: "Usuario no encontrado" });
        }
    
        // // Comprobar si el password es correcto (sin encriptar)
        // if (password !== user.password) {
        //     return res.status(401).render("login.html", { error: "Contraseña incorrecta" });
        // }

        // Comprobar si la contraseña es correcta
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).render("login.html", { error: "Contraseña incorrecta" });
        }
    
        const token = jwt.sign({usuario: user.username}, process.env.SECRET_KEY)

        res.cookie("access_token", token, {            // cookie en el response
        httpOnly: true,
        secure: process.env.IN === 'production'      // en producción, solo con https
        }).render("bienvenida.html", {usuario: user.username, carrito})
        
    } catch (err) {
        console.error('Error en el login:', err);
        res.status(500).send('Error del servidor');
    }
})

router.get('/logout', (req, res) => {
    // Obtener el user
    const usuario = req.username || null;
    
    // Obtener el carrito desde la sesión
    const carrito = obtenerCarrito(req);

    // Limpiar cookie y redirigir a página de despedida
    res.clearCookie('access_token').render('despedida.html', { usuario, carrito });
});

export default router