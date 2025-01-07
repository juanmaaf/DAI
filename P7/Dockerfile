# Use an official Node.js image as the base image
FROM node:alpine

# Definir variables de entorno para la aplicación

ENV IN=production
ENV USER_DB=root
ENV PASS=example
ENV SECRET_KEY="EsTa MisMa:i8775tyjk,"
ENV DB_HOST=mongo
# En windows, MAC
# ENV DB_HOST=host.docker.internal
# En linux
#ENV DB_HOST=172.17.0.1 

# Set the working directory in the container
WORKDIR /app

# Copiar los archivos necesarios antes de instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código de la aplicación al contenedor
COPY . .

# Exponer el puerto en el que la aplicación escucha
EXPOSE 8000

# Comando para iniciar la aplicación
CMD ["node", "tienda.js"]