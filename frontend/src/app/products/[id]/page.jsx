import ProductClient from './ProductClient';

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  return <ProductClient productId={id} />;
}

