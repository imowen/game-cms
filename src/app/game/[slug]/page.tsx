'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { use } from 'react';
import { usePageView, gameEvents } from '@/components/Analytics';

export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 页面浏览统计
  usePageView();

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/by-slug/${slug}`);
        if (!response.ok) {
          throw new Error('Game not found');
        }
        const gameData = await response.json();
        setGame(gameData);

        // 游戏开始事件跟踪
        if (gameData) {
          gameEvents.gameStart(
            gameData.id.toString(),
            gameData.name,
            gameData.category_name
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    if (slug) {
      fetchGame();
    }
    checkAuth();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="game-spinner mb-4"></div>
          <div className="text-orange-600 font-medium">🎮 游戏加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center glass-effect rounded-2xl p-8">
          <div className="text-6xl mb-4">😕</div>
          <div className="text-red-500 text-lg mb-4">{error || '游戏未找到'}</div>
          <Link href="/" className="candy-button inline-block">
            🏠 返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {game && (
        <Head>
          <title>{game.name} - 在线免费游戏 | 小游戏中心</title>
          <meta 
            name="description" 
            content={
              game.description 
                ? `${game.description.slice(0, 150)}...` 
                : `${game.name} 是一款免费的在线${game.category_name || ''}游戏，无需下载，直接在浏览器中畅玩。支持电脑和手机，即点即玩！`
            } 
          />
          <meta name="keywords" content={`${game.name}, ${game.category_name || ''}游戏, 在线游戏, 免费游戏, HTML5游戏, 小游戏`} />
          <meta property="og:title" content={`${game.name} - 免费在线游戏`} />
          <meta property="og:description" content={game.description || `玩 ${game.name}，一款精彩的在线小游戏`} />
          <meta property="og:type" content="website" />
          {game.thumbnail_url && (
            <meta property="og:image" content={game.thumbnail_url} />
          )}
        </Head>
      )}
      <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="candy-button text-sm">
                ← 🎮 游戏列表
              </Link>
              <div className="text-orange-300">|</div>
              <h1 className="text-xl font-bold text-gradient">{game.name}</h1>
            </div>
            {isAuthenticated && (
              <Link
                href="/admin"
                className="candy-button text-sm"
              >
                ⚙️ 管理后台
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Frame - Full Width */}
        <div>
            <div className="game-card p-3 sm:p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gradient mb-3">
                  🎯 正在游戏: {game.name}
                </h3>
                <p className="text-orange-600 font-medium flex items-center gap-2">
                  <span>🔥</span>
                  使用全屏模式获得最佳游戏体验
                  <span>✨</span>
                </p>
              </div>
              
              <div 
                className="relative bg-black rounded-lg overflow-hidden shadow-lg"
                style={{ 
                  width: '100%',
                  aspectRatio: (() => {
                    // 检查是否是特殊的嵌入式游戏
                    const isEmbedGame = game.game_url?.includes('.embed') || 
                                      game.game_url?.includes('suikagame.io') ||
                                      game.game_url?.includes('itch.io') ||
                                      game.game_url?.includes('construct.net');
                    
                    if (isEmbedGame) {
                      return '2 / 3'; // 更高的竖向比例
                    }
                    
                    return game.size_width && game.size_height ? 
                           `${game.size_width} / ${game.size_height}` : 
                           '16 / 9';
                  })(),
                  maxHeight: '98vh',
                  minHeight: '600px'
                }}
              >
                <iframe
                  id="game-frame"
                  src={game.game_url}
                  className="absolute inset-0 w-full h-full border-0"
                  title={game.name}
                  allowFullScreen
                  loading="lazy"
                  style={{
                    backgroundColor: 'transparent',
                    transform: 'scale(1)',
                    transformOrigin: 'center center'
                  }}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation allow-storage-access-by-user-activation"
                  allow="autoplay; encrypted-media; fullscreen; gamepad; microphone; camera; display-capture"
                  referrerPolicy="no-referrer-when-downgrade"
                  frameBorder="0"
                  scrolling="no"
                />
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-orange-500 font-medium">
                  💡 如果游戏无法加载，请检查网络连接或联系管理员
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const gameFrame = document.getElementById('game-frame') as HTMLIFrameElement;
                      if (gameFrame) {
                        gameFrame.src = gameFrame.src; // Reload the game
                      }
                    }}
                    className="candy-button text-sm px-4 py-2"
                  >
                    🔄 重新加载
                  </button>
                  <button
                    onClick={() => {
                      const gameFrame = document.getElementById('game-frame') as HTMLIFrameElement;
                      if (gameFrame.requestFullscreen) {
                        gameFrame.requestFullscreen();
                      }
                    }}
                    className="candy-button text-sm px-4 py-2"
                  >
                    🔍 全屏
                  </button>
                </div>
              </div>
            </div>

            {/* Game Description Section for SEO */}
            {game.description && (
              <div className="game-card p-6 mt-6">
                {/* Game Info for SEO */}
                <div>
                  <h3 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
                    📋 游戏信息
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="glass-effect p-4 rounded-xl">
                      <dt className="text-sm font-bold text-orange-600 mb-2">🎮 游戏名称</dt>
                      <dd className="text-gray-800 font-medium">{game.name}</dd>
                    </div>
                    {game.category_name && (
                      <div className="glass-effect p-4 rounded-xl">
                        <dt className="text-sm font-bold text-orange-600 mb-2">🎯 游戏分类</dt>
                        <dd className="text-gray-800 font-medium">{game.category_name}</dd>
                      </div>
                    )}
                    <div className="glass-effect p-4 rounded-xl">
                      <dt className="text-sm font-bold text-orange-600 mb-2">📐 游戏尺寸</dt>
                      <dd className="text-gray-800 font-medium">{game.size_width} × {game.size_height} 像素</dd>
                    </div>
                    {game.rating > 0 && (
                      <div className="glass-effect p-4 rounded-xl">
                        <dt className="text-sm font-bold text-orange-600 mb-2">⭐ 用户评分</dt>
                        <dd className="text-gray-800 font-medium">{game.rating.toFixed(1)} / 5.0</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Keywords and Tags for SEO */}
                <div className="mt-8 pt-6 border-t border-orange-100">
                  <h3 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
                    🏷️ 游戏标签
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <span className="game-badge bg-gradient-to-r from-blue-400 to-blue-600">
                      🌐 在线游戏
                    </span>
                    <span className="game-badge bg-gradient-to-r from-green-400 to-green-600">
                      🆓 免费游戏
                    </span>
                    {game.category_name && (
                      <span
                        className="game-badge"
                        style={{
                          background: `linear-gradient(135deg, ${game.category_color}, ${game.category_color}dd)`
                        }}
                      >
                        {game.category_name === '动作' && '⚔️ '}
                        {game.category_name === '益智' && '🧩 '}
                        {game.category_name === '跑酷' && '🏃 '}
                        {game.category_name === '射击' && '🎯 '}
                        {game.category_name === '休闲' && '🎲 '}
                        {game.category_name}游戏
                      </span>
                    )}
                    <span className="game-badge bg-gradient-to-r from-purple-400 to-purple-600">
                      📱 HTML5游戏
                    </span>
                    <span className="game-badge bg-gradient-to-r from-yellow-400 to-orange-500">
                      ⚡ 无需下载
                    </span>
                  </div>
                </div>

                {/* Game Instructions Section for SEO */}
                <div className="mt-8 pt-6 border-t border-orange-100">
                  <h3 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
                    📖 {game.name}游戏说明
                  </h3>
                  <div className="glass-effect p-6 rounded-xl">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {game.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
      </div>
    </>
  );
}