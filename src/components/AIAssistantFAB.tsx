import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AIAssistantChat from './AIAssistantChat';

const AIAssistantFAB: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-[60] flex flex-col items-end gap-4">
      {isOpen && (
        <div className="mb-2 animate-in slide-in-from-bottom-4 duration-300">
          <AIAssistantChat onClose={() => setIsOpen(false)} />
        </div>
      )}
      <Button
        size="lg"
        className={`rounded-full h-14 w-14 shadow-xl transition-all duration-300 ${
          isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-600 hover:bg-yellow-700'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </Button>
    </div>
  );
};

export default AIAssistantFAB;