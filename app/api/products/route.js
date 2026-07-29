import { NextResponse } from 'next/server';
import { connectToDatabase, isMongoConnected } from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { INITIAL_PRODUCTS } from '@/lib/initial-data';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    await connectToDatabase();

    if (isMongoConnected()) {
      let query = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      const products = await Product.find(query).sort({ createdAt: -1 });

      if (products && products.length > 0) {
        return NextResponse.json({ success: true, source: 'mongodb', products });
      }
    }

    // Fallback to initial products list
    let filtered = [...INITIAL_PRODUCTS];
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      const queryLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower)
      );
    }

    return NextResponse.json({ success: true, source: 'fallback', products: filtered });
  } catch (error) {
    return NextResponse.json(
      { success: true, source: 'fallback', products: INITIAL_PRODUCTS, error: error.message },
      { status: 200 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, price, category, image, tags, downloadUrl } = body;

    if (!title || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, description, price, and category are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProductData = {
      title,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      description,
      price: parseFloat(price),
      category,
      image: image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      tags: tags || ['Next.js', 'Assignment'],
      downloadUrl: downloadUrl || '/downloads/sample-project.zip',
      rating: 5.0,
      reviewsCount: 1,
      featured: true,
    };

    if (isMongoConnected()) {
      const product = await Product.create(newProductData);
      return NextResponse.json({ success: true, source: 'mongodb', product }, { status: 201 });
    }

    // Local simulated save response
    const mockProduct = {
      _id: `prod-${Date.now()}`,
      id: `prod-${Date.now()}`,
      ...newProductData,
    };

    return NextResponse.json({ success: true, source: 'local', product: mockProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
