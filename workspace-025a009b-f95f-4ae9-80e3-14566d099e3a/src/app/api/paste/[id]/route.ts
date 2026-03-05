import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const paste = await db.paste.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        language: true,
        viewCount: true,
        createdAt: true,
        expiresAt: true,
        // Note: content and password are NOT returned
      },
    });

    if (!paste) {
      return NextResponse.json(
        { error: 'Paste não encontrado' },
        { status: 404 }
      );
    }

    // Check if expired
    if (paste.expiresAt && new Date(paste.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Este paste expirou' },
        { status: 410 }
      );
    }

    // Increment view count
    await db.paste.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      ...paste,
      viewCount: paste.viewCount + 1,
    });
  } catch (error) {
    console.error('Error fetching paste:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar paste' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.paste.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao deletar paste' },
      { status: 500 }
    );
  }
}
