import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }

    const paste = await db.paste.findUnique({
      where: { id },
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

    // Verify password
    const isValid = await bcrypt.compare(password, paste.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Return the raw content
    return NextResponse.json({
      id: paste.id,
      title: paste.title,
      content: paste.content,
      language: paste.language,
    });
  } catch (error) {
    console.error('Error verifying paste:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar paste' },
      { status: 500 }
    );
  }
}
