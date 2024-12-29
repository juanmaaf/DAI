import { useFetch } from '../hooks/useFetch';
import ProductCard from './ProductCard';

const ProductList = () => {
  // Llama al endpoint con SWR
  const { data: products, error, isLoading } = useFetch('https://fakestoreapi.com/products');

  if (isLoading) return <p>Loading products...</p>;
  if (error) return <p>Error loading products: {error.message}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;