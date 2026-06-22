import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { apiClient } from '../api/client';

const categoryConfigs = {
    '肉类': { sub: 'Meat', icon: 'kebab_dining' },
    '海鲜': { sub: 'Seafood', icon: 'set_meal' },
    '蔬菜': { sub: 'Veggies', icon: 'eco' },
    '面条': { sub: 'Noodle', icon: 'ramen_dining' },
    '米饭': { sub: 'Rice', icon: 'rice_bowl' },
    '水果': { sub: 'Fruit', icon: 'nutrition' },
    '甜点': { sub: 'Dessert', icon: 'icecream' },
    '饮品': { sub: 'Drinks', icon: 'local_bar' },
    '零食': { sub: 'Snacks', icon: 'cookie' },
    '火锅': { sub: 'Hotpot', icon: 'hot_tub' },
    '烧烤': { sub: 'BBQ', icon: 'outdoor_grill' },
    '快餐': { sub: 'Fast Food', icon: 'fastfood' }
};

export default function Home() {
    const navigate = useNavigate();
    const [wantedCategories, setWantedCategories] = useState([]);
    const [unwantedCategories, setUnwantedCategories] = useState([]);
    const [intent, setIntent] = useState('想吃');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        apiClient.getCategories().then(res => {
            if (res.categories) {
                // merge with configs
                const loaded = res.categories.map(cat => ({
                    label: cat,
                    sub: categoryConfigs[cat]?.sub || 'Other',
                    icon: categoryConfigs[cat]?.icon || 'restaurant_menu'
                }));
                setCategories(loaded);
                // Setup default selected if empty
                if (wantedCategories.length === 0 && unwantedCategories.length === 0 && loaded.length > 0) {
                    setWantedCategories(loaded.slice(0, 4).map(c => c.label));
                }
            }
        });
    }, [unwantedCategories.length, wantedCategories.length]);

    const toggle = (item) => {
        if (intent === '想吃') {
            if (wantedCategories.includes(item)) {
                setWantedCategories(wantedCategories.filter(i => i !== item));
            } else {
                setUnwantedCategories(unwantedCategories.filter(i => i !== item));
                setWantedCategories([...wantedCategories, item]);
            }
        } else {
            if (unwantedCategories.includes(item)) {
                setUnwantedCategories(unwantedCategories.filter(i => i !== item));
            } else {
                setWantedCategories(wantedCategories.filter(i => i !== item));
                setUnwantedCategories([...unwantedCategories, item]);
            }
        }
    };

    const handleGo = () => {
        localStorage.setItem('temp_intent', intent);
        localStorage.setItem('temp_selected_categories', JSON.stringify(wantedCategories));
        localStorage.setItem('temp_excluded_categories', JSON.stringify(unwantedCategories));
        navigate('/swipe');
    };

    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden bg-background-light dark:bg-background-dark">
            <header className="flex-none z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-primary/20">
                <div className="flex items-center p-4 justify-between max-w-md mx-auto w-full">
                    <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display">今日生存意向调查</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto max-w-md mx-auto w-full p-4 space-y-6 pb-8">
                <section className="space-y-2">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-primary font-display">犹豫就会饿死</h2>
                    <p className="text-slate-500 dark:text-slate-400">生存还是毁灭，取决于你下一口吃什么。</p>
                </section>
                <section className="bg-primary/5 dark:bg-primary/10 p-1 rounded-xl flex gap-1 border border-primary/20">
                    <label className="flex-1 cursor-pointer">
                        <input checked={intent === '想吃'} onChange={() => setIntent('想吃')} className="hidden peer" name="intent" type="radio"/>
                        <div className="flex flex-col items-center justify-center h-14 rounded-lg peer-checked:bg-primary peer-checked:text-white text-slate-500 dark:text-slate-400 transition-all">
                            <span className="font-bold text-sm">想吃</span>
                            <span className="text-[10px] font-medium opacity-80">Want to Eat</span>
                        </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                        <input checked={intent === '不想吃'} onChange={() => setIntent('不想吃')} className="hidden peer" name="intent" type="radio"/>
                        <div className="flex flex-col items-center justify-center h-14 rounded-lg peer-checked:bg-primary peer-checked:text-white text-slate-500 dark:text-slate-400 transition-all">
                            <span className="font-bold text-sm">不想吃</span>
                            <span className="text-[10px] font-medium opacity-80">Don't Eat</span>
                        </div>
                    </label>
                </section>
                <div className="grid gap-3 grid-cols-3">
                    {categories.map((cat, i) => {
                        const isWanted = wantedCategories.includes(cat.label);
                        const isUnwanted = unwantedCategories.includes(cat.label);
                        const isFaded = (intent === '想吃' && isUnwanted) || (intent === '不想吃' && isWanted);

                        let cardStyle = "border-slate-200 hover:border-primary/50 dark:border-primary/20 bg-white dark:bg-primary/5";
                        let iconEl = <input readOnly checked={false} className="rounded border-slate-300 bg-transparent size-3.5" type="checkbox"/>;

                        if (isWanted) {
                            cardStyle = "border-primary ring-1 ring-primary bg-primary/5";
                            iconEl = <span className="material-symbols-outlined text-primary text-base font-bold leading-none select-none">check_circle</span>;
                        } else if (isUnwanted) {
                            cardStyle = "border-red-500 ring-1 ring-red-500 bg-red-50 dark:bg-red-500/10";
                            iconEl = <span className="material-symbols-outlined text-red-500 text-base font-bold leading-none select-none">cancel</span>;
                        }

                        if (isFaded) {
                            cardStyle += " opacity-40 hover:opacity-80 grayscale-[30%]";
                        }

                        return (
                            <div key={i} 
                                    onClick={() => toggle(cat.label)}
                                    className={`group relative flex flex-col gap-1 rounded-xl border p-2 transition-all cursor-pointer ${cardStyle}`}>
                                <div className="flex justify-between items-start">
                                    <span className={`material-symbols-outlined text-xl ${isUnwanted ? 'text-red-500' : 'text-primary'}`}>{cat.icon}</span>
                                    {iconEl}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className={`text-sm font-bold`}>{cat.label}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">{cat.sub}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button onClick={handleGo} className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl text-xl font-black tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    决定 GoGoGo! <span className="material-symbols-outlined">rocket_launch</span>
                </button>
            </main>
            <BottomNav activeTab="home" />
        </div>
    );
}
