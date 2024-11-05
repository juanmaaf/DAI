import mongoose from "mongoose";
 
const ProductosSchema = new mongoose.Schema({
  "id": {
    "type": "Number",
    "unique": true
  },
  "title": {
    "type": "String",
    "unique": true,
    "validate": {
      "validator": function(v) {
        return /^[A-Z]/.test(v); // Verifica que el título comience con mayúscula
      },
      "message": "El título debe comenzar con una letra mayúscula."
    },
    "required": true
  },
  "price": {
    "type": "Number",
    "required": true
  },
  "image": {
    "type": "String",
    "required": true
  },
  "category": {
    "type": "String",
    "required": true
  },
  "description": {
    "type": "String",
    "required": true
  },
  "rating": {
    "rate": {
      "type": "Number",
      "min": 0,
      "max": 5,
      "default": 0
    },
    "count": {
      "type": "Number",
      "default": 0
    }
  }
})

const Productos = mongoose.model("productos", ProductosSchema);
export default Productos