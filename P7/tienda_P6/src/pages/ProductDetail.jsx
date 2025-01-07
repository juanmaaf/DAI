import { useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';

const ProductDetail = () => {
  const { id } = useParams(); // Obtiene el ID del producto desde la URL
  const { data: product, error, isLoading } = useFetch(`https://fakestoreapi.com/products/${id}`);

  if (isLoading) return <p>Cargando detalles del producto...</p>;
  if (error) return <p>Error al cargar el producto: {error.message}</p>;

  return (
    <div className="flex flex-col items-center my-10">
      <div className="card w-96 bg-white shadow-xl p-6 flex flex-col items-center">
        <figure>
          <img
            src={product.image}
            alt={product.title}
            className="img-config-detalle mb-4"
          />
        </figure>

        <h2 className="card-title text-2xl font-bold text-center mb-4">{product.title}</h2>
        
        <p className="text-sm text-gray-600 text-center mb-4">
          {product.description}
        </p>

        <p className="text-lg font-bold text-gray-800 mb-4">${product.price}</p>

        <div className="card-actions justify-center">
          <button className="btn btn-primary">
            Añadir al Carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;