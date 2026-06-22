import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Splash() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    
    const handleStart = () => {
        if (isLoggedIn) {
            navigate('/home');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-primary items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 bg-primary z-0"></div>
            <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md">
                <div className="mb-12">
                    <div className="flex items-center justify-center size-24 bg-slate-900 rounded-2xl shadow-2xl">
                        <span className="material-symbols-outlined text-primary text-6xl fill-icon">restaurant</span>
                    </div>
                </div>
                <h1 className="text-slate-900 tracking-tighter text-6xl font-bold leading-tight text-center mb-4 font-display">犹豫就会饿死</h1>
                <div className="w-full aspect-square max-w-[280px] my-8">
                    <div className="relative w-full h-full bg-slate-900 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl rotate-3">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#111827_0%,#7c2d12_56%,#f49d25_100%),linear-gradient(45deg,transparent_0_38%,rgba(255,255,255,0.16)_38%_48%,transparent_48%_100%)]"></div>
                        <div className="absolute -left-10 top-10 h-20 w-[120%] -rotate-12 bg-white/10"></div>
                        <div className="absolute -right-10 bottom-12 h-14 w-[120%] -rotate-12 bg-black/10"></div>
                        <span className="material-symbols-outlined relative z-10 text-primary text-[9rem] drop-shadow-2xl">ramen_dining</span>
                        <span className="material-symbols-outlined absolute bottom-8 right-8 text-white/30 text-5xl">local_fire_department</span>
                    </div>
                </div>
                <p className="text-slate-900 text-2xl font-bold leading-snug tracking-tight text-center max-w-xs mb-12">别想了，再想就饿昏过去了。</p>
                <button onClick={handleStart} className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 px-5 bg-slate-900 text-primary text-xl font-bold leading-normal tracking-wide transition-transform hover:scale-[1.02] active:scale-95 shadow-xl">
                    立即开吃
                </button>
            </div>
        </div>
    );
}
