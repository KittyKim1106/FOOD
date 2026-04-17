import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function Failure() {
    const navigate = useNavigate();
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
            <header className="flex items-center bg-background-light dark:bg-background-dark p-4 justify-between border-b border-primary/10">
                <button onClick={() => navigate('/home')} className="text-slate-400 flex size-12 items-center justify-start"><span className="material-symbols-outlined">close</span></button>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display">犹豫就会败北</h2>
                <button onClick={() => navigate('/history')} className="text-primary flex size-12 items-center justify-end"><span className="material-symbols-outlined">history</span></button>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="relative mb-8 group">
                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
                    <div className="relative flex items-center justify-center w-64 h-64 bg-gradient-to-br from-background-dark to-black rounded-full border-4 border-primary/30 shadow-2xl overflow-hidden bg-cover">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                        <span className="material-symbols-outlined text-primary text-8xl drop-shadow-[0_0_15px_rgba(244,157,37,0.5)]">air</span>
                    </div>
                </div>
                <div className="max-w-md space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter text-primary font-display">全军覆没！</h1>
                    <p className="text-xl font-medium text-slate-400 dark:text-slate-300 leading-relaxed italic">“喝西北风吧”</p>
                    <div className="pt-4 pb-8 text-sm text-slate-500 max-w-xs mx-auto">没找到符合条件的菜品，请调整您的排雷选项或放宽条件。</div>
                </div>
                <div className="w-full max-w-sm space-y-3">
                    <button onClick={() => navigate('/home')} className="w-full flex items-center justify-center gap-2 rounded-xl h-14 bg-primary text-background-dark text-lg font-bold tracking-wide hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined">refresh</span>
                        <span>大赦天下（重选一次）</span>
                    </button>
                </div>
            </main>
            <BottomNav activeTab="decision" />
        </div>
    );
}
