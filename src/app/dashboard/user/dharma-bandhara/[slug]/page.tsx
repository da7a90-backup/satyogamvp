import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DashboardProductDetailClient from './DashboardProductDetailClient';
import { productsApi } from '@/lib/store-api';

interface DashboardProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for the product
export async function generateMetadata(
  { params }: DashboardProductDetailPageProps
): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Fetch the product from FastAPI
    const product = await productsApi.getProduct(slug);

    // If no product is found, return a generic title
    if (!product) {
      return {
        title: 'Product Not Found - Sat Yoga',
      };
    }

    // Use product data for metadata
    return {
      title: `${product.title} - The Dharma Bandhara`,
      description: product.short_description || product.description || 'Shop spiritual teachings and resources from Sat Yoga',
      openGraph: {
        title: product.title,
        description: product.short_description || product.description || '',
        images: product.featured_image
          ? [
              {
                url: product.featured_image,
                alt: product.title,
              },
            ]
          : [],
      },
    };
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return {
      title: 'The Dharma Bandhara - Sat Yoga',
      description: 'Shop spiritual teachings and resources from Sat Yoga',
    };
  }
}

export default async function DashboardProductDetailPage(
  { params }: DashboardProductDetailPageProps
) {
  const { slug } = await params;

  try {
    // Fetch the product from FastAPI
    const product = await productsApi.getProduct(slug);

    // If product not found, return 404
    if (!product) {
      notFound();
    }

    return <DashboardProductDetailClient product={product} />;
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}
