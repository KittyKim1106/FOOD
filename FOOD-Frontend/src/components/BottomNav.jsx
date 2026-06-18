import { Link } from 'react-router-dom';

export default function BottomNav({ activeTab }) {
    return (
        <nav className="flex-none max-w-md mx-auto w-full flex gap-2 border-t border-primary/10 bg-white dark:bg-[#27221b] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 z-20">
            <Link to="/home" className={`flex flex-1 flex-col items-center justify-center gap-1 ${activeTab === 'home' ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                <span className={`material-symbols-outlined ${activeTab === 'home' ? 'fill-icon' : ''}`}>home</span>
                <p className="text-[10px] font-bold uppercase tracking-widest">Home</p>
            </Link>
            <Link to="/swipe" className={`flex flex-1 flex-col items-center justify-center gap-1 ${activeTab === 'decision' ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                <span className={`material-symbols-outlined ${activeTab === 'decision' ? 'fill-icon' : ''}`}>explore</span>
                <p className="text-[10px] font-bold uppercase tracking-widest">Decision</p>
            </Link>
            <Link to="/history" className={`flex flex-1 flex-col items-center justify-center gap-1 ${activeTab === 'history' ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                <span className={`material-symbols-outlined ${activeTab === 'history' ? 'fill-icon' : ''}`}>history</span>
                <p className="text-[10px] font-bold uppercase tracking-widest">History</p>
            </Link>
            <Link to="/settings" className={`flex flex-1 flex-col items-center justify-center gap-1 ${activeTab === 'profile' ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                <span className={`material-symbols-outlined ${activeTab === 'profile' ? 'fill-icon' : ''}`}>person</span>
                <p className="text-[10px] font-bold uppercase tracking-widest">Profile</p>
            </Link>
        </nav>
    );
}
