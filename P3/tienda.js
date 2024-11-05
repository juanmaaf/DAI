import express   from "express"
import nunjucks  from "nunjucks"
import session from "express-session";
import connectDB from "./model/db.js"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
connectDB()

const app = express()

const IN = process.env.IN || 'development'

nunjucks.configure('views', {         // directorio 'views' para las plantillas html
	autoescape: true,
	noCache:    IN == 'development',   // true para desarrollo, sin cache
	watch:      IN == 'development',   // reinicio con Ctrl-S
	express: app
})
app.set('view engine', 'html')

app.use(express.static('public'))     // directorio public para archivos

app.use(express.urlencoded({ extended: true }));

app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))

app.use(cookieParser())

// middleware de
const autentificación = (req, res, next) => {
	const token = req.cookies.access_token;
	if (token) {
		const data = jwt.verify(token, process.env.SECRET_KEY);
		req.username = data.usuario  // username en el request
		req.admin = data.admin; // admin en el request
	}
	next()
}
app.use(autentificación)

// Las demas rutas con código en el directorio routes
import TiendaRouter from "./routes/router_tienda.js"
app.use("/", TiendaRouter);

import UsuariosRouter from "./routes/usuarios.js"
app.use("/", UsuariosRouter);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en  http://localhost:${PORT}`);
})