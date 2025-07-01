import ProductClient from './ProductClient';

export default function ProductDetailPage({ params }) {
  const { id } = params;

  return <ProductClient productId={id} />;
}
