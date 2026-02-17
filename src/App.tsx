import Header from "./components/Header";
import Form from "./components/Form";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="flex-1 w-full p-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-4xl font-bold text-blue-600 dark:text-blue-500 mb-2">
             Casagrand Leads View Interface
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
            <Form />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
