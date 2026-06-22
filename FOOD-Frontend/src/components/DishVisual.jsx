import { useEffect, useMemo, useState } from 'react';

const iconByType = {
  pig: 'lunch_dining',
  chicken: 'set_meal',
  vegetable: 'eco',
  seafood: 'set_meal',
  beef: 'outdoor_grill',
  noodle: 'ramen_dining',
  rice: 'rice_bowl',
};

const themeByType = {
  pig: {
    background: 'linear-gradient(135deg, #431407 0%, #9a3412 54%, #f59e0b 100%)',
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.34)',
  },
  chicken: {
    background: 'linear-gradient(135deg, #422006 0%, #b45309 52%, #fde68a 100%)',
    accent: '#fcd34d',
    glow: 'rgba(252, 211, 77, 0.34)',
  },
  vegetable: {
    background: 'linear-gradient(135deg, #052e16 0%, #15803d 54%, #bef264 100%)',
    accent: '#bef264',
    glow: 'rgba(190, 242, 100, 0.34)',
  },
  seafood: {
    background: 'linear-gradient(135deg, #082f49 0%, #0369a1 55%, #67e8f9 100%)',
    accent: '#67e8f9',
    glow: 'rgba(103, 232, 249, 0.34)',
  },
  beef: {
    background: 'linear-gradient(135deg, #450a0a 0%, #991b1b 55%, #fb7185 100%)',
    accent: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.34)',
  },
  noodle: {
    background: 'linear-gradient(135deg, #312e81 0%, #7c3aed 52%, #f0abfc 100%)',
    accent: '#f0abfc',
    glow: 'rgba(240, 171, 252, 0.34)',
  },
  rice: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f766e 55%, #ccfbf1 100%)',
    accent: '#99f6e4',
    glow: 'rgba(153, 246, 228, 0.34)',
  },
  default: {
    background: 'linear-gradient(135deg, #1f2937 0%, #d97706 55%, #fed7aa 100%)',
    accent: '#fed7aa',
    glow: 'rgba(254, 215, 170, 0.34)',
  },
};

function isPlaceholderUrl(url = '') {
  return /picsum\.photos|lh3\.googleusercontent\.com\/aida-public/i.test(url);
}

function useUsableImage(url) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  return {
    src: url && !failed && !isPlaceholderUrl(url) ? url : '',
    markFailed: () => setFailed(true),
  };
}

function getDishVisual(dish) {
  const type = dish?.icon_type || 'default';
  return {
    icon: iconByType[type] || 'restaurant_menu',
    theme: themeByType[type] || themeByType.default,
  };
}

export function DishBackdrop({ dish, className = '', children }) {
  const image = useUsableImage(dish?.image_url);
  const { icon, theme } = useMemo(() => getDishVisual(dish), [dish]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: theme.background }}>
      {image.src ? (
        <>
          <img
            src={image.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={image.markFailed}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/35 to-black/80" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,transparent_34%),linear-gradient(45deg,transparent_0_38%,rgba(255,255,255,0.12)_38%_48%,transparent_48%_100%),linear-gradient(to_bottom,rgba(0,0,0,0.04),rgba(0,0,0,0.38))]" />
          <div className="absolute -left-10 top-10 h-20 w-[120%] -rotate-12 bg-white/10" />
          <div className="absolute -right-10 bottom-12 h-14 w-[120%] -rotate-12 bg-black/10" />
          <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[13rem] text-white/15">
            {icon}
          </span>
        </>
      )}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

export function DishAvatar({ dish, className = '' }) {
  const image = useUsableImage(dish?.image_url);
  const { icon, theme } = useMemo(() => getDishVisual(dish), [dish]);

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden rounded-full border-4 border-white/25 shadow-[0_0_40px_rgba(255,255,255,0.18)] ${className}`}
      style={{ backgroundColor: theme.accent, boxShadow: `0 0 42px ${theme.glow}` }}
    >
      {image.src ? (
        <img src={image.src} alt={dish?.name || ''} className="h-full w-full object-cover" onError={image.markFailed} />
      ) : (
        <span className="material-symbols-outlined text-5xl text-slate-950">{icon}</span>
      )}
    </div>
  );
}
