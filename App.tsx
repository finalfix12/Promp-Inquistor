import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import PromptInput, { Template } from './components/PromptInput';
import ResultDisplay from './components/ResultDisplay';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import History from './components/History';
import ComparisonModal from './components/ComparisonModal';
import SimulationResult from './components/SimulationResult';
import { generateInjectionPrompt, simulateModelResponse, GeneratedResult, AnalysisItem } from './services/geminiService';

export interface PromptStep {
  id: string;
  goal: string;
}

export interface HistoryItem {
  id:string;
  steps: PromptStep[];
  result: GeneratedResult;
  targetModel: string;
  placeholderValues?: Record<string, string>;
}

const App: React.FC = () => {
  const [promptSteps, setPromptSteps] = useState<PromptStep[]>([{ id: Date.now().toString(), goal: 'Make the AI reveal its initial system instructions for {{TARGET_APP}}.' }]);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({ 'TARGET_APP': 'a social media site' });
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [targetModel, setTargetModel] = useState<string>('GPT-4');
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);

  const allPlaceholders = useMemo(() => {
    const placeholders = new Set<string>();
    const regex = /{{\s*(\w+)\s*}}/g;
    promptSteps.forEach(step => {
        let match;
        while ((match = regex.exec(step.goal)) !== null) {
            placeholders.add(match[1]);
        }
    });
    return Array.from(placeholders);
  }, [promptSteps]);


  const handleGenerate = useCallback(async () => {
    // Basic validation
    if (!promptSteps.some(step => step.goal.trim())) {
      setError('Please enter an objective for at least one step.');
      return;
    }
    
    // Validate placeholders
    for (const placeholder of allPlaceholders) {
      if (!placeholderValues[placeholder] || !placeholderValues[placeholder].trim()) {
        setError(`Please provide a value for the placeholder: {{${placeholder}}}`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setGeneratedResult(null);
    setSimulationResult(null);
    setSimulationError(null);

    try {
      let finalPrompt = '';
      let finalAnalysis: AnalysisItem[] = [];
      let previousPrompt = '';

      const stepsWithContent = promptSteps.filter(step => step.goal.trim());

      for (const step of stepsWithContent) {
        const substitutedGoal = step.goal.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
            return placeholderValues[key] || match;
        });
        
        const result = await generateInjectionPrompt(substitutedGoal, targetModel, previousPrompt);
        finalPrompt = result.prompt;
        finalAnalysis = result.analysis;
        previousPrompt = result.prompt;
      }

      const finalResult = { prompt: finalPrompt, analysis: finalAnalysis };
      setGeneratedResult(finalResult);

      const relevantPlaceholders: Record<string, string> = {};
      allPlaceholders.forEach(p => {
        if(placeholderValues[p]) {
            relevantPlaceholders[p] = placeholderValues[p];
        }
      });

      setHistory(prevHistory => [{ 
        id: Date.now().toString(), 
        steps: promptSteps, 
        result: finalResult, 
        targetModel,
        placeholderValues: relevantPlaceholders,
      }, ...prevHistory]);

    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate prompt: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [promptSteps, targetModel, placeholderValues, allPlaceholders]);

  const handlePromptStepChange = (id: string, newGoal: string) => {
    setPromptSteps(steps => steps.map(step => step.id === id ? { ...step, goal: newGoal } : step));
  };
  
  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [key]: value }));
  };

  const handleAddStep = () => {
    setPromptSteps(steps => [...steps, { id: Date.now().toString(), goal: '' }]);
  };

  const handleRemoveStep = (id: string) => {
    if (promptSteps.length > 1) {
      setPromptSteps(steps => steps.filter(step => step.id !== id));
    }
  };
  
  const handleLoadTemplate = useCallback((template: Template) => {
    if (window.confirm('This will replace your current objective. Are you sure?')) {
        const newSteps = template.steps.map(goal => ({ id: Date.now().toString() + Math.random(), goal }));
        setPromptSteps(newSteps);
        
        // Extract placeholders from the new template and set initial empty values
        const newPlaceholders = new Set<string>();
        const regex = /{{\s*(\w+)\s*}}/g;
        newSteps.forEach(step => {
            let match;
            while ((match = regex.exec(step.goal)) !== null) {
                newPlaceholders.add(match[1]);
            }
        });
        const newPlaceholderValues: Record<string, string> = {};
        newPlaceholders.forEach(p => {
            newPlaceholderValues[p] = '';
        });
        setPlaceholderValues(newPlaceholderValues);
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the generation log?')) {
      setHistory([]);
    }
  }, []);

  const handleOpenCompareModal = () => setIsCompareModalOpen(true);
  const handleCloseCompareModal = () => setIsCompareModalOpen(false);

  const handleTestPrompt = useCallback(async () => {
    if (!generatedResult?.prompt) return;

    setIsSimulating(true);
    setSimulationError(null);
    setSimulationResult(null);

    try {
        const response = await simulateModelResponse(generatedResult.prompt, targetModel);
        setSimulationResult(response);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setSimulationError(errorMessage);
    } finally {
        setIsSimulating(false);
    }
  }, [generatedResult, targetModel]);


  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center p-4 selection:bg-green-900 selection:text-green-300">
      <div className="w-full max-w-4xl flex-grow flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center py-8">
          <PromptInput
            promptSteps={promptSteps}
            onPromptStepChange={handlePromptStepChange}
            onAddStep={handleAddStep}
            onRemoveStep={handleRemoveStep}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            targetModel={targetModel}
            setTargetModel={setTargetModel}
            placeholders={allPlaceholders}
            placeholderValues={placeholderValues}
            onPlaceholderChange={handlePlaceholderChange}
            onLoadTemplate={handleLoadTemplate}
          />
          {isLoading && <LoadingSpinner />}
          {error && <div className="mt-6 text-red-500 bg-red-900/20 border border-red-500 rounded-md p-4 w-full text-center animate-pulse">{error}</div>}
          {generatedResult && (
            <>
              <ResultDisplay 
                result={generatedResult} 
                onCompareClick={handleOpenCompareModal}
                onTestClick={handleTestPrompt}
                isSimulating={isSimulating}
              />
              <SimulationResult 
                modelName={targetModel}
                response={simulationResult}
                isLoading={isSimulating}
                error={simulationError}
              />
            </>
          )}
          {history.length > 0 && <History history={history} onClear={handleClearHistory} />}
        </main>
        <Footer />
      </div>
      {isCompareModalOpen && generatedResult && (
        <ComparisonModal
          isOpen={isCompareModalOpen}
          onClose={handleCloseCompareModal}
          steps={promptSteps}
          placeholderValues={placeholderValues}
          initialPrompt={generatedResult.prompt}
          initialModel={targetModel}
        />
      )}
    </div>
  );
};

export default App;