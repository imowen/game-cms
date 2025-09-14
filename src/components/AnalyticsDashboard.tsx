'use client';

import { useEffect, useState } from 'react';

interface AnalyticsData {
  totalGames: number;
  totalViews: number;
  popularGames: Array<{
    id: string;
    name: string;
    views: number;
  }>;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 这里可以集成真实的分析API
    // 目前使用模拟数据
    setTimeout(() => {
      setData({
        totalGames: 156,
        totalViews: 12543,
        popularGames: [
          { id: '1', name: '超级马里奥', views: 2341 },
          { id: '2', name: '俄罗斯方块', views: 1876 },
          { id: '3', name: '贪吃蛇', views: 1654 },
          { id: '4', name: '打砖块', views: 1432 },
          { id: '5', name: '太空射击', views: 1298 },
        ],
        topCategories: [
          { name: '动作', count: 45 },
          { name: '益智', count: 38 },
          { name: '射击', count: 32 },
          { name: '跑酷', count: 28 },
          { name: '休闲', count: 13 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="game-spinner mx-auto"></div>
        <p className="text-center mt-4 text-orange-600">加载数据中...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="game-card p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🎮</div>
            <div>
              <p className="text-sm text-gray-600">游戏总数</p>
              <p className="text-2xl font-bold text-orange-600">{data.totalGames}</p>
            </div>
          </div>
        </div>

        <div className="game-card p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👀</div>
            <div>
              <p className="text-sm text-gray-600">总访问量</p>
              <p className="text-2xl font-bold text-orange-600">{data.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="game-card p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔥</div>
            <div>
              <p className="text-sm text-gray-600">热门游戏</p>
              <p className="text-2xl font-bold text-orange-600">{data.popularGames.length}</p>
            </div>
          </div>
        </div>

        <div className="game-card p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <p className="text-sm text-gray-600">分类数量</p>
              <p className="text-2xl font-bold text-orange-600">{data.topCategories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 热门游戏 */}
      <div className="game-card p-6">
        <h3 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
          🏆 热门游戏排行
        </h3>
        <div className="space-y-3">
          {data.popularGames.map((game, index) => (
            <div key={game.id} className="flex items-center justify-between p-3 glass-effect rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <span className="font-medium">{game.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600 font-bold">{game.views.toLocaleString()}</span>
                <span className="text-sm text-gray-500">次浏览</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 分类统计 */}
      <div className="game-card p-6">
        <h3 className="text-xl font-bold text-gradient mb-4 flex items-center gap-2">
          📊 分类统计
        </h3>
        <div className="space-y-3">
          {data.topCategories.map((category, index) => (
            <div key={category.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {category.name === '动作' && '⚔️'}
                  {category.name === '益智' && '🧩'}
                  {category.name === '射击' && '🎯'}
                  {category.name === '跑酷' && '🏃'}
                  {category.name === '休闲' && '🎲'}
                </span>
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(category.count / Math.max(...data.topCategories.map(c => c.count))) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="font-bold text-orange-600 min-w-[3rem] text-right">{category.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}