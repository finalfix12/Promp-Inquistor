import React, { useMemo } from 'react';
import CodeBlock from './CodeBlock';

interface SimulationResultProps {
  modelName: string;
  response: string | null;
  isLoading: boolean;
  error: string | null;
}

const SimulationResult: React.FC<SimulationResultProps> = ({ modelName, response, isLoading, error }) => {
  const parsedResponse = useMemo(() => {
    if (!response) return [];
    
    const parts = response.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part) => {
      if (!part) return null;
      const codeBlockMatch = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
      if (codeBlockMatch) {
        const content = codeBlockMatch[2] || '';
        if (!content.trim()) return null;
        return {
          type: 'code',
          language: codeBlockMatch[1] || 'plaintext',
          content: content,
        };
      } else {
         if (!part.trim()) return null;
        return {
          type: 'text',
          content: part,
        };
      }
    }).filter((p): p is NonNullable<typeof p> => p !== null);
  }, [response]);

  return (
    <div className="w-full mt-6 p-4 bg-black border border-green-700/50 rounded-lg shadow-[0_0_20px_rgba(0,255,128,0.1)] animate-fade-in">
        <h3 className="text-lg text-green-300 mb-2">// Simulated Response from <span className="font-bold text-green-200">{modelName}</span>:</h3>
        <div className="w-full p-4 bg-gray-900/70 text-green-400 rounded-md min-h-[120px] flex items-center justify-center">
            {isLoading && (
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-3 text-sm text-green-500">Awaiting response...</p>
                </div>
            )}
            {error && (
                <div className="text-red-500 bg-red-900/20 border border-red-500 rounded-md p-3 text-sm">
                    <strong>Simulation Failed:</strong> {error}
                </div>
            )}
            {!isLoading && !error && response && (
                <div className="w-full whitespace-pre-wrap break-words">
                    {parsedResponse.map((part, index) => {
                        if (part.type === 'code') {
                            return <CodeBlock key={index} language={part.language} code={part.content} />;
                        }
                        return <span key={index}>{part.content}</span>;
                    })}
                </div>
            )}
             {!isLoading && !error && !response && (
                <div className="text-center text-green-600">
                    <p>Click "Test Prompt" to see how <span className="font-semibold text-green-500">{modelName}</span> might respond.</p>
                </div>
            )}
        </div>
    </div>
  )
};

export default SimulationResult;