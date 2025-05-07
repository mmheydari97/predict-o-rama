import React from 'react';
import { Check, X, Info } from 'lucide-react';
import { Button } from '../ui/shadcn-stubs';

// Simple Message Box Component (Slightly improved styling)
const MessageBox = ({ message, type = 'error', onClose }) => {
  if (!message) return null;
  const styles = {
    error: "bg-destructive/10 border-destructive/50 text-destructive",
    info: "bg-blue-500/10 border-blue-500/50 text-blue-400", // Keep info style
    success: "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" // Added success style
  };
  const Icon = type === 'error' ? X : (type === 'success' ? Check : Info); // Choose icon based on type

  return (
    <div className={`border p-4 rounded-lg relative mb-4 text-sm ${styles[type]} flex items-center justify-between gap-3 shadow-sm animate-fadeIn`}>
       <div className="flex items-center gap-2">
         <Icon className="h-5 w-5 flex-shrink-0" />
         <span>{message}</span>
       </div>
      {onClose && (
        <Button onClick={onClose} variant="ghost" size="icon" className="text-inherit hover:bg-inherit hover:opacity-75 h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default MessageBox;
