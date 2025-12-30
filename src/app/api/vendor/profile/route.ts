import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/db/mongodb';
import { User } from '@/db/models';
import { getSession } from '@/lib/auth-utils';

// PUT /api/vendor/profile - Update vendor profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { session } = await getSession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, storeName, storeDescription, bio, bankDetails, image, password } = body;

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update vendor fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (storeName) user.storeName = storeName;
    if (storeDescription) user.storeDescription = storeDescription;
    if (bio !== undefined) user.bio = bio;
    if (bankDetails !== undefined) user.bankDetails = bankDetails;
    if (image !== undefined) user.image = image;
    if (password) user.password = password;
    
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        bio: user.bio,
        image: user.image
      }
    });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}