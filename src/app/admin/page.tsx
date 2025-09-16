'use client';

import { useState, useEffect } from 'react';
import { Game, Category } from '@/lib/database';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [games, setGames] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [editingGame, setEditingGame] = useState<any>(null);
  const [newGame, setNewGame] = useState<Partial<Game>>({
    name: '',
    description: '',
    game_url: '',
    thumbnail_url: '',
    category_id: undefined,
    url_slug: '',
    size_width: 800,
    size_height: 600,
    rating: 0,
    platform: '未知',
    status: 'published'
  });

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50'
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

  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        setAuthenticated(response.ok);
      } catch (error) {
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setAuthenticated(true);
        setPassword('');
      } else {
        const data = await response.json();
        setLoginError(data.error || '登录失败');
      }
    } catch (error) {
      setLoginError('登录失败，请重试');
    }
  };

  const handleLogout = async () => {
    if (!confirm('确定要退出登录吗？')) return;

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        setAuthenticated(false);
        setPassword('');
        // 强制刷新页面以清除所有缓存
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // 即使请求失败，也清除本地状态并刷新页面
      setAuthenticated(false);
      setPassword('');
      window.location.reload();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个游戏吗？')) return;
    
    try {
      const response = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error('Error deleting game:', error);
    }
  };

  const handleImport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const response = await fetch('/api/games/import', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(`导入完成: ${result.results.success} 成功, ${result.results.failed} 失败`);
        setShowImportForm(false);
        fetchGames();
      } else {
        alert(`导入失败: ${result.error}`);
      }
    } catch (error) {
      console.error('Error importing games:', error);
      alert('导入失败');
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGame),
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewGame({
          name: '',
          description: '',
          game_url: '',
          thumbnail_url: '',
          category_id: undefined,
          url_slug: '',
          size_width: 800,
          size_height: 600,
          rating: 0,
          platform: '未知'
        });
        fetchGames();
      } else {
        const data = await response.json();
        alert(`添加失败: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding game:', error);
      alert('添加失败');
    }
  };

  const handleEditGame = (game: any) => {
    setEditingGame(game);
    setShowEditForm(true);
  };

  const handleUpdateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingGame) return;
    
    try {
      const response = await fetch(`/api/games/${editingGame.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingGame),
      });

      if (response.ok) {
        setShowEditForm(false);
        setEditingGame(null);
        fetchGames();
      } else {
        const data = await response.json();
        alert(`更新失败: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating game:', error);
      alert('更新失败');
    }
  };

  // 如果正在检查认证状态
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">验证中...</div>
      </div>
    );
  }

  // 如果未认证，显示登录表单
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">管理后台登录</h1>
            <p className="text-gray-600 mt-2">请输入管理密码</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <input
                type="password"
                placeholder="管理密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {loginError && (
                <p className="mt-2 text-sm text-red-600">{loginError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              登录
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:underline text-sm">
              ← 返回首页
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">游戏管理中心</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImportForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                批量导入
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                添加游戏
              </button>
              <button
                onClick={() => window.open('/', '_blank')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                预览网站
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出登录
              </button>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="搜索游戏..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有分类</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            找到 {games.length} 个游戏 · 第 {currentPage} - {totalPages} 页
          </div>
        </div>

        {/* Games List - Responsive Design */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      游戏
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      尺寸
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      评分
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平台
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      发布
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        加载中...
                      </td>
                    </tr>
                  ) : games.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        暂无游戏数据
                      </td>
                    </tr>
                  ) : (
                    games.map((game) => (
                      <tr key={game.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center min-w-0">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded object-cover"
                                src={game.thumbnail_url || '/placeholder-game.svg'}
                                alt={game.name}
                              />
                            </div>
                            <div className="ml-3 min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {game.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  game.status === 'published' || !game.status
                                    ? 'bg-green-100 text-green-800'
                                    : game.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {game.status === 'published' || !game.status ? '🟢 已发布' :
                                   game.status === 'draft' ? '🟡 草稿' : '🔴 已归档'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-[200px] mt-1">
                                {game.description ?
                                  (game.description.length > 30 ?
                                    `${game.description.substring(0, 30)}...` :
                                    game.description
                                  ) :
                                  '无描述'
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          #{game.id}
                        </td>
                        <td className="px-3 py-4">
                          {game.category_name && (
                            <span
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                              style={{ backgroundColor: game.category_color }}
                            >
                              {game.category_name}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {game.size_width}×{game.size_height}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {game.rating || '0'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {game.platform || '未知'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {new Date(game.created_at).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium w-32">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleEditGame(game)}
                              className="text-blue-600 hover:text-blue-900 text-left"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => {
                                if (game.url_slug) {
                                  window.open(`/game/${game.url_slug}`, '_blank');
                                } else {
                                  alert('游戏URL Slug为空，无法预览');
                                }
                              }}
                              disabled={!game.url_slug}
                              className="text-purple-600 hover:text-purple-900 text-left disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              预览
                            </button>
                            <button
                              onClick={() => handleDelete(game.id)}
                              className="text-red-600 hover:text-red-900 text-left"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                加载中...
              </div>
            ) : games.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                暂无游戏数据
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {games.map((game) => (
                  <div key={game.id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={game.thumbnail_url || '/placeholder-game.svg'}
                          alt={game.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {game.name}
                              </h3>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                game.status === 'published' || !game.status
                                  ? 'bg-green-100 text-green-800'
                                  : game.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {game.status === 'published' || !game.status ? '🟢 已发布' :
                                 game.status === 'draft' ? '🟡 草稿' : '🔴 已归档'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {game.description || '无描述'}
                            </p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span>#{game.id}</span>
                              <span>{game.size_width}×{game.size_height}</span>
                              <span>评分: {game.rating || '0'}</span>
                              <span>平台: {game.platform || '未知'}</span>
                            </div>
                            <div className="mt-2">
                              {game.category_name && (
                                <span
                                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                                  style={{ backgroundColor: game.category_color }}
                                >
                                  {game.category_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => handleEditGame(game)}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => {
                                if (game.url_slug) {
                                  window.open(`/game/${game.url_slug}`, '_blank');
                                } else {
                                  alert('游戏URL Slug为空，无法预览');
                                }
                              }}
                              disabled={!game.url_slug}
                              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              预览
                            </button>
                            <button
                              onClick={() => handleDelete(game.id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          {new Date(game.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  第 <span className="font-medium">{currentPage}</span> 页，共{' '}
                  <span className="font-medium">{totalPages}</span> 页
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">批量导入游戏</h3>
            <form onSubmit={handleImport}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV文件
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".csv"
                  required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  <a href="/api/games/import" className="text-blue-600 hover:underline">
                    下载CSV模板
                  </a>
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowImportForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  导入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Game Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">添加游戏</h3>
            <form onSubmit={handleAddGame}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    游戏名称 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGame.name}
                    onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    游戏描述
                  </label>
                  <textarea
                    rows={3}
                    value={newGame.description}
                    onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    游戏链接 *
                  </label>
                  <input
                    type="url"
                    required
                    value={newGame.game_url}
                    onChange={(e) => setNewGame({...newGame, game_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/game"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL标识符 (SEO友好链接)
                  </label>
                  <input
                    type="text"
                    value={newGame.url_slug}
                    onChange={(e) => setNewGame({...newGame, url_slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：super-mario 或留空自动生成"
                  />
                  <p className="mt-1 text-xs text-gray-500">用于生成SEO友好的URL，如 /game/super-mario。留空将根据游戏名称自动生成。</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    缩略图链接
                  </label>
                  <input
                    type="url"
                    value={newGame.thumbnail_url}
                    onChange={(e) => setNewGame({...newGame, thumbnail_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类
                  </label>
                  <select
                    value={newGame.category_id || ''}
                    onChange={(e) => setNewGame({...newGame, category_id: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      宽度
                    </label>
                    <input
                      type="number"
                      value={newGame.size_width}
                      onChange={(e) => setNewGame({...newGame, size_width: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      高度
                    </label>
                    <input
                      type="number"
                      value={newGame.size_height}
                      onChange={(e) => setNewGame({...newGame, size_height: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    评分
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={newGame.rating}
                    onChange={(e) => setNewGame({...newGame, rating: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    游戏来源/平台
                  </label>
                  <input
                    type="text"
                    value={newGame.platform || ''}
                    onChange={(e) => setNewGame({...newGame, platform: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：Steam、PlayStation、自制等"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    发布状态 *
                  </label>
                  <select
                    value={newGame.status || 'published'}
                    onChange={(e) => setNewGame({...newGame, status: e.target.value as 'published' | 'draft' | 'archived'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="published">🟢 立即发布</option>
                    <option value="draft">🟡 保存为草稿</option>
                    <option value="archived">🔴 归档</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    立即发布：在网站首页可见 | 保存为草稿：仅管理员可见 | 归档：隐藏游戏
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (newGame.name && newGame.game_url) {
                      // 生成临时预览URL（基于游戏名称）
                      const tempSlug = newGame.url_slug || newGame.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
                      window.open(`/game/${tempSlug}?preview=true`, '_blank');
                    } else {
                      alert('请先填写游戏名称和游戏URL再预览');
                    }
                  }}
                  disabled={!newGame.name || !newGame.game_url}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  预览游戏
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {newGame.status === 'draft' ? '保存草稿' : '添加游戏'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {showEditForm && editingGame && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">编辑游戏</h3>
            <form onSubmit={handleUpdateGame}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    游戏名称 *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingGame.name}
                    onChange={(e) => setEditingGame({...editingGame, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    游戏描述
                  </label>
                  <textarea
                    rows={4}
                    value={editingGame.description || ''}
                    onChange={(e) => setEditingGame({...editingGame, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请详细描述游戏内容，有助于SEO优化..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    游戏链接 *
                  </label>
                  <input
                    type="url"
                    required
                    value={editingGame.game_url}
                    onChange={(e) => setEditingGame({...editingGame, game_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/game"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL标识符 (SEO友好链接)
                  </label>
                  <input
                    type="text"
                    value={editingGame.url_slug || ''}
                    onChange={(e) => setEditingGame({...editingGame, url_slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：super-mario 或留空自动生成"
                  />
                  <p className="mt-1 text-xs text-gray-500">用于生成SEO友好的URL，如 /game/super-mario。留空将根据游戏名称自动生成。</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    缩略图链接
                  </label>
                  <input
                    type="url"
                    value={editingGame.thumbnail_url || ''}
                    onChange={(e) => setEditingGame({...editingGame, thumbnail_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    分类
                  </label>
                  <select
                    value={editingGame.category_id || ''}
                    onChange={(e) => setEditingGame({...editingGame, category_id: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      宽度
                    </label>
                    <input
                      type="number"
                      value={editingGame.size_width || 800}
                      onChange={(e) => setEditingGame({...editingGame, size_width: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      高度
                    </label>
                    <input
                      type="number"
                      value={editingGame.size_height || 600}
                      onChange={(e) => setEditingGame({...editingGame, size_height: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    评分
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editingGame.rating || 0}
                    onChange={(e) => setEditingGame({...editingGame, rating: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    游戏来源/平台
                  </label>
                  <input
                    type="text"
                    value={editingGame.platform || ''}
                    onChange={(e) => setEditingGame({...editingGame, platform: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：Steam、PlayStation、自制等"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    发布状态 *
                  </label>
                  <select
                    value={editingGame.status || 'published'}
                    onChange={(e) => setEditingGame({...editingGame, status: e.target.value as 'published' | 'draft' | 'archived'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="published">🟢 已发布</option>
                    <option value="draft">🟡 草稿</option>
                    <option value="archived">🔴 已归档</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    已发布：在网站首页可见 | 草稿：仅管理员可见 | 已归档：隐藏游戏
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (editingGame.url_slug) {
                      window.open(`/game/${editingGame.url_slug}`, '_blank');
                    } else {
                      alert('游戏URL Slug为空，无法预览');
                    }
                  }}
                  disabled={!editingGame.url_slug}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  预览游戏
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingGame(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {editingGame.status === 'draft' ? '保存草稿' : '保存修改'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}