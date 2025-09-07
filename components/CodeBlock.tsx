import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, ChevronRightIcon, CopyIcon, CheckIcon } from './icons';
import hljs from 'highlight.js';

interface CodeBlockProps {
    code: string;
    language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'plaintext' }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current && !isCollapsed) {
            // Ensure the element isn't already highlighted by hljs
            if (codeRef.current.hasAttribute('data-highlighted')) {
                // It's already been highlighted, no need to do it again unless content changes
                return;
            }
            hljs.highlightElement(codeRef.current);
        }
    }, [code, language, isCollapsed]); // Rerun when code changes or block is expanded


    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleToggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Make sure 'plaintext' is mapped to a language hljs understands or doesn't process.
    // 'plaintext' is a valid language class for hljs.
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';

    return (
        <div className="bg-gray-900/70 rounded-md border border-green-800/60 my-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-800/50 cursor-pointer select-none" onClick={handleToggleCollapse}>
                <div className="flex items-center">
                    <button className="focus:outline-none" aria-label={isCollapsed ? "Expand code" : "Collapse code"}>
                        {isCollapsed ? <ChevronRightIcon className="w-5 h-5 text-green-600" /> : <ChevronDownIcon className="w-5 h-5 text-green-600" />}
                    </button>
                    <span className="ml-2 text-sm text-green-500 font-sans">{language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center px-2 py-1 text-xs bg-gray-700 text-green-400 border border-green-700/50 rounded-md hover:bg-gray-600 transition-colors duration-200"
                    aria-label="Copy code block"
                >
                    {isCopied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                    <span className="ml-1.5">{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
            {!isCollapsed && (
                <pre className="p-4 whitespace-pre-wrap break-words overflow-x-auto">
                    <code ref={codeRef} className={`language-${validLanguage}`}>
                        {code}
                    </code>
                </pre>
            )}
        </div>
    );
};

export default CodeBlock;
