import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

export default function Swipe() {
    const navigate = useNavigate();
    const [dish, setDish] = useState(null);
    const [confidence, setConfidence] = useState(0);
    const [loading, setLoading] = useState(true);

    // Swipe gesture state
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [swipingOut, setSwipingOut] = useState(null); // 'left' | 'right' | 'up' | null
    const startPos = useRef({ x: 0, y: 0 });
    const startTime = useRef(0);
    const cardRef = useRef(null);

    const intent = localStorage.getItem('temp_intent') || '想吃';
    const selectedCategories = JSON.parse(localStorage.getItem('temp_selected_categories') || '[]');
    const excludedCategories = JSON.parse(localStorage.getItem('temp_excluded_categories') || '[]');

    const fetchNext = async () => {
        setLoading(true);
        setDragOffset({ x: 0, y: 0 });
        setSwipingOut(null);
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
    };

    useEffect(() => {
        fetchNext();
    }, []);

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
    }, [dish, confidence, navigate]);

    // Touch handlers
    const onTouchStart = (e) => {
        if (swipingOut || loading) return;
        const touch = e.touches[0];
        startPos.current = { x: touch.clientX, y: touch.clientY };
        startTime.current = Date.now();
        setIsDragging(true);
    };

    const onTouchMove = (e) => {
        if (!isDragging || swipingOut) return;
        const touch = e.touches[0];
        const dx = touch.clientX - startPos.current.x;
        const dy = touch.clientY - startPos.current.y;
        setDragOffset({ x: dx, y: dy });
    };

    const onTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const elapsed = Date.now() - startTime.current;
        const velocity = Math.sqrt(dragOffset.x ** 2 + dragOffset.y ** 2) / elapsed;
        const isFastSwipe = velocity > SWIPE_VELOCITY_THRESHOLD;
        const isFarSwipe = Math.abs(dragOffset.x) > SWIPE_THRESHOLD || Math.abs(dragOffset.y) > SWIPE_THRESHOLD;

        if (isFarSwipe || isFastSwipe) {
            // Determine direction
            if (Math.abs(dragOffset.x) > Math.abs(dragOffset.y)) {
                // Horizontal swipe
                if (dragOffset.x > 0) {
                    flyOut('right');
                } else {
                    flyOut('left');
                }
            } else {
                // Vertical swipe
                if (dragOffset.y < 0) {
                    flyOut('up');
                } else {
                    // Swipe down = reset
                    setDragOffset({ x: 0, y: 0 });
                }
            }
        } else {
            // Snap back
            setDragOffset({ x: 0, y: 0 });
        }
    };

    const flyOut = (direction) => {
        setSwipingOut(direction);
        const actionMap = { left: 'pass', right: 'pick', up: 'save' };
        setTimeout(() => {
            handleAction(actionMap[direction]);
        }, 300);
    };

    // Card transform style
    const getCardStyle = () => {
        if (swipingOut) {
            const flyDistance = 600;
            const flyMap = {
                left: { x: -flyDistance, y: 0, rotate: -30 },
                right: { x: flyDistance, y: 0, rotate: 30 },
                up: { x: 0, y: -flyDistance, rotate: 0 },
            };
            const fly = flyMap[swipingOut];
            return {
                transform: `translateX(${fly.x}px) translateY(${fly.y}px) rotate(${fly.rotate}deg)`,
                opacity: 0,
                transition: 'transform 300ms ease, opacity 300ms ease',
            };
        }
        if (isDragging || (dragOffset.x !== 0 || dragOffset.y !== 0)) {
            const rotate = dragOffset.x * 0.08;
            return {
                transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotate}deg)`,
                transition: isDragging ? 'none' : 'transform 300ms ease',
            };
        }
        return {
            transform: 'translateX(0) translateY(0) rotate(0deg)',
            transition: 'transform 300ms ease',
        };
    };

    // Direction indicator overlay
    const getIndicator = () => {
        if (!isDragging) return null;
        const absX = Math.abs(dragOffset.x);
        const absY = Math.abs(dragOffset.y);
        const threshold = 50;

        if (absX < threshold && absY < threshold) return null;

        if (absX > absY) {
            if (dragOffset.x > 0) {
                return (
                    <div className="absolute inset-0 rounded-xl border-4 border-green-500 bg-green-500/10 z-20 flex items-center justify-center pointer-events-none">
                        <span className="material-symbols-outlined text-green-500 text-7xl drop-shadow-lg">favorite</span>
                    </div>
                );
            }
            return (
                <div className="absolute inset-0 rounded-xl border-4 border-red-500 bg-red-500/10 z-20 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-red-500 text-7xl drop-shadow-lg">close</span>
                </div>
            );
        }
        if (dragOffset.y < 0) {
            return (
                <div className="absolute inset-0 rounded-xl border-4 border-blue-500 bg-blue-500/10 z-20 flex items-center justify-center pointer-events-none">
                    <span className="material-symbols-outlined text-blue-500 text-7xl drop-shadow-lg">star</span>
                </div>
            );
        }
        return null;
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
            <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 max-w-md mx-auto w-full">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-display font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-100">看着不错，要不就它了？</h2>
                    <p className="text-slate-500 dark:text-primary/60 font-medium uppercase tracking-widest text-xs">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">swipe</span>
                        Swipe to Decide
                    </p>
                </div>

                {loading ? (
                    <div className="w-full aspect-[4/5] flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-primary text-6xl">refresh</span>
                    </div>
                ) : dish ? (
                    <div
                        ref={cardRef}
                        className="relative w-full aspect-[4/5] touch-none select-none"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        style={getCardStyle()}
                    >
                        {/* Background cards */}
                        <div className="absolute inset-0 bg-primary/10 rounded-xl rotate-3 scale-95 border-2 border-primary/20"></div>
                        <div className="absolute inset-0 bg-primary/20 rounded-xl -rotate-2 scale-[0.97] border-2 border-primary/30"></div>

                        {/* Main card */}
                        <div className="relative h-full w-full bg-slate-100 dark:bg-background-dark border-4 border-slate-900 dark:border-primary rounded-xl overflow-hidden shadow-2xl flex flex-col">
                            <div className="flex-1 relative bg-slate-200 dark:bg-zinc-800/50 flex flex-col items-center justify-center p-8 overflow-hidden bg-cover bg-center" style={{backgroundImage: `linear-gradient(to bottom, rgba(39,34,27,0.8), rgba(39,34,27,0.9)), url('${dish.image_url}')`}}>
                                <div className="relative z-10 flex flex-col items-center gap-6">
                                    <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(244,157,37,0.4)] overflow-hidden border-4 border-primary">
                                        {dish.image_url ? (
                                            <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-background-dark text-6xl fill-icon">restaurant_menu</span>
                                        )}
                                    </div>
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
                            </div>
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
                        {getIndicator()}
                    </div>
                ) : (
                    <div className="text-red-500 font-bold">No dishes available!</div>
                )}

                {dish && !loading && (
                    <div className="w-full grid grid-cols-3 gap-4 px-2">
                        <button onClick={() => handleAction('pass')} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform">
                            <div className="w-14 h-14 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:bg-red-500/10 hover:border-red-500 transition-all">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500 hover:text-red-500">close</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pass</span>
                        </button>
                        <button onClick={() => handleAction('save')} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform">
                            <div className="w-14 h-14 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:bg-blue-500/10 hover:border-blue-500 transition-all">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500 hover:text-blue-500">star</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Save</span>
                        </button>
                        <button onClick={() => handleAction('pick')} className="flex flex-col items-center gap-2 group cursor-pointer active:scale-95 transition-transform">
                            <div className="w-14 h-14 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:bg-primary/10 hover:border-primary transition-all">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary fill-icon hover:text-primary">favorite</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pick</span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
