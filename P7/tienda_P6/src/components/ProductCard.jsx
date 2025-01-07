import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="card w-64 bg-white shadow-lg rounded-lg overflow-hidden">
      <figure>
        <img
          src={product.image}
          alt={product.title}
          className="img-config"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-center">{product.title}</h2>
        <p className="text-sm text-gray-600 text-center overflow-hidden max-h-16 line-clamp-3">{product.description}</p>

        <div className="flex flex-col items-center mt-auto">
          <p className="text-lg font-bold text-gray-800 mb-2">${product.price}</p>
          <Link to={`/react/product/${product.id}`} className="btn btn-primary">
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;