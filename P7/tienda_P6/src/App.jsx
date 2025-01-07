import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';

const App = () => {
  return (
    <Router>
      <div className="flex flex-row min-h-screen">
        <div className="flex-grow">
          <Routes>
            <Route path="/react/" element={<Home />} />
            <Route path="/react/product/:id" element={<ProductDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;