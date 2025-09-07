
import React, { useState, useEffect, useCallback } from 'react';
import { generateInjectionPrompt, AVAILABLE_MODELS } from '../services/geminiService';
import { CopyIcon, CheckIcon } from './icons';
import { PromptStep } from '../App';

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    steps: PromptStep[];
    placeholderValues: Record<string, string>;
    initialPrompt: string;
    initialModel: string;
}

interface Result {
    prompt: string;
    error: string | null;
    isLoading: boolean;
}

const LOCAL_STORAGE_KEY = 'prompt-inquisitor-selected-models';

const ResultCard: React.FC<{ model: string; result: Result }> = ({ model, result }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!result.prompt) return;
        navigator.clipboard.writeText(result.prompt);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-gray-900/50 border border-green-800/60 rounded-md">
            <div className="flex justify-between items-center p-3 border-b border-green-800/60">
                <h4 className="font-bold text-green-300">{model}</h4>
                {!result.isLoading && result.prompt && (
                     <button
                        onClick={handleCopy}
                        className="flex items-center px-2 py-1 text-xs bg-gray-800 text-green-400 border border-green-700 rounded-md hover:bg-green-900/50 transition-colors duration-200"
                    >
                        {isCopied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                    </button>
                )}
            </div>
            <div className="p-3 min-h-[100px]">
                {result.isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                {result.error && <p className="text-sm text-red-500">{result.error}</p>}
                {result.prompt && (
                    <pre className="w-full text-green-400 rounded-md whitespace-pre-wrap break-words overflow-x-auto text-sm">
                        <code>{result.prompt}</code>
                    </pre>
                )}
            </div>
        </div>
    )
}


const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, steps, placeholderValues, initialPrompt, initialModel }) => {
    const [selectedModels, setSelectedModels] = useState<Set<string>>(() => {
        try {
            const storedModelsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedModelsJson) {
                const storedModels = new Set<string>(JSON.parse(storedModelsJson));
                storedModels.add(initialModel); // Ensure the latest generated model is included
                return storedModels;
            }
        } catch (error) {
            console.error("Failed to parse selected models from local storage", error);
        }
        // Fallback to just the initial model
        return new Set([initialModel]);
    });
    
    const [results, setResults] = useState<Map<string, Result>>(new Map());
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    // Effect to pre-fill the result for the initial model
    useEffect(() => {
        setResults(prev => new Map(prev).set(initialModel, { prompt: initialPrompt, error: null, isLoading: false }));
    }, [initialPrompt, initialModel]);
    
    // Effect to persist selection changes to localStorage
    useEffect(() => {
        if (!isOpen) return; // Only save when the modal is open and changes are made
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(selectedModels)));
        } catch (error) {
            console.error("Failed to save selected models to local storage", error);
        }
    }, [selectedModels, isOpen]);


    const handleCheckboxChange = (model: string) => {
        setSelectedModels(prev => {
            const newSet = new Set(prev);
            if (newSet.has(model)) {
                newSet.delete(model);
            } else {
                newSet.add(model);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = () => {
        setSelectedModels(new Set(AVAILABLE_MODELS));
    };

    const handleDeselectAll = () => {
        setSelectedModels(new Set());
    };

    const handleGenerate = useCallback(async () => {
        const modelsToGenerate = Array.from(selectedModels).filter(model => !results.has(model) || results.get(model)?.error);
        
        if (modelsToGenerate.length === 0) return;

        setIsGenerating(true);
        
        // Set loading state for models to be generated
        setResults(prev => {
            const newResults = new Map(prev);
            modelsToGenerate.forEach(model => {
                newResults.set(model, { prompt: '', error: null, isLoading: true });
            });
            return newResults;
        });

        const promises = modelsToGenerate.map(async (model) => {
             try {
                let currentPrompt = '';
                for (const step of steps) {
                    if (!step.goal.trim()) continue;

                    const substitutedGoal = step.goal.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
                        return placeholderValues[key] || match;
                    });

                    const result = await generateInjectionPrompt(substitutedGoal, model, currentPrompt);
                    currentPrompt = result.prompt;
                }
                return { model, prompt: currentPrompt, error: null };
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                return { model, prompt: '', error: errorMessage };
            }
        });
        
        const settledResults = await Promise.all(promises);

        setResults(prev => {
            const newResults = new Map(prev);
            settledResults.forEach(({ model, prompt, error }) => {
                // If the prompt is empty and there's no error, set a specific message
                if (!prompt && !error) {
                    newResults.set(model, { prompt: '', error: 'API returned an empty response.', isLoading: false });
                } else {
                    newResults.set(model, { prompt, error, isLoading: false });
                }
            });
            return newResults;
        });
        
        setIsGenerating(false);

    }, [selectedModels, steps, results, placeholderValues]);
    
     const anyModelIsLoading = Array.from(selectedModels).some(m => results.get(m)?.isLoading);
     const hasPlaceholders = placeholderValues && Object.keys(placeholderValues).length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-black border border-green-700/50 rounded-lg shadow-[0_0_30px_rgba(0,255,128,0.2)]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex-shrink-0 p-4 border-b border-green-800/60 flex justify-between items-center">
                    <h2 className="text-xl text-green-300">// Compare Model Outputs</h2>
                    <button onClick={onClose} className="text-green-500 hover:text-red-500 text-2xl">&times;</button>
                </header>
                
                <div className="flex-grow p-4 overflow-y-auto">
                    <div className="mb-4 p-3 bg-gray-900/50 border border-green-800/60 rounded-md">
                        <p className="text-sm text-green-500 mb-2">// Objective Chain:</p>
                        <ol className="list-decimal list-inside text-green-300 space-y-1 text-sm">
                            {steps.map(step => step.goal && <li key={step.id} className="break-words">{step.goal}</li>)}
                        </ol>
                         {hasPlaceholders && (
                            <div className="mt-3 pt-3 border-t border-green-900">
                                <p className="text-sm text-green-500 mb-2">// With Variables:</p>
                                <div className="text-xs space-y-1">
                                    {Object.entries(placeholderValues!).map(([key, value]) =>(
                                        <div key={key}>
                                            <span className="text-green-600">{`{{${key}}}`}</span>
                                            <span className="text-green-700 mx-1">-&gt;</span>
                                            <span className="text-green-400 break-all">{`"${value}"`}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-6 p-3 bg-gray-900/50 border border-green-800/60 rounded-md">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-green-500">// Select models to compare:</p>
                                <span className="text-xs text-green-600">
                                    ({selectedModels.size}/{AVAILABLE_MODELS.length} selected)
                                </span>
                             </div>
                             <div className="flex items-center gap-4">
                                <button onClick={handleSelectAll} className="text-xs text-green-400 hover:text-green-200 hover:underline focus:outline-none">Select All</button>
                                <button onClick={handleDeselectAll} className="text-xs text-green-400 hover:text-green-200 hover:underline focus:outline-none">Deselect All</button>
                             </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {AVAILABLE_MODELS.map(model => (
                                <label key={model} className="flex items-center space-x-2 cursor-pointer text-green-400 hover:text-green-200">
                                    <input
                                        type="checkbox"
                                        checked={selectedModels.has(model)}
                                        onChange={() => handleCheckboxChange(model)}
                                        className="form-checkbox h-4 w-4 bg-gray-800 border-green-700 text-green-500 focus:ring-green-500/50"
                                    />
                                    <span>{model}</span>
                                 </label>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        {Array.from(selectedModels).sort().map(model => {
                            const result = results.get(model) || { prompt: '', error: null, isLoading: false };
                             return <ResultCard key={model} model={model} result={result} />;
                        })}
                    </div>

                </div>

                <footer className="flex-shrink-0 p-4 border-t border-green-800/60 flex justify-end">
                    <button 
                        onClick={handleGenerate}
                        disabled={anyModelIsLoading}
                        className="px-6 py-2 bg-green-500 text-black rounded-md hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 font-bold"
                    >
                        {anyModelIsLoading ? 'Generating...' : 'Generate for Selected'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ComparisonModal;
