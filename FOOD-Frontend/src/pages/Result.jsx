import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function Result() {
    const navigate = useNavigate();
    const dish = JSON.parse(localStorage.getItem('final_dish') || 'null');
    const confidence = parseFloat(localStorage.getItem('final_confidence') || '0');

    if (!dish) {
        return (
            <div className="min-h-screen bg-background-dark text-white flex flex-col items-center justify-center">
                <h2>No result... taking you back</h2>
                <button onClick={()=>navigate('/home')} className="mt-4 p-2 bg-primary rounded">Home</button>
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
                        <div className="aspect-[4/5] relative flex flex-col items-center justify-center p-8 bg-cover bg-center" style={{backgroundImage: `linear-gradient(to bottom, rgba(24,21,17,0.4), rgba(24,21,17,0.9)), url('${dish.image_url}')`}}>
                            <div className="absolute top-4 left-4">
                                <span className="bg-primary text-background-dark px-3 py-1 rounded-full text-xs font-black tracking-tighter uppercase">Selected</span>
                            </div>
                            <div className="text-center z-10 w-full px-2">
                                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-background-dark">
                                    <span className="material-symbols-outlined !text-4xl fill-icon">restaurant_menu</span>
                                </div>
                                <h3 className="text-white text-5xl font-black mb-4 tracking-tighter drop-shadow-2xl">【{dish.name}】</h3>
                                <p className="text-primary text-xl font-bold italic tracking-wide">{dish.restaurant_name}</p>
                            </div>
                            <div className="mt-12 w-full z-10">
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
                        </div>
                    </div>
                </div>
                <div className="mt-10 space-y-4">
                    <button className="w-full flex items-center justify-center gap-3 rounded-xl h-16 px-6 bg-primary text-background-dark text-lg font-black leading-normal tracking-tight shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined">location_on</span>
                        <span className="truncate">附近哪有卖？ (Dummy)</span>
                    </button>
                </div>
            </main>
            <BottomNav activeTab="decision" />
        </div>
    );
}
