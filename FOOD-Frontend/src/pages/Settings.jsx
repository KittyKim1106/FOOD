import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { apiClient } from '../api/client';

export default function Settings() {
    const navigate = useNavigate();
    const [flavors, setFlavors] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    
    // We can fetch from API and map them to our UI list.
    const baseFlavors = [
        { id: 'Spicy', label: '重辣 (Spicy)', sub: '拒绝任何形式的辣椒', icon: 'local_fire_department', checked: false },
        { id: 'Sour', label: '酸味 (Sour)', sub: '远离陈醋、柠檬风味', icon: 'nutrition', checked: false },
        { id: 'Raw', label: '生食 (Raw)', sub: '不接受生鱼片或半熟肉类', icon: 'set_meal', checked: false }
    ];
    
    const baseIngredients = [
        { id: 'Cilantro', label: '香菜 (Cilantro)', icon: 'cannabis', checked: false },
        { id: 'Organs', label: '内脏 (Organs)', icon: 'vitals', checked: false },
        { id: 'Garlic', label: '蒜头 (Garlic)', icon: 'circle', checked: false },
        { id: 'Mutton', label: '羊肉 (Mutton)', icon: 'sound_detection_dog_barking', checked: false }
    ];

    const [uiFlavors, setUiFlavors] = useState(baseFlavors);
    const [uiIngredients, setUiIngredients] = useState(baseIngredients);

    useEffect(() => {
        apiClient.getSettings().then(res => {
            const exFlavors = res.excluded_flavors || [];
            const exIngredients = res.excluded_ingredients || [];
            
            setUiFlavors(prev => prev.map(f => ({ ...f, checked: exFlavors.includes(f.id) })));
            setUiIngredients(prev => prev.map(i => ({ ...i, checked: exIngredients.includes(i.id) })));
        }).catch(err => console.error(err));
    }, []);

    const toggleFlavor = (id) => {
        setUiFlavors(prev => prev.map(f => f.id === id ? { ...f, checked: !f.checked } : f));
    }
    const toggleIngredient = (id) => {
        setUiIngredients(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    }

    const saveSettings = async () => {
        const selectedFlavors = uiFlavors.filter(f => f.checked).map(f => f.id);
        const selectedIngredients = uiIngredients.filter(i => i.checked).map(i => i.id);
        await apiClient.updateSettings(selectedFlavors, selectedIngredients);
        navigate('/home');
    }

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            <nav className="flex items-center p-4 justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10 border-b border-primary/10">
                <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-slate-100 flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display uppercase tracking-widest">我的</h2>
                <div className="size-10"></div>
            </nav>
            <main className="flex-1 px-4 space-y-8 pb-24 overflow-y-auto">
                <header className="px-6 pt-8 pb-6 flex flex-col items-center">
                    <div className="mb-4 size-20 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-5xl">person_off</span>
                    </div>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-center font-display">排除地雷</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed mt-2 text-center max-w-xs">勾选后，这些东西将永远从你的美食推荐中消失。</p>
                </header>
                <section className="space-y-3">
                    <div className="flex items-center gap-2 px-2">
                        <span className="material-symbols-outlined text-primary">restaurant_menu</span>
                        <h3 className="text-xl font-bold leading-tight font-display">味道排雷 (Flavors)</h3>
                    </div>
                    <div className="grid gap-2">
                        {uiFlavors.map((item) => (
                            <div key={item.id} onClick={() => toggleFlavor(item.id)} className="flex items-center gap-4 bg-white dark:bg-primary/5 p-4 rounded-xl border border-transparent hover:border-primary/30 transition-all cursor-pointer">
                                <div className="flex items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0 size-12"><span className="material-symbols-outlined">{item.icon}</span></div>
                                <div className="flex-1">
                                    <p className="text-lg font-semibold">{item.label}</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{item.sub}</p>
                                </div>
                                <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full bg-slate-300 dark:bg-slate-700 p-0.5 transition-all duration-200" style={{backgroundColor: item.checked ? '#f49d25': undefined, justifyContent: item.checked ? 'flex-end' : 'flex-start'}}>
                                    <div className="h-full w-[27px] rounded-full bg-white shadow-md pointer-events-none"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="space-y-3">
                    <div className="flex items-center gap-2 px-2">
                        <span className="material-symbols-outlined text-primary">eco</span>
                        <h3 className="text-xl font-bold leading-tight font-display">食材排雷 (Ingredients)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {uiIngredients.map((item) => (
                            <div key={item.id} onClick={() => toggleIngredient(item.id)} className="flex items-center gap-4 bg-white dark:bg-primary/5 p-4 rounded-xl border border-transparent hover:border-primary/30 transition-all cursor-pointer">
                                <div className="flex items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0 size-10"><span className="material-symbols-outlined">{item.icon}</span></div>
                                <p className="text-base font-medium flex-1">{item.label}</p>
                                <label className="relative flex h-[28px] w-[46px] cursor-pointer items-center rounded-full bg-slate-300 dark:bg-slate-700 p-0.5 transition-all duration-200" style={{backgroundColor: item.checked ? '#f49d25': undefined, justifyContent: item.checked ? 'flex-end' : 'flex-start'}}>
                                    <div className="h-full w-[24px] rounded-full bg-white shadow-sm pointer-events-none"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <footer className="p-4 bg-background-light dark:bg-background-dark border-t border-primary/10 sticky bottom-0 z-10 pb-24">
                <button onClick={saveSettings} className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-4 rounded-xl text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                    保存我的喜好 (Save Settings)
                </button>
            </footer>
            <BottomNav activeTab="profile" />
        </div>
    );
}
