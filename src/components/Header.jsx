export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div className="w-full px-6 py-4 flex items-center gap-3">
        <img 
          src="/image.png" 
          alt="Logo" 
          className="h-10 w-10 object-contain"
        />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Lead Management
        </h2>
      </div>
    </header>
  );
}
