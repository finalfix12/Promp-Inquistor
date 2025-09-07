
import React, { useState } from 'react';
import { HistoryItem } from '../App';
import { CopyIcon, CheckIcon, TrashIcon } from './icons';
import { AnalysisItem } from '../services/geminiService';

interface HistoryProps {
    history: HistoryItem[];
    onClear: () => void;
}

const AttackAnalysisDisplay: React.FC<{ analysis: AnalysisItem[] }> = ({ analysis }) => {
  if (!analysis || analysis.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
        <h5 className="text-sm text-green-500">// Attack Analysis:</h5>
        {analysis.map((item, index) => (
          <div key={index} className="border-l-2 border-green-800 pl-3 text-sm">
            <h6 className="font-semibold text-green-400">{item.technique}</h6>
            <p className="text-xs text-green-600 mt-1">{item.reasoning}</p>
            <blockquote className="mt-2 p-2 text-xs bg-black/50 border border-gray-700 rounded-md text-green-400 whitespace-pre-wrap break-words">
              "{item.excerpt}"
            </blockquote>
          </div>
        ))}
      </div>
  );
};


const HistoryDisplayItem: React.FC<{ item: HistoryItem }> = ({ item }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(item.result.prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const hasPlaceholders = item.placeholderValues && Object.keys(item.placeholderValues).length > 0;
    
    return (
        <details className="bg-gray-900/50 border border-green-800/60 rounded-md overflow-hidden transition-all duration-300 open:shadow-[0_0_15px_rgba(0,255,128,0.1)]">
            <summary className="p-3 cursor-pointer hover:bg-gray-800/70 list-none flex justify-between items-center font-semibold text-green-300 w-full">
                <div className="flex items-center flex-grow min-w-0">
                    <div className="truncate pr-2 text-sm">
                        {item.steps.map((step, index) => (
                            step.goal && (
                                <span key={step.id}>
                                    <span className="text-green-600 font-semibold">{`Step ${index + 1}: `}</span>
                                    <span className="text-green-400/80">{step.goal}</span>
                                    {index < item.steps.filter(s => s.goal).length - 1 && <span className="text-green-700 mx-1">-&gt;</span>}
                                </span>
                            )
                        ))}
                    </div>
                    <span className="ml-2 flex-shrink-0 px-2 py-0.5 text-xs bg-green-900/70 text-green-300 border border-green-700 rounded-full">
                        {item.targetModel}
                    </span>
                </div>
                 <span className="text-xs text-green-700 ml-2 transition-opacity duration-300 group-open:opacity-0 flex-shrink-0">[show]</span>

            </summary>
            <div className="p-4 border-t border-green-800/60">
                {hasPlaceholders && (
                    <div className="mb-4">
                        <h4 className="text-sm text-green-500 mb-2">// Variables Used:</h4>
                        <div className="p-3 bg-black/50 border border-gray-700 rounded-md text-xs space-y-1">
                            {Object.entries(item.placeholderValues!).map(([key, value]) =>(
                                <div key={key}>
                                    <span className="text-green-600">{`{{${key}}}`}</span>
                                    <span className="text-green-700 mx-1">-&gt;</span>
                                    <span className="text-green-400 break-all">{`"${value}"`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm text-green-500">// Generated Prompt:</h4>
                    <button
                        onClick={handleCopy}
                        className="flex items-center px-2 py-1 text-xs bg-gray-800 text-green-400 border border-green-700 rounded-md hover:bg-green-900/50 transition-colors duration-200"
                    >
                        {isCopied ? (
                            <>
                                <CheckIcon className="w-3 h-3 mr-1.5" />
                                Copied
                            </>
                        ) : (
                            <>
                                <CopyIcon className="w-3 h-3 mr-1.5" />
                                Copy
                            </>
                        )}
                    </button>
                </div>
                <pre className="w-full p-3 bg-black/50 text-green-400 rounded-md whitespace-pre-wrap break-words overflow-x-auto text-sm">
                    <code>{item.result.prompt}</code>
                </pre>
                <AttackAnalysisDisplay analysis={item.result.analysis} />
            </div>
        </details>
    );
};


const History: React.FC<HistoryProps> = ({ history, onClear }) => {
    return (
        <div className="w-full mt-12 p-4 bg-black border border-green-700/50 rounded-lg shadow-[0_0_20px_rgba(0,255,128,0.15)]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl text-green-300">// Generation Log</h3>
                <button
                    onClick={onClear}
                    className="flex items-center px-3 py-1 bg-red-900/50 text-red-400 border border-red-700 rounded-md hover:bg-red-800/50 hover:text-red-300 transition-colors duration-200"
                    aria-label="Clear history"
                >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Clear Log
                </button>
            </div>
            <div className="space-y-2">
                {history.map(item => (
                    <HistoryDisplayItem key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default History;
