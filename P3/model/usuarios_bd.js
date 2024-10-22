import mongoose from "mongoose";
 
const UsuariosSchema = new mongoose.Schema({
  "id": {
    "type": "Number",
    "unique": true
  },
  "email": {
    "type": "String",
    "unique": true
  },
  "username": {
    "type": "String",
    "unique": true
  },
  "password": {
    "type": "String",
    "required": true
  },
  "name": {
    "firstname": {
      "type": "String",
      "required": true
    },
    "lastname": {
      "type": "String",
      "required": true
    }
  }
})

const Usuarios = mongoose.model("usuarios", UsuariosSchema);
export default Usuarios