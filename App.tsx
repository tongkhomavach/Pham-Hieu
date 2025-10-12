
import React from 'react';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  return (
    <main className="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
       `}</style>
      <div className="w-full h-[90vh] max-h-[800px]">
        <ChatWindow />
      </div>
      <footer className="text-center mt-4 text-slate-500 text-sm">
        <p>Powered by Google Gemini API. For demonstration purposes.</p>
      </footer>
    </main>
  );
}

export default App;
