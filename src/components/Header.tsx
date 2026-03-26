export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div className="w-full px-3 py-5 flex items-center gap-3">
        <img 
          // src="https://tse1.mm.bing.net/th/id/OIP.3UvXxgvgwIjQvoTX5JGLAQAAAA?pid=Api&P=0&h=220" 
          src="https://tse1.mm.bing.net/th/id/OIP.3UvXxgvgwIjQvoTX5JGLAQAAAA?pid=Api&P=0&h=220"
          alt="Logo"


    className="h-12 w-auto object-contain"

        />
        <h5 className="text-2xl font-semibold text-blue-700 dark:text-blue-700" style={{display:"flex", justifyContent:"end"}}>
          Lead Management 
        </h5>
      </div>
    </header>
  );
}
