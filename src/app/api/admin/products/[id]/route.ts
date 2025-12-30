import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { Product, Review, Notification } from '@/db/models';
import { requireRole } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Verify admin role
    await requireRole(request, ['admin']);

    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Valid product ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ productId }).lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: {
        ...product,
        id: product.productId
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('GET product error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Verify admin role
    await requireRole(request, ['admin']);

    const productId = parseInt(params.id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Valid product ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingProduct = await Product.findOne({ productId });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      price,
      images,
      downloadUrl,
      fileSize,
      version,
      compatibility,
      tags,
      demoUrl,
      changelog,
      licenseType,
      featured,
      sponsored,
      status,
    } = body;

    // Validation
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    if (category !== undefined) {
      const validCategories = ['wordpress-theme', 'plugin', 'template', 'ui-kit', 'design'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category', code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
    }

    if (status !== undefined) {
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
    }

    // Update product fields
    if (title !== undefined) existingProduct.title = title;
    if (description !== undefined) existingProduct.description = description;
    if (category !== undefined) existingProduct.category = category;
    if (price !== undefined) existingProduct.price = price;
    if (images !== undefined) existingProduct.images = Array.isArray(images) ? images : JSON.parse(images);
    if (downloadUrl !== undefined) existingProduct.downloadUrl = downloadUrl;
    if (fileSize !== undefined) existingProduct.fileSize = fileSize;
    if (version !== undefined) existingProduct.version = version;
    if (compatibility !== undefined) existingProduct.compatibility = compatibility;
    if (tags !== undefined) existingProduct.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (demoUrl !== undefined) existingProduct.demoUrl = demoUrl;
    if (changelog !== undefined) existingProduct.changelog = changelog;
    if (licenseType !== undefined) existingProduct.licenseType = licenseType;
    if (featured !== undefined) existingProduct.featured = featured;
    if (sponsored !== undefined) existingProduct.sponsored = sponsored;
    
    const oldStatus = existingProduct.status;
    if (status !== undefined) existingProduct.status = status;
    
    existingProduct.updatedAt = new Date();
    await existingProduct.save();

    // Handle status change notifications
    if (status !== undefined && status !== oldStatus) {
      const lastNotification = await Notification.findOne().sort({ notificationId: -1 });
      const notificationId = lastNotification ? lastNotification.notificationId + 1 : 1;

      let notificationType = '';
      let notificationMessage = '';

      if (status === 'approved') {
        notificationType = 'product_approved';
        notificationMessage = `Your product "${existingProduct.title}" has been approved!`;
      } else if (status === 'rejected') {
        notificationType = 'product_rejected';
        notificationMessage = `Your product "${existingProduct.title}" has been rejected.`;
      }

      if (notificationType) {
        await Notification.create({
          notificationId,
          userId: existingProduct.vendorId,
          type: notificationType,
          message: notificationMessage,
          link: `/products/${productId}`,
          read: false,
          createdAt: new Date(),
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Product updated successfully',
        product: {
          ...existingProduct.toObject(),
          id: existingProduct.productId
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT product error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Verify admin role
    await requireRole(request, ['admin']);

    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Valid product ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingProduct = await Product.findOne({ productId });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete related reviews first (due to foreign key constraint)
    await Review.deleteMany({ productId });

    // Delete product
    await Product.deleteOne({ productId });

    return NextResponse.json(
      {
        message: 'Product deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE product error:', error);
    
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}