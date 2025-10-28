import React from 'react';

interface QuickReplyProps {
  replies: string[];
  onReplyClick: (reply: string) => void;
}

const QuickReply: React.FC<QuickReplyProps> = ({ replies, onReplyClick }) => {
  return (
    <div className="px-4 pb-3 pt-2 border-t border-slate-700 bg-slate-800">
      <div className="flex flex-wrap justify-center gap-2">
        {replies.map((reply, index) => (
          <button
            key={index}
            onClick={() => onReplyClick(reply)}
            className="bg-slate-700 text-sky-300 text-sm font-medium px-4 py-2 rounded-full hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReply;
