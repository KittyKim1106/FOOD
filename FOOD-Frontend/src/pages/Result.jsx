import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { DishAvatar, DishBackdrop } from '../components/DishVisual';
import { apiClient } from '../api/client';

export default function Result() {
    const navigate = useNavigate();
    const dish = JSON.parse(localStorage.getItem('final_dish') || 'null');
    const confidence = parseFloat(localStorage.getItem('final_confidence') || '0');

    const [nearbyData, setNearbyData] = useState(null);
    const [loadingNearby, setLoadingNearby] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [showNearby, setShowNearby] = useState(false);

    const requestNearby = () => {
        if (!dish) return;
        setLoadingNearby(true);
        setLocationError(null);
        setShowNearby(true);

        if (!navigator.geolocation) {
            setLocationError('您的浏览器不支持定位功能');
            setLoadingNearby(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await apiClient.getNearbyMerchants(dish.id, latitude, longitude, 10);
                    setNearbyData(res);
                } catch (err) {
                    setLocationError('查询附近商家失败: ' + err.message);
                } finally {
                    setLoadingNearby(false);
                }
            },
            () => {
                setLocationError('无法获取位置信息，请允许定位权限');
                setLoadingNearby(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    if (!dish) {
        return (
            <div className="min-h-screen bg-background-dark text-white flex flex-col items-center justify-center">
                <h2>No result... taking you back</h2>
                <button onClick={() => navigate('/home')} className="mt-4 p-2 bg-primary rounded">Home</button>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <header className="flex items-center bg-background-light dark:bg-background-dark p-4 sticky top-0 z-10 border-b border-primary/10 justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h1 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display uppercase tracking-widest">Hesitate and Starve</h1>
                <button onClick={() => navigate('/history')} className="p-2 -mr-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">history</span>
                </button>
            </header>
            <main className="flex-1 flex flex-col px-4 py-8 max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                    <h2 className="text-primary tracking-tighter text-4xl font-extrabold leading-tight mb-2 font-display">今日钦定：</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-widest uppercase">The Heavens Have Spoken</p>
                </div>
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-white dark:bg-[#27221b] border border-primary/20 rounded-xl overflow-hidden shadow-2xl">
                        <DishBackdrop dish={dish} className="aspect-[4/5] p-8">
                            <div className="absolute top-4 left-4">
                                <span className="bg-primary text-background-dark px-3 py-1 rounded-full text-xs font-black tracking-tighter uppercase">Selected</span>
                            </div>
                            <div className="flex h-full flex-col items-center justify-center text-center w-full px-2">
                                <DishAvatar dish={dish} className="mb-4 h-16 w-16" />
                                <h3 className="text-white text-5xl font-black mb-4 tracking-tighter drop-shadow-2xl">【{dish.name}】</h3>
                                <p className="text-primary text-xl font-bold italic tracking-wide">{dish.restaurant_name}</p>
                            </div>
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="flex items-center justify-between border-t border-white/20 pt-6">
                                    <div className="flex flex-col">
                                        <span className="text-white/60 text-xs uppercase font-bold tracking-widest">Confidence</span>
                                        <span className="text-white font-display font-bold">{(confidence * 100).toFixed(1)}% Match</span>
                                    </div>
                                    <button onClick={() => navigate('/swipe')} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-lg border border-white/20 transition-colors">
                                        <span className="material-symbols-outlined">refresh</span>
                                    </button>
                                </div>
                            </div>
                        </DishBackdrop>
                    </div>
                </div>

                {/* 附近商家按钮 */}
                <div className="mt-10 space-y-4">
                    <button
                        onClick={requestNearby}
                        disabled={loadingNearby}
                        className="w-full flex items-center justify-center gap-3 rounded-xl h-16 px-6 bg-primary text-background-dark text-lg font-black leading-normal tracking-tight shadow-lg shadow-primary/20 active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {loadingNearby ? (
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                        ) : (
                            <span className="material-symbols-outlined">location_on</span>
                        )}
                        <span className="truncate">{loadingNearby ? '正在查找附近商家...' : '附近哪有卖？'}</span>
                    </button>
                </div>

                {/* 附近商家列表 */}
                {showNearby && !loadingNearby && (
                    <div className="mt-6 space-y-3">
                        {locationError && (
                            <div className="text-center text-red-400 text-sm bg-red-500/10 rounded-xl p-4">
                                <span className="material-symbols-outlined text-2xl block mb-2">location_off</span>
                                {locationError}
                            </div>
                        )}

                        {nearbyData && nearbyData.merchants.length === 0 && (
                            <div className="text-center text-slate-400 text-sm bg-slate-500/10 rounded-xl p-4">
                                <span className="material-symbols-outlined text-2xl block mb-2">store_off</span>
                                附近暂无提供该菜品的商家
                            </div>
                        )}

                        {nearbyData && nearbyData.merchants.map((item) => (
                            <div key={item.merchant.id} className="bg-white dark:bg-[#27221b] border border-primary/10 rounded-xl p-4 shadow-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{item.merchant.name}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                item.merchant.service_type === 'delivery' ? 'bg-blue-500/20 text-blue-400' :
                                                item.merchant.service_type === 'dine_in' ? 'bg-green-500/20 text-green-400' :
                                                'bg-purple-500/20 text-purple-400'
                                            }`}>
                                                {item.merchant.service_type === 'delivery' ? '外卖' :
                                                 item.merchant.service_type === 'dine_in' ? '到店' : '外卖+到店'}
                                            </span>
                                        </div>
                                        {item.merchant.address && (
                                            <p className="text-slate-400 text-sm flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">place</span>
                                                {item.merchant.address}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        {item.merchant.distance_km != null && (
                                            <span className="text-primary font-display font-bold text-sm">
                                                {item.merchant.distance_km < 1
                                                    ? `${(item.merchant.distance_km * 1000).toFixed(0)}m`
                                                    : `${item.merchant.distance_km.toFixed(1)}km`}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-primary text-sm">star</span>
                                            <span className="text-slate-400 text-xs">{item.merchant.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                {item.dish_price != null && (
                                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <span className="text-slate-400 text-xs">该店价格</span>
                                        <span className="text-primary font-display font-bold">¥ {item.dish_price}</span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {nearbyData && nearbyData.total > 0 && (
                            <p className="text-center text-slate-500 text-xs mt-2">
                                共找到 {nearbyData.total} 家附近商家
                            </p>
                        )}
                    </div>
                )}
            </main>
            <BottomNav activeTab="decision" />
        </div>
    );
}
