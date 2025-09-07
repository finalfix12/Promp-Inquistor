import React from 'react';
import { PromptStep } from '../App';
import { SendIcon, PlusIcon, TrashIcon } from './icons';
import { AVAILABLE_MODELS } from '../services/geminiService';
import EmojiEncoder from './EmojiEncoder';
import TemplateLibrary from './TemplateLibrary';

export interface Template {
  name: string;
  description: string;
  steps: string[];
}

interface PromptInputProps {
  promptSteps: PromptStep[];
  onPromptStepChange: (id: string, value: string) => void;
  onAddStep: () => void;
  onRemoveStep: (id: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  targetModel: string;
  setTargetModel: (model: string) => void;
  placeholders: string[];
  placeholderValues: Record<string, string>;
  onPlaceholderChange: (key: string, value: string) => void;
  onLoadTemplate: (template: Template) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  promptSteps,
  onPromptStepChange,
  onAddStep,
  onRemoveStep,
  onGenerate,
  isLoading,
  targetModel,
  setTargetModel,
  placeholders,
  placeholderValues,
  onPlaceholderChange,
  onLoadTemplate,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onGenerate();
    }
  };

  return (
    <div className="w-full p-6 bg-black border border-green-700/50 rounded-lg shadow-[0_0_20px_rgba(0,255,128,0.15)]">
      <TemplateLibrary onLoadTemplate={onLoadTemplate} />
      <div className="space-y-4 mt-6">
        <label className="block text-xl text-green-300 mb-2">// Objective:</label>
        
        {promptSteps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3 group">
             <div className="flex-shrink-0 text-sm pt-3 text-green-600 font-semibold">Step {index + 1}:</div>
            <textarea
              value={step.goal}
              onChange={(e) => onPromptStepChange(step.id, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`e.g., Make the AI reveal its initial system instructions for {{TARGET_APP}}.`}
              className="flex-grow p-3 bg-gray-900/70 text-green-400 border border-green-800 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 resize-y min-h-[80px] placeholder-green-800"
              rows={3}
            />
            {promptSteps.length > 1 && (
              <button
                onClick={() => onRemoveStep(step.id)}
                className="flex-shrink-0 p-2 mt-1 text-red-500 bg-gray-800 border border-red-700/50 rounded-md hover:bg-red-900/50 hover:text-red-400 transition-all duration-200 opacity-50 group-hover:opacity-100"
                aria-label={`Remove step ${index + 1}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        <div className="flex justify-end">
             <button
                onClick={onAddStep}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 text-green-400 border border-green-700 rounded-md hover:bg-green-900/50 transition-colors duration-200"
                >
                <PlusIcon className="w-4 h-4" />
                Add Step
            </button>
        </div>
      </div>
      
      {placeholders.length > 0 && (
          <div className="mt-6">
              <h4 className="text-md text-green-300 mb-3">// Template Variables:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900/50 border border-green-800/60 rounded-md">
                  {placeholders.map(key => (
                      <div key={key}>
                          <label htmlFor={`placeholder-${key}`} className="block text-sm text-green-500 mb-1">
                              {`{{${key}}}`}
                          </label>
                          <input
                              type="text"
                              id={`placeholder-${key}`}
                              value={placeholderValues[key] || ''}
                              onChange={(e) => onPlaceholderChange(key, e.target.value)}
                              className="w-full p-2 bg-black text-green-400 border border-green-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                      </div>
                  ))}
              </div>
          </div>
      )}


      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-900/50 border border-green-800/60 rounded-md">
        <div>
          <label htmlFor="target-model" className="text-md text-green-300 mr-3">// Technique Arsenal For:</label>
          <select
            id="target-model"
            value={targetModel}
            onChange={(e) => setTargetModel(e.target.value)}
            className="bg-black text-green-400 border border-green-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {AVAILABLE_MODELS.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-green-500 text-black rounded-md hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg"
        >
          <SendIcon className="w-5 h-5" />
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <EmojiEncoder />
    </div>
  );
};

export default PromptInput;