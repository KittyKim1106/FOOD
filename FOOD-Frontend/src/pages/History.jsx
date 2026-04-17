import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { apiClient } from '../api/client';

export default function History() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await apiClient.getHistory(50, 0);
            if (res.history) {
                setHistory(res.history);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleFavorite = async (id) => {
        await apiClient.markFavorite(id);
        setHistory(prev => prev.map(h => h.id === id ? { ...h, is_favorite: true } : h));
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-primary/20 p-4 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-primary"><span className="material-symbols-outlined">chevron_left</span></button>
                <h1 className="text-lg font-bold font-display uppercase tracking-widest">History</h1>
                <div className="w-6"></div>
            </header>
            <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
                {loading ? (
                    <div className="text-center py-10 opacity-50">加载中...</div>
                ) : history.length === 0 ? (
                    <div className="text-center py-10 opacity-50">暂无历史记录</div>
                ) : (
                    history.map(item => (
                        <div key={item.id} className={`p-4 bg-white dark:bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-4 ${item.decision === 'rejected' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="size-16 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-3xl">
                                    {item.decision === 'rejected' ? 'close' : 'restaurant'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold truncate">{item.food_name}</h3>
                                <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                            {item.decision === 'accepted' && (
                                <button onClick={() => !item.is_favorite && handleFavorite(item.id)}>
                                    <span className={`material-symbols-outlined ${item.is_favorite ? 'text-primary fill-icon' : 'text-slate-400'}`}>
                                        star
                                    </span>
                                </button>
                            )}
                        </div>
                    ))
                )}
            </main>
            <BottomNav activeTab="history" />
        </div>
    );
}
