// 动画预设库 - 集中管理所有动画曲线与 variants
// 避免散落各页面重复定义，统一风格

// ============ 过渡曲线 ============
// 柔和弹性（页面转场、卡片入场）
export const springSoft = { type: 'spring', stiffness: 300, damping: 30 };
// 强弹性（按钮、图标弹跳、盖章效果）
export const springBouncy = { type: 'spring', stiffness: 400, damping: 18 };
// 滑卡拖拽反馈专用（更跟手）
export const springCard = { type: 'spring', stiffness: 500, damping: 35 };
// 快速缓动（菜单、toggle）
export const easeQuick = { type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] };

// ============ Variants ============
// stagger 容器：子元素依次入场
export const staggerContainer = (stagger = 0.05, delayChildren = 0) => ({
    hidden: {},
    visible: {
        transition: { staggerChildren: stagger, delayChildren }
    }
});

// 上浮淡入（最常用）
export const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: springSoft }
};

// 下落淡入
export const fadeDown = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: springSoft }
};

// 缩放淡入（盖章、弹窗）
export const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: springBouncy }
};

// 左侧滑入
export const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: springSoft }
};

// ============ 页面转场 Variants ============
// custom=isBack 控制方向
export const pageVariants = {
    enter: (isBack) => ({
        opacity: 0,
        x: isBack ? -30 : 30,
    }),
    center: {
        opacity: 1,
        x: 0,
        transition: springSoft
    },
    exit: (isBack) => ({
        opacity: 0,
        x: isBack ? 30 : -30,
        transition: { type: 'tween', duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    })
};

// ============ 呼吸/循环动画预设 ============
export const breathing = {
    opacity: [0.25, 0.5, 0.25],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
};

export const pulseScale = {
    scale: [1, 1.08, 1],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
};
