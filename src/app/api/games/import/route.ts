import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import Papa from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Please upload a CSV file' }, { status: 400 });
    }
    
    const csvText = await file.text();
    
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });
    
    if (parsed.errors.length > 0) {
      return NextResponse.json({ 
        error: 'CSV parsing failed', 
        details: parsed.errors 
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };
    
    // 获取所有分类，用于名称匹配
    const categories = await db.all('SELECT * FROM categories');
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
    
    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i] as Record<string, string | number>;
      
      try {
        // 验证必需字段
        if (!row.name || !row.game_url) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing required fields (name, game_url)`);
          continue;
        }
        
        // 查找分类ID
        let categoryId = null;
        if (row.category) {
          categoryId = categoryMap.get(row.category.toLowerCase());
          if (!categoryId) {
            // 创建新分类
            const newCategory = await db.run(
              'INSERT INTO categories (name, color) VALUES (?, ?)',
              [row.category, '#3B82F6']
            );
            categoryId = newCategory.lastID;
            categoryMap.set(row.category.toLowerCase(), categoryId);
          }
        }
        
        // 生成namespace
        const namespace = row.namespace || `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await db.run(`
          INSERT INTO games (name, description, game_url, thumbnail_url, category_id, namespace, size_width, size_height, rating, platform)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          row.name,
          row.description || null,
          row.game_url,
          row.thumbnail_url || null,
          categoryId,
          namespace,
          parseInt(row.size_width) || 800,
          parseInt(row.size_height) || 600,
          parseFloat(row.rating) || 0,
          row.platform || '未知'
        ]);
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return NextResponse.json({
      message: `Import completed: ${results.success} successful, ${results.failed} failed`,
      results
    });
  } catch (error) {
    console.error('Error importing games:', error);
    return NextResponse.json({ error: 'Failed to import games' }, { status: 500 });
  }
}

// 生成CSV模板
export async function GET() {
  const csvTemplate = `name,description,game_url,thumbnail_url,category,namespace,size_width,size_height,rating,platform
"示例游戏","这是一个示例游戏","https://example.com/game","https://example.com/thumb.jpg","益智","example-game",800,600,4.5,"Steam"
"另一个游戏","另一个示例","https://example.com/game2","","动作","",600,400,3.2,"Web"`;
  
  return new NextResponse(csvTemplate, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="games_template.csv"'
    }
  });
}