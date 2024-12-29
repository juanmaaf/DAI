import { useFetch } from '../hooks/useFetch.js';
import ProductCard from '../components/ProductCard';

const Home = () => {
  // Llamada al endpoint de productos
  const { data: products, error, isLoading } = useFetch('https://fakestoreapi.com/products');

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error al cargar los productos</p>;

  return (
    <div className="container mx-auto flex flex-wrap gap-6 mt-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Home;