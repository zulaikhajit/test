export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div className="w-full px-6 py-4 flex items-center gap-3">
        <img 
          src="https://tse1.mm.bing.net/th/id/OIP.3UvXxgvgwIjQvoTX5JGLAQAAAA?pid=Api&P=0&h=220" 
          alt="Logo" 
          className="h-20 w-20 object-contain"
        />
        <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-500">
          Lead Management 
        </h2>
      </div>
    </header>
  );
}
