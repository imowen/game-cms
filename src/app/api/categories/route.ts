import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Category } from '@/lib/database';

export async function GET() {
  try {
    const db = await getDatabase();
    const categories = await db.all(`
      SELECT c.*, COUNT(g.id) as game_count 
      FROM categories c 
      LEFT JOIN games g ON c.id = g.category_id AND g.is_active = 1
      GROUP BY c.id 
      ORDER BY c.name
    `);
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const category: Category = await request.json();
    
    const result = await db.run(`
      INSERT INTO categories (name, color) VALUES (?, ?)
    `, [category.name, category.color || '#3B82F6']);
    
    return NextResponse.json({ 
      success: true, 
      id: result.lastID,
      message: 'Category created successfully' 
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}