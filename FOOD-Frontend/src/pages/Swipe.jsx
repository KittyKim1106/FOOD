import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, useAnimationControls, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { apiClient } from '../api/client';
import { DishAvatar, DishBackdrop } from '../components/DishVisual';
import { fadeUp, scaleIn, springBouncy, springCard, springSoft } from '../lib/motion';

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.5;
const FLY_DISTANCE = 640;

const actionMap = { left: 'pass', right: 'pick', up: 'save' };

const directionFeedback = {
    right: {
        border: 'border-green-500',
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        icon: 'favorite',
        opacityRange: [50, 150],
    },
    left: {
        border: 'border-red-500',
        bg: 'bg-red-500/10',
        text: 'text-red-500',
        icon: 'close',
        opacityRange: [-50, -150],
    },
    up: {
        border: 'border-blue-500',
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        icon: 'star',
        opacityRange: [-50, -150],
    },
};

function getSwipeDirection(offset, velocity) {
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    const isFarSwipe = absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD;
    const isFastSwipe = speed > SWIPE_VELOCITY_THRESHOLD * 1000;

    if (!isFarSwipe && !isFastSwipe) return null;
    if (absX > absY) return offset.x > 0 ? 'right' : 'left';
    return offset.y < 0 ? 'up' : null;
}

function getFlyTarget(direction) {
    const flyMap = {
        left: { x: -FLY_DISTANCE, y: 0, rotate: -28, opacity: 0, scale: 0.96 },
        right: { x: FLY_DISTANCE, y: 0, rotate: 28, opacity: 0, scale: 0.96 },
        up: { x: 0, y: -FLY_DISTANCE, rotate: 0, opacity: 0, scale: 0.96 },
    };

    return flyMap[direction];
}

function DirectionIndicator({ direction, opacity }) {
    const feedback = directionFeedback[direction];

    return (
        <Motion.div
            className={`absolute inset-0 rounded-xl border-4 ${feedback.border} ${feedback.bg} z-20 flex items-center justify-center pointer-events-none`}
            style={{ opacity }}
        >
            <Motion.span
                className={`material-symbols-outlined ${feedback.text} text-7xl drop-shadow-lg`}
                style={{ scale: opacity }}
            >
                {feedback.icon}
            </Motion.span>
        </Motion.div>
    );
}

export default function Swipe() {
    const navigate = useNavigate();
    const [dish, setDish] = useState(null);
    const [confidence, setConfidence] = useState(0);
    const [loading, setLoading] = useState(true);
    const [swipingOut, setSwipingOut] = useState(false);

    const controls = useAnimationControls();
    const shouldReduceMotion = useReducedMotion();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-180, 0, 180], [-14, 0, 14]);
    const cardScale = useTransform(y, [-180, 0, 180], [1.02, 1, 0.98]);
    const rightOpacity = useTransform(x, directionFeedback.right.opacityRange, [0, 1]);
    const leftOpacity = useTransform(x, directionFeedback.left.opacityRange, [0, 1]);
    const upOpacity = useTransform(y, directionFeedback.up.opacityRange, [0, 1]);

    const intent = useMemo(() => localStorage.getItem('temp_intent') || '想吃', []);
    const selectedCategories = useMemo(
        () => JSON.parse(localStorage.getItem('temp_selected_categories') || '[]'),
        []
    );
    const excludedCategories = useMemo(
        () => JSON.parse(localStorage.getItem('temp_excluded_categories') || '[]'),
        []
    );

    const fetchNext = useCallback(async () => {
        setLoading(true);
        setSwipingOut(false);
        x.set(0);
        y.set(0);
        controls.set({ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 });
        try {
            const res = await apiClient.getRecommendation(intent, selectedCategories, excludedCategories, [], []);
            if (res.recommendation) {
                setDish(res.recommendation);
                setConfidence(res.confidence);
            } else {
                setDish(null);
                navigate('/failure');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [controls, excludedCategories, intent, navigate, selectedCategories, x, y]);

    useEffect(() => {
        fetchNext();
    }, [fetchNext]);

    const handleAction = useCallback(async (action) => {
        if (!dish) return;
        try {
            if (action === 'pass') {
                await apiClient.saveDecision(dish.id, 'rejected');
                fetchNext();
            } else if (action === 'save') {
                const saveRes = await apiClient.saveDecision(dish.id, 'accepted');
                if (saveRes.historyId) {
                    await apiClient.markFavorite(saveRes.historyId);
                }
                fetchNext();
            } else if (action === 'pick') {
                await apiClient.saveDecision(dish.id, 'accepted');
                localStorage.setItem('final_dish', JSON.stringify(dish));
                localStorage.setItem('final_confidence', confidence);
                navigate('/result');
            }
        } catch (err) {
            console.error(err);
        }
    }, [confidence, dish, fetchNext, navigate]);

    const flyOut = useCallback(async (direction) => {
        if (swipingOut || loading || !dish) return;
        setSwipingOut(true);

        if (shouldReduceMotion) {
            await handleAction(actionMap[direction]);
            return;
        }

        await controls.start({
            ...getFlyTarget(direction),
            transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
        });
        await handleAction(actionMap[direction]);
    }, [controls, dish, handleAction, loading, shouldReduceMotion, swipingOut]);

    const handleDragEnd = (_, info) => {
        const direction = getSwipeDirection(info.offset, info.velocity);
        if (direction) {
            flyOut(direction);
            return;
        }

        controls.start({
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            transition: shouldReduceMotion ? { duration: 0.01 } : springCard,
        });
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <header className="flex items-center p-4 justify-between bg-background-light dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-primary transition-colors flex size-12 items-center justify-start">
                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                </button>
                <h1 className="font-display font-bold text-xl tracking-tight text-primary uppercase">犹豫就会饿死</h1>
                <button onClick={() => navigate('/history')} className="text-slate-400 hover:text-primary transition-colors flex size-12 items-center justify-end">
                    <span className="material-symbols-outlined text-2xl">history</span>
                </button>
            </header>
            <Motion.main
                className="flex-1 flex flex-col items-center justify-center p-6 gap-8 max-w-md mx-auto w-full"
                initial="hidden"
                animate="visible"
                variants={fadeUp}
            >
                <Motion.div className="text-center space-y-2" variants={fadeUp}>
                    <h2 className="text-2xl font-display font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">看着不错，要不就它了？</h2>
                    <p className="text-slate-500 dark:text-primary/60 font-medium uppercase tracking-widest text-xs">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">swipe</span>
                        Swipe to Decide
                    </p>
                </Motion.div>

                {loading ? (
                    <Motion.div
                        className="w-full aspect-[4/5] flex items-center justify-center"
                        variants={scaleIn}
                    >
                        <span className="material-symbols-outlined animate-spin text-primary text-6xl">refresh</span>
                    </Motion.div>
                ) : dish ? (
                    <Motion.div
                        key={dish.id}
                        className="relative w-full aspect-[4/5] touch-none select-none"
                        drag={!swipingOut && !loading}
                        dragElastic={0.2}
                        dragMomentum={false}
                        onDragEnd={handleDragEnd}
                        animate={controls}
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={shouldReduceMotion ? { duration: 0.01 } : springSoft}
                        style={{ x, y, rotate, scale: cardScale }}
                    >
                        {/* Background cards */}
                        <Motion.div
                            className="absolute inset-0 bg-primary/10 rounded-xl border-2 border-primary/20"
                            animate={shouldReduceMotion ? undefined : { rotate: 3, scale: 0.95 }}
                        />
                        <Motion.div
                            className="absolute inset-0 bg-primary/20 rounded-xl border-2 border-primary/30"
                            animate={shouldReduceMotion ? undefined : { rotate: -2, scale: 0.97 }}
                        />

                        {/* Main card */}
                        <div className="relative h-full w-full bg-slate-100 dark:bg-background-dark border-4 border-slate-900 dark:border-primary rounded-xl overflow-hidden shadow-2xl flex flex-col">
                            <DishBackdrop dish={dish} className="flex-1 bg-slate-200 dark:bg-zinc-800/50 p-8">
                                <div className="flex h-full flex-col items-center justify-center gap-6">
                                    <DishAvatar dish={dish} className="h-32 w-32" />
                                    <h3 className="text-5xl font-display font-black tracking-tighter text-white uppercase text-center">{dish.name}</h3>
                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {(dish.tags || []).map((tag, i) => (
                                            <span key={i} className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <p className="text-slate-300 text-center font-medium leading-relaxed italic">"{dish.description || '这家伙很懒，没有流传下描述...'}"</p>
                                </div>
                            </DishBackdrop>
                            <div className="p-6 bg-slate-900 dark:bg-primary flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-background-dark/60">Estimated Cost</span>
                                    <span className="text-xl font-display font-black text-white dark:text-background-dark">¥ {dish.price}</span>
                                </div>
                                <button className="bg-white dark:bg-background-dark text-slate-900 dark:text-primary px-3 py-2 rounded-lg font-bold text-sm uppercase tracking-tight shadow-lg text-xs">
                                    {dish.restaurant_name}
                                </button>
                            </div>
                        </div>

                        {/* Swipe direction indicator */}
                        <DirectionIndicator direction="right" opacity={rightOpacity} />
                        <DirectionIndicator direction="left" opacity={leftOpacity} />
                        <DirectionIndicator direction="up" opacity={upOpacity} />
                    </Motion.div>
                ) : (
                    <div className="text-red-500 font-bold">No dishes available!</div>
                )}

                {dish && !loading && (
                    <Motion.div className="w-full grid grid-cols-3 gap-4 px-2" variants={fadeUp}>
                        <Motion.button
                            onClick={() => flyOut('left')}
                            disabled={swipingOut}
                            className="flex flex-col items-center gap-2 group cursor-pointer disabled:pointer-events-none disabled:opacity-60"
                            whileTap={{ scale: 0.94 }}
                            whileHover={{ scale: 1.04 }}
                            transition={springBouncy}
                        >
                            <div className="w-14 h-14 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:bg-red-500/10 hover:border-red-500 transition-all">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500 hover:text-red-500">close</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pass</span>
                        </Motion.button>
                        <Motion.button
                            onClick={() => flyOut('up')}
                            disabled={swipingOut}
                            className="flex flex-col items-center gap-2 group cursor-pointer disabled:pointer-events-none disabled:opacity-60"
                            whileTap={{ scale: 0.94 }}
                            whileHover={{ scale: 1.04 }}
                            transition={springBouncy}
                        >
                            <div className="w-14 h-14 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:bg-blue-500/10 hover:border-blue-500 transition-all">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500 hover:text-blue-500">star</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Save</span>
                        </Motion.button>
                        <Motion.button
                            onClick={() => flyOut('right')}
                            disabled={swipingOut}
                            className="flex flex-col items-center gap-2 group cursor-pointer disabled:pointer-events-none disabled:opacity-60"
                            whileTap={{ scale: 0.94 }}
                            whileHover={{ scale: 1.04 }}
                            transition={springBouncy}
                        >
                            <div className="w-14 h-14 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:bg-primary/10 hover:border-primary transition-all">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary fill-icon hover:text-primary">favorite</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pick</span>
                        </Motion.button>
                    </Motion.div>
                )}
            </Motion.main>
        </div>
    );
}

