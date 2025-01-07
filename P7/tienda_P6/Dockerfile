# Usa una imagen oficial de Node.js como base
FROM node:alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos necesarios antes de instalar dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación al contenedor
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Exponemos el puerto en el que Vite servirá los archivos estáticos
EXPOSE 4173

# Comando para servir la aplicación construida
CMD ["npm", "run", "preview"]