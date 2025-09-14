'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// Google Analytics
export function GoogleAnalytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}

// Umami Analytics
export function UmamiAnalytics() {
  const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const UMAMI_URL = process.env.NEXT_PUBLIC_UMAMI_URL || 'https://analytics.umami.is';

  if (!UMAMI_WEBSITE_ID) return null;

  return (
    <Script
      src={`${UMAMI_URL}/script.js`}
      data-website-id={UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}

// 页面浏览跟踪
export function usePageView() {
  useEffect(() => {
    // Google Analytics 页面浏览
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });
    }

    // Umami 页面浏览 (自动跟踪，无需手动调用)
  }, []);
}

// 自定义事件跟踪
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  // Google Analytics 事件
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }

  // Umami 事件
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, parameters);
  }
}

// 游戏相关事件跟踪
export const gameEvents = {
  // 游戏点击
  gameClick: (gameId: string, gameName: string) => {
    trackEvent('game_click', {
      game_id: gameId,
      game_name: gameName,
      event_category: 'engagement',
    });
  },

  // 游戏开始
  gameStart: (gameId: string, gameName: string, category?: string) => {
    trackEvent('game_start', {
      game_id: gameId,
      game_name: gameName,
      game_category: category,
      event_category: 'engagement',
    });
  },

  // 搜索
  search: (searchTerm: string, resultsCount: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount,
      event_category: 'engagement',
    });
  },

  // 分类筛选
  categoryFilter: (categoryName: string, categoryId: string) => {
    trackEvent('category_filter', {
      category_name: categoryName,
      category_id: categoryId,
      event_category: 'engagement',
    });
  },

  // 分页
  pagination: (page: number, totalPages: number) => {
    trackEvent('pagination', {
      page_number: page,
      total_pages: totalPages,
      event_category: 'navigation',
    });
  },
};

// TypeScript 类型扩展
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    umami: {
      track: (event: string, data?: Record<string, any>) => void;
    };
  }
}