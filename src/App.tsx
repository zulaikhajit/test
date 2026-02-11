import React from "react";
import Header from "./components/Header";
import Form from "./components/Form";
import "./App.css";

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="flex-1 w-full flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Lead Query
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Enter your details to submit a query
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
            <Form />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
