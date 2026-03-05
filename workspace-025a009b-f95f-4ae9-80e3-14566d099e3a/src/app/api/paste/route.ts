import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, language, password, expiresIn } = body;

    // Validate required fields
    if (!title || !content || !password) {
      return NextResponse.json(
        { error: 'Título, conteúdo e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 4) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 4 caracteres' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate expiration date
    let expiresAt: Date | null = null;
    if (expiresIn) {
      const now = new Date();
      switch (expiresIn) {
        case '1h':
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case '1d':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '1w':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'never':
        default:
          expiresAt = null;
      }
    }

    // Create the paste with a custom short ID
    const id = uuidv4().split('-')[0]; // Use first part of UUID for shorter ID
    
    const paste = await db.paste.create({
      data: {
        id,
        title,
        content,
        language: language || 'plaintext',
        password: hashedPassword,
        expiresAt,
      },
    });

    return NextResponse.json({
      id: paste.id,
      title: paste.title,
      language: paste.language,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
    });
  } catch (error) {
    console.error('Error creating paste:', error);
    return NextResponse.json(
      { error: 'Erro ao criar paste' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // List recent pastes (only metadata, no content or password)
    const pastes = await db.paste.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: {
        id: true,
        title: true,
        language: true,
        viewCount: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json(pastes);
  } catch (error) {
    console.error('Error listing pastes:', error);
    return NextResponse.json(
      { error: 'Erro ao listar pastes' },
      { status: 500 }
    );
  }
}
