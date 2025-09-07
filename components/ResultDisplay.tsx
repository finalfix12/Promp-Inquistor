import React, { useState, useEffect, useMemo } from 'react';
import { CopyIcon, CheckIcon, CompareIcon, PlayIcon } from './icons';
import CodeBlock from './CodeBlock';
import { GeneratedResult, AnalysisItem } from '../services/geminiService';

interface ResultDisplayProps {
  result: GeneratedResult;
  onCompareClick: () => void;
  onTestClick: () => void;
  isSimulating: boolean;
}

const AttackAnalysis: React.FC<{ analysis: AnalysisItem[] }> = ({ analysis }) => {
  if (!analysis || analysis.length === 0) return null;

  return (
    <details className="mt-4 bg-gray-900/50 border border-green-800/60 rounded-md overflow-hidden transition-all duration-300 group">
      <summary className="p-3 cursor-pointer hover:bg-gray-800/70 list-none flex justify-between items-center font-semibold text-green-300">
        // Attack Analysis
        <span className="text-green-600 transition-transform duration-300 transform group-open:rotate-90 ml-2">&gt;</span>
      </summary>
      <div className="p-4 border-t border-green-800/60 bg-black/30 space-y-4">
        {analysis.map((item, index) => (
          <div key={index} className="border-l-2 border-green-700 pl-3">
            <h5 className="font-bold text-green-300">{item.technique}</h5>
            <p className="text-sm text-green-500 mt-1">{item.reasoning}</p>
            <blockquote className="mt-2 p-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-green-400 whitespace-pre-wrap break-words">
              "{item.excerpt}"
            </blockquote>
          </div>
        ))}
      </div>
    </details>
  );
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onCompareClick, onTestClick, isSimulating }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { prompt, analysis } = result;

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
  };

  const parsedPrompt = useMemo(() => {
    if (!prompt) return [];
    
    // Split by ``` blocks, keeping the delimiter
    const parts = prompt.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part) => {
      if (!part) return null;
      // Check if the part is a code block
      const codeBlockMatch = part.match(/^```(\w*)\n?([\s\S]*?)```$/);
      if (codeBlockMatch) {
        const content = codeBlockMatch[2] || '';
        // Don't render empty code blocks
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
    // Fix: A type predicate's type must be assignable to its parameter's type. The original type was incorrect.
    // Using `NonNullable<typeof p>` provides a correct and robust type guard.
    }).filter((p): p is NonNullable<typeof p> => p !== null);
  }, [prompt]);


  return (
    <div className="w-full mt-8 p-4 bg-black border border-green-700/50 rounded-lg shadow-[0_0_20px_rgba(0,255,128,0.15)] relative">
      <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
        <h3 className="text-lg text-green-300">// Generated Injection Prompt:</h3>
        <div className="flex items-center gap-2">
           <button
            onClick={onTestClick}
            disabled={isSimulating}
            className="flex items-center px-3 py-1 bg-gray-800 text-green-400 border border-green-700 rounded-md hover:bg-green-900/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            {isSimulating ? 'Testing...' : 'Test Prompt'}
          </button>
           <button
            onClick={onCompareClick}
            className="flex items-center px-3 py-1 bg-gray-800 text-green-400 border border-green-700 rounded-md hover:bg-green-900/50 transition-colors duration-200"
          >
            <CompareIcon className="w-4 h-4 mr-2" />
            Compare Models
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center px-3 py-1 bg-gray-800 text-green-400 border border-green-700 rounded-md hover:bg-green-900/50 transition-colors duration-200"
          >
            {isCopied ? (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4 mr-2" />
                Copy All
              </>
            )}
          </button>
        </div>
      </div>
       <div className="w-full p-4 bg-gray-900/70 text-green-400 rounded-md whitespace-pre-wrap break-words">
        {parsedPrompt.map((part, index) => {
            if (part.type === 'code') {
                return <CodeBlock key={index} language={part.language} code={part.content} />;
            }
            return <span key={index}>{part.content}</span>;
        })}
      </div>
      <AttackAnalysis analysis={analysis} />
    </div>
  );
};

export default ResultDisplay;