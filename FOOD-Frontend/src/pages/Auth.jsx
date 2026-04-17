import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { login, register, isLoading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Please fill in all fields');
            return;
        }

        let res;
        if (isLogin) {
            res = await login(username, password);
        } else {
            res = await register(username, password, email);
        }

        if (res.success) {
            navigate('/home');
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <header className="p-4 flex items-center">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-primary transition-colors flex size-12 items-center justify-start">
                    <span className="material-symbols-outlined text-3xl">chevron_left</span>
                </button>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-4 w-full max-w-md mx-auto">
                <div className="mb-10 w-full">
                    <div className="inline-flex items-center justify-center size-20 bg-primary/20 rounded-2xl mb-6">
                        <span className="material-symbols-outlined text-primary text-5xl fill-icon">restaurant_menu</span>
                    </div>
                    <h1 className="text-4xl font-display font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-2">
                        {isLogin ? 'Welcome Back' : 'Join the Feast'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-widest uppercase">
                        Hesitate and Starve
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-bold text-center">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required
                            className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-primary/20 rounded-xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                    </div>
                    
                    {!isLogin && (
                        <div>
                            <input type="email" placeholder="Email (Optional)" value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-primary/20 rounded-xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                        </div>
                    )}
                    
                    <div>
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                            className="w-full bg-white dark:bg-card-dark border border-slate-200 dark:border-primary/20 rounded-xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                    </div>

                    <button type="submit" disabled={isLoading}
                        className="w-full mt-4 bg-primary hover:bg-primary/90 text-background-dark font-display font-black text-lg py-4 rounded-xl shadow-[0_8px_0_rgb(180,110,20)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-tighter disabled:opacity-50 disabled:shadow-none disabled:translate-y-1">
                        {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} type="button" className="text-slate-500 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors">
                        {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                    </button>
                </div>
            </main>
        </div>
    );
}
