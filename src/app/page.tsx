'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/database';

export default function HomePage() {
  const [games, setGames] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory) params.set('category', selectedCategory);
      
      const response = await fetch(`/api/games?${params}`);
      const data = await response.json();
      
      setGames(data.games || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🎮</div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">小游戏中心</h1>
                <p className="text-orange-600 font-medium">发现好玩的小游戏 ✨</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <span className="text-2xl">🎯</span>
              <span className="text-2xl">🎲</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="glass-effect border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400">
                🔍
              </div>
              <input
                type="text"
                placeholder="搜索你喜欢的游戏..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-gray-700 placeholder-orange-300"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 glass-effect rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-gray-700 min-w-[160px]"
            >
              <option value="">🎮 全部分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name === '动作' && '⚔️ '}
                  {cat.name === '益智' && '🧩 '}
                  {cat.name === '跑酷' && '🏃 '}
                  {cat.name === '射击' && '🎯 '}
                  {cat.name === '休闲' && '🎲 '}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="glass-effect border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`game-badge transition-all ${
                  selectedCategory === ''
                    ? 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg'
                    : 'bg-gradient-to-r from-gray-300 to-gray-400 hover:from-orange-300 hover:to-orange-500'
                }`}
              >
                🎮 全部
              </button>
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.id?.toString();
                const getIcon = (name: string) => {
                  if (name.includes('动作')) return '⚔️';
                  if (name.includes('益智')) return '🧩';
                  if (name.includes('跑酷')) return '🏃';
                  if (name.includes('射击')) return '🎯';
                  if (name.includes('休闲')) return '🎲';
                  return '🎪';
                };

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id?.toString() || '')}
                    className={`game-badge transition-all ${isSelected ? 'shadow-lg' : ''}`}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)`
                        : `linear-gradient(135deg, ${cat.color}40, ${cat.color}60)`,
                      color: isSelected ? 'white' : '#374151'
                    }}
                  >
                    {getIcon(cat.name)} {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Games Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="game-spinner mb-4"></div>
            <div className="text-orange-600 font-medium">🎮 加载游戏中...</div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎲</div>
            <div className="text-gray-600 text-lg mb-2">暂无游戏</div>
            <p className="text-orange-400">尝试搜索其他关键词或更换分类 ✨</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {games.map((game) => (
                <Link key={game.id} href={`/game/${game.id}`}>
                  <div className="game-card cursor-pointer group">
                    <div className="aspect-square bg-gradient-to-br from-orange-50 to-pink-50 relative overflow-hidden rounded-t-xl">
                      <img
                        src={game.thumbnail_url || '/placeholder-game.svg'}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      {game.rating > 0 && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
                          ⭐ {game.rating.toFixed(1)}
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 truncate text-lg group-hover:text-orange-600 transition-colors">
                        {game.name}
                      </h3>
                      {game.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                          {game.description}
                        </p>
                      )}
                      {game.category_name && (
                        <div className="flex items-center justify-between">
                          <span
                            className="game-badge text-xs"
                            style={{
                              background: `linear-gradient(135deg, ${game.category_color}, ${game.category_color}dd)`
                            }}
                          >
                            {game.category_name === '动作' && '⚔️ '}
                            {game.category_name === '益智' && '🧩 '}
                            {game.category_name === '跑酷' && '🏃 '}
                            {game.category_name === '射击' && '🎯 '}
                            {game.category_name === '休闲' && '🎲 '}
                            {game.category_name}
                          </span>
                          <div className="text-orange-400 group-hover:text-orange-600 transition-colors">
                            🎮
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="candy-button disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none px-6"
                  >
                    ← 上一页
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, currentPage - 2) + i;
                      if (page > totalPages) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg transform scale-105'
                              : 'glass-effect text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="candy-button disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none px-6"
                  >
                    下一页 →
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-effect border-t border-orange-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
              <span className="text-3xl">🎮</span>
              <h3 className="text-xl font-bold text-gradient">小游戏中心</h3>
              <span className="text-3xl">🎲</span>
            </div>
            <p className="text-orange-600 font-medium mb-4">发现更多好玩的游戏 ✨</p>
            <div className="flex justify-center items-center gap-6 text-2xl">
              <span className="cursor-default">🏆</span>
              <span className="cursor-default">🎯</span>
              <span className="cursor-default">🧩</span>
              <span className="cursor-default">⚔️</span>
              <span className="cursor-default">🏃</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
