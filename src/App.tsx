import Dashboard from './components/Dashboard';

const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Media Archive';
const APP_SUBTITLE = import.meta.env.VITE_APP_SUBTITLE || 'Image Browser';

function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Scanline overlay */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50" />

      {/* Header */}
      <header className="relative bg-dark border-b border-[#222] px-6 py-4">
        <div className="flex flex-col items-center">
          <h1 className="neon-cyan text-2xl md:text-3xl font-bold tracking-wider uppercase">
            {APP_TITLE}
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-mono mt-1 uppercase tracking-widest">
            {APP_SUBTITLE}
          </p>
        </div>

        {/* Decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-50" />
      </header>

      {/* Dashboard */}
      <Dashboard />
    </div>
  );
}

export default App;
