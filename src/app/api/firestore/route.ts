import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// Verify authentication from Cloudflare Worker
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const secretKey = process.env.BRIDGE_SECRET_KEY;
  
  if (!authHeader || !secretKey) {
    return false;
  }
  
  // Expect format: "Bearer <secret-key>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return false;
  }
  
  return parts[1] === secretKey;
}

// GET /api/firestore - Query or get document
export async function GET(request: NextRequest) {
  // Verify authentication
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const collection = searchParams.get('collection');
    const filterField = searchParams.get('filterField');
    const filterValue = searchParams.get('filterValue');

    if (!path && !collection) {
      return NextResponse.json({ error: 'path or collection required' }, { status: 400 });
    }

    // Get single document
    if (path) {
      const doc = await getAdminDb().doc(path).get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    // Query collection
    if (collection) {
      let query: any = getAdminDb().collection(collection);
      
      if (filterField && filterValue) {
        query = query.where(filterField, '==', filterValue);
      }

      const snapshot = await query.get();
      const docs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json(docs);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Firestore GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to query Firestore' },
      { status: 500 }
    );
  }
}

// POST /api/firestore - Create document
export async function POST(request: NextRequest) {
  // Verify authentication
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { path, data } = body;

    if (!path || !data) {
      return NextResponse.json({ error: 'path and data required' }, { status: 400 });
    }

    await getAdminDb().doc(path).set(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Firestore POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create document' },
      { status: 500 }
    );
  }
}

// PUT /api/firestore - Update document
export async function PUT(request: NextRequest) {
  // Verify authentication
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { path, data } = body;

    if (!path || !data) {
      return NextResponse.json({ error: 'path and data required' }, { status: 400 });
    }

    await getAdminDb().doc(path).update(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Firestore PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/firestore - Delete document
export async function DELETE(request: NextRequest) {
  // Verify authentication
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'path required' }, { status: 400 });
    }

    await getAdminDb().doc(path).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Firestore DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    );
  }
}
