// 响应式设计配置
export const responsive = {
  // 断点配置
  breakpoints: {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // 移动端优化类
  mobile: {
    // 触摸友好的按钮尺寸
    touchTarget: 'min-h-[44px] min-w-[44px]',
    
    // 移动端间距
    spacing: {
      xs: 'p-2 sm:p-3',
      sm: 'p-3 sm:p-4', 
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8'
    },

    // 移动端文字大小
    text: {
      xs: 'text-xs sm:text-sm',
      sm: 'text-sm sm:text-base',
      md: 'text-base sm:text-lg',
      lg: 'text-lg sm:text-xl'
    },

    // 移动端布局
    layout: {
      sidebar: 'w-full sm:w-64',
      modal: 'w-full max-w-sm sm:max-w-md',
      chat: 'flex-col sm:flex-row'
    }
  },

  // 触摸优化
  touch: {
    button: 'active:scale-95 touch-manipulation',
    input: 'touch-manipulation',
    scroll: 'overscroll-contain'
  }
};

// 移动端检测 Hook
export const useIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};