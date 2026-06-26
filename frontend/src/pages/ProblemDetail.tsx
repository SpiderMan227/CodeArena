import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../services/api';
import {
  Terminal,
  ShieldAlert,
  BookOpen,
  Layers,
  RotateCcw,
  Play,
  Send,
  ChevronUp,
  ChevronDown,
  TerminalSquare,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  HelpCircle as HintIcon,
  Bug,
  Brain,
  FileText
} from 'lucide-react';

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  tags: { name: string }[];
  testCases: TestCase[];
}

interface ExecutionResult {
  submissionId?: string;
  verdict: string;
  executionTime?: number;
  memoryUsed?: number;
  errorOutput?: string | null;
  stdout?: string;
}

const DEFAULT_CPP_TEMPLATE = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    // Optimize input/output operations for competitive programming
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Write your code here (use cin >> to read inputs)
    // Example: Read an integer and a list of elements
    /*
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) {
            cin >> nums[i];
        }
    }
    */

    return 0;
}`;

const DEFAULT_C_TEMPLATE = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your code here (use scanf or fgets to read inputs)
    
    return 0;
}`;

const DEFAULT_PYTHON_TEMPLATE = `import sys

def main():
    # Write your code here (use sys.stdin.read or input to read inputs)
    pass

if __name__ == '__main__':
    main()`;

export default function ProblemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Left column layout tabs
  const [leftTab, setLeftTab] = useState<'desc' | 'ai'>('desc');

  // Editor states
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);

  // Console Drawer states
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState<'output' | 'testcase'>('output');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // AI Tutor states
  const [aiSubTab, setAiSubTab] = useState<'hint' | 'error' | 'wa' | 'solution'>('hint');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>('');
  
  // Cache for hints to avoid unnecessary API queries
  const [hintsCache, setHintsCache] = useState<Record<number, string>>({});
  const [activeHintLevel, setActiveHintLevel] = useState<number>(1);

  // Load Problem Details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/problems/${slug}`);
        const prob = response.data.problem;
        setProblem(prob);

        // Load saved code draft or default template
        const savedCode = localStorage.getItem(`codearena_draft_${prob.id}_${language}`);
        if (savedCode) {
          setCode(savedCode);
        } else {
          setCode(DEFAULT_CPP_TEMPLATE);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load the problem statement.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  // Local storage auto-saver trigger
  useEffect(() => {
    if (problem) {
      const saveDraft = setTimeout(() => {
        localStorage.setItem(`codearena_draft_${problem.id}_${language}`, code);
      }, 500); // 500ms debounce
      return () => clearTimeout(saveDraft);
    }
  }, [code, problem, language]);

  const handleResetTemplate = () => {
    if (problem) {
      localStorage.removeItem(`codearena_draft_${problem.id}_${language}`);
    }
    if (language === 'python') {
      setCode(DEFAULT_PYTHON_TEMPLATE);
    } else if (language === 'c') {
      setCode(DEFAULT_C_TEMPLATE);
    } else {
      setCode(DEFAULT_CPP_TEMPLATE);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (!problem) return;
    const savedCode = localStorage.getItem(`codearena_draft_${problem.id}_${newLang}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      if (newLang === 'python') {
        setCode(DEFAULT_PYTHON_TEMPLATE);
      } else if (newLang === 'c') {
        setCode(DEFAULT_C_TEMPLATE);
      } else {
        setCode(DEFAULT_CPP_TEMPLATE);
      }
    }
  };

  const handleRunOrSubmit = async (isSubmit: boolean) => {
    if (!problem) return;
    setIsExecuting(true);
    setIsConsoleOpen(true);
    setConsoleTab('output');
    setExecutionResult(null);

    try {
      const response = await api.post(`/problems/${problem.id}/submit`, {
        code,
        language,
        isSubmit,
      });
      setExecutionResult(response.data);
    } catch (err: any) {
      setExecutionResult({
        verdict: 'RUNTIME_ERROR',
        errorOutput: err.response?.data?.error || 'An error occurred during submission.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // AI service triggers
  const handleFetchHint = async (level: number) => {
    if (!problem) return;
    if (hintsCache[level]) {
      setAiOutput(hintsCache[level]);
      setActiveHintLevel(level);
      return;
    }

    setIsAiLoading(true);
    setAiOutput('');
    try {
      const response = await api.post(`/ai/problems/${problem.id}/hint`, {
        code,
        level,
      });
      const hintText = response.data.hint;
      setHintsCache({ ...hintsCache, [level]: hintText });
      setAiOutput(hintText);
      setActiveHintLevel(level);
    } catch (err: any) {
      setAiOutput(err.response?.data?.error || 'Failed to fetch hint from the AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExplainError = async () => {
    if (!executionResult?.submissionId) return;
    setIsAiLoading(true);
    setAiOutput('');
    try {
      const response = await api.post(`/ai/submissions/${executionResult.submissionId}/explain-error`);
      setAiOutput(response.data.explanation);
    } catch (err: any) {
      setAiOutput(err.response?.data?.error || 'Failed to request code debugging.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExplainWA = async () => {
    if (!executionResult?.submissionId) return;
    setIsAiLoading(true);
    setAiOutput('');
    try {
      const response = await api.post(`/ai/submissions/${executionResult.submissionId}/explain-wa`);
      setAiOutput(response.data.explanation);
    } catch (err: any) {
      setAiOutput(err.response?.data?.error || 'Failed to request wrong-answer analysis.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExplainSolution = async () => {
    if (!problem) return;
    setIsAiLoading(true);
    setAiOutput('');
    try {
      const response = await api.post(`/ai/problems/${problem.id}/explain-solution`);
      setAiOutput(response.data.explanation);
    } catch (err: any) {
      setAiOutput(err.response?.data?.error || 'Failed to request solution guidance.');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    // Automatically fetch Hint level 1 when user clicks the AI Tutor tab the first time
    if (leftTab === 'ai' && Object.keys(hintsCache).length === 0 && problem) {
      handleFetchHint(1);
    }
  }, [leftTab, problem]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'EASY': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'HARD': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg"><CheckCircle className="h-4 w-4" /> Accepted</span>;
      case 'WRONG_ANSWER':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg"><AlertTriangle className="h-4 w-4" /> Wrong Answer</span>;
      case 'COMPILATION_ERROR':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg"><Terminal className="h-4 w-4" /> Compilation Error</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg"><Activity className="h-4 w-4" /> {verdict.replace(/_/g, ' ')}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">Problem Not Found</h3>
        <p className="text-sm text-slate-400">{error || 'The statement could not be resolved.'}</p>
        <Link to="/" className="inline-block text-indigo-400 hover:text-indigo-300 font-semibold text-sm">
          Return to problem list
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-110px)] overflow-hidden">
      
      {/* Left Column: Description or AI Tutor */}
      <div className="lg:col-span-5 bg-[#121216]/85 border border-[#1f1f2e] rounded-2xl flex flex-col h-full overflow-hidden shadow-xl select-text">
        
        {/* Navigation Tabs (Description vs AI Tutor) */}
        <div className="h-12 border-b border-[#1f1f2e] bg-[#121216]/65 px-4 flex items-center gap-6 text-xs font-bold text-slate-400">
          <button
            onClick={() => setLeftTab('desc')}
            className={`pb-2 border-b-2 transition-colors pt-2 flex items-center gap-1.5 ${
              leftTab === 'desc' ? 'border-indigo-500 text-white' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" /> Description
          </button>
          <button
            onClick={() => setLeftTab('ai')}
            className={`pb-2 border-b-2 transition-colors pt-2 flex items-center gap-1.5 ${
              leftTab === 'ai' ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-indigo-500" /> AI Tutor
          </button>
        </div>

        {/* Scrollable content container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {leftTab === 'desc' ? (
            <>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty.toLowerCase()}
                  </span>
                  {problem.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-[#1f1f2e] text-slate-400 text-xs border border-[#2a2a3d]">
                      {t.name}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-extrabold text-white">{problem.title}</h2>
              </div>

              {/* Statement Section */}
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line border-t border-[#1f1f2e] pt-6">
                {problem.statement}
              </div>

              {/* Input/Output specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#1f1f2e]">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-indigo-400" /> Input Format
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{problem.inputFormat}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-purple-400" /> Output Format
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{problem.outputFormat}</p>
                </div>
              </div>

              {/* Constraints */}
              <div className="space-y-2 pt-6 border-t border-[#1f1f2e]">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Constraints</h3>
                <pre className="p-3 bg-[#0c0c0f] border border-[#1f1f2e] rounded-xl text-xs font-mono text-slate-300">
                  {problem.constraints}
                </pre>
              </div>

              {/* Sample Examples */}
              {problem.testCases && problem.testCases.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-[#1f1f2e]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Examples</h3>
                  {problem.testCases.map((tc, idx) => (
                    <div key={tc.id} className="space-y-2">
                      <span className="text-xs font-semibold text-slate-400">Example {idx + 1}:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Input:</span>
                          <pre className="p-3 bg-[#0c0c0f] border border-[#1f1f2e] rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap">
                            {tc.input}
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Output:</span>
                          <pre className="p-3 bg-[#0c0c0f] border border-[#1f1f2e] rounded-xl text-xs font-mono text-slate-300 whitespace-pre-wrap">
                            {tc.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Tab: AI Tutor
            <div className="space-y-6 flex flex-col h-full">
              
              {/* AI Sub-Tabs */}
              <div className="grid grid-cols-4 gap-2 bg-[#0c0c0f] p-1.5 rounded-xl border border-[#1f1f2e]">
                <button
                  type="button"
                  onClick={() => { setAiSubTab('hint'); setAiOutput(hintsCache[activeHintLevel] || ''); }}
                  className={`py-2 text-[10px] uppercase tracking-wider font-extrabold rounded-lg flex flex-col items-center gap-1 transition-all ${
                    aiSubTab === 'hint' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <HintIcon className="h-4 w-4" />
                  <span>Hints</span>
                </button>
                <button
                  type="button"
                  disabled={!executionResult?.errorOutput}
                  onClick={() => { setAiSubTab('error'); handleExplainError(); }}
                  className={`py-2 text-[10px] uppercase tracking-wider font-extrabold rounded-lg flex flex-col items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    aiSubTab === 'error' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title={!executionResult?.errorOutput ? 'Only available when code yields compile or runtime errors' : ''}
                >
                  <Bug className="h-4 w-4" />
                  <span>Error Review</span>
                </button>
                <button
                  type="button"
                  disabled={executionResult?.verdict !== 'WRONG_ANSWER'}
                  onClick={() => { setAiSubTab('wa'); handleExplainWA(); }}
                  className={`py-2 text-[10px] uppercase tracking-wider font-extrabold rounded-lg flex flex-col items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    aiSubTab === 'wa' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title={executionResult?.verdict !== 'WRONG_ANSWER' ? 'Only available on Wrong Answer verdicts' : ''}
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>WA Debug</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setAiSubTab('solution'); handleExplainSolution(); }}
                  className={`py-2 text-[10px] uppercase tracking-wider font-extrabold rounded-lg flex flex-col items-center gap-1 transition-all ${
                    aiSubTab === 'solution' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  <span>Complexity</span>
                </button>
              </div>

              {/* Sub-Tab Content Views */}
              <div className="flex-1 flex flex-col">
                
                {/* Hints sub-navigation */}
                {aiSubTab === 'hint' && (
                  <div className="mb-4">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Hint Levels:</span>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleFetchHint(level)}
                          className={`w-9 h-9 rounded-lg border font-bold text-xs flex items-center justify-center transition-all ${
                            activeHintLevel === level
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-extrabold'
                              : 'border-[#1f1f2e] bg-[#0c0c0f] text-slate-400 hover:text-white'
                          }`}
                        >
                          L{level}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Tutor Response Screen */}
                <div className="flex-1 bg-[#0c0c0f] border border-[#1f1f2e] rounded-xl p-4 min-h-[300px] flex flex-col overflow-y-auto">
                  {isAiLoading ? (
                    <div className="flex flex-col items-center justify-center my-auto gap-2 text-slate-400">
                      <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <span className="text-xs italic">Tutor is analyzing code...</span>
                    </div>
                  ) : aiOutput ? (
                    <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {aiOutput}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center my-auto text-slate-500 text-center gap-2">
                      <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse" />
                      <span className="font-semibold text-slate-400 text-sm">Interactive AI Programming Tutor</span>
                      <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                        Choose an AI tab above to unlock progressive hints, analyze logic issues, review errors, or evaluate algorithmic complexities.
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>

      </div>

      {/* Right Column: Code Editor & Collapsible Console Drawer */}
      <div className="lg:col-span-7 flex flex-col h-full relative border border-[#1f1f2e] bg-[#121216]/40 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Editor Settings Toolbar */}
        <div className="h-12 border-b border-[#1f1f2e] bg-[#121216] px-4 flex items-center justify-between text-slate-300 z-10">
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-[#1f1f2e] border border-[#2a2a3d] text-slate-300 rounded-lg text-xs py-1 px-2.5 outline-none font-semibold cursor-pointer"
            >
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="python">Python</option>
            </select>

            <select
              value={editorTheme}
              onChange={(e) => setEditorTheme(e.target.value)}
              className="bg-[#1f1f2e] border border-[#2a2a3d] text-slate-300 rounded-lg text-xs py-1 px-2.5 outline-none font-semibold cursor-pointer"
            >
              <option value="vs-dark">Dark Mode</option>
              <option value="light">Light Mode</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Font:</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="bg-[#1f1f2e] border border-[#2a2a3d] text-slate-300 rounded-lg text-xs py-0.5 px-1.5 outline-none cursor-pointer"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleResetTemplate}
            title="Reset default template"
            className="p-1.5 rounded-lg bg-[#1f1f2e] border border-[#2a2a3d] text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Monaco Editor Component */}
        <div className="flex-1 min-h-0 relative bg-[#1e1e1e]">
          <Editor
            height="100%"
            language={language}
            theme={editorTheme}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>

        {/* Console Action Bar */}
        <div className="h-14 border-t border-[#1f1f2e] bg-[#121216] px-4 flex items-center justify-between z-20">
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#1f1f2e] transition-colors"
          >
            <span>Console</span>
            {isConsoleOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRunOrSubmit(false)}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1f1f2e] border border-[#2a2a3d] hover:bg-[#2a2a3d] text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Run Code
            </button>
            <button
              onClick={() => handleRunOrSubmit(true)}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              Submit
            </button>
          </div>
        </div>

        {/* Collapsible Console Drawer */}
        {isConsoleOpen && (
          <div className="absolute bottom-14 left-0 right-0 h-64 border-t border-[#1f1f2e] bg-[#0c0c0f] z-30 flex flex-col">
            <div className="h-10 bg-[#121216] border-b border-[#1f1f2e] px-4 flex items-center justify-between text-xs text-slate-400">
              <div className="flex gap-4">
                <button
                  onClick={() => setConsoleTab('output')}
                  className={`pb-2 border-b-2 font-semibold transition-colors pt-2 ${
                    consoleTab === 'output' ? 'border-indigo-500 text-white' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  Submission Result
                </button>
                <button
                  onClick={() => setConsoleTab('testcase')}
                  className={`pb-2 border-b-2 font-semibold transition-colors pt-2 ${
                    consoleTab === 'testcase' ? 'border-indigo-500 text-white' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  Sample Input Examples
                </button>
              </div>
              <button
                onClick={() => setIsConsoleOpen(false)}
                className="hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300">
              {consoleTab === 'output' ? (
                isExecuting ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span>Compiling and running on Docker sandbox...</span>
                  </div>
                ) : executionResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {getVerdictBadge(executionResult.verdict)}
                      <div className="flex gap-4 text-[10px] text-slate-500">
                        {executionResult.executionTime !== undefined && (
                          <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> {executionResult.executionTime} ms</span>
                        )}
                        {executionResult.memoryUsed !== undefined && (
                          <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {(executionResult.memoryUsed / 1024).toFixed(2)} MB</span>
                        )}
                      </div>
                    </div>

                    {/* AI Prompt Warning triggers for error reviews */}
                    {(executionResult.verdict === 'COMPILATION_ERROR' || executionResult.verdict === 'RUNTIME_ERROR') && (
                      <button
                        type="button"
                        onClick={() => { setLeftTab('ai'); setAiSubTab('error'); handleExplainError(); }}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-semibold transition-all"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Explain this error with AI Tutor
                      </button>
                    )}

                    {executionResult.verdict === 'WRONG_ANSWER' && (
                      <button
                        type="button"
                        onClick={() => { setLeftTab('ai'); setAiSubTab('wa'); handleExplainWA(); }}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-semibold transition-all"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Analyze failed logic with AI Tutor
                      </button>
                    )}

                    {executionResult.errorOutput ? (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-rose-500/80 uppercase">Diagnostics:</span>
                        <pre className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-400 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                          {executionResult.errorOutput}
                        </pre>
                      </div>
                    ) : (
                      executionResult.stdout && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-500/80 uppercase">Standard Output:</span>
                          <pre className="p-3 rounded-lg bg-slate-900 border border-[#1f1f2e] text-slate-300 whitespace-pre-wrap">
                            {executionResult.stdout}
                          </pre>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <TerminalSquare className="h-8 w-8 mr-2 opacity-50" />
                    <span>No run results. Click "Run Code" or "Submit" to trigger.</span>
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {problem.testCases && problem.testCases.length > 0 ? (
                    problem.testCases.map((tc, idx) => (
                      <div key={tc.id} className="space-y-1 border-b border-[#1f1f2e] pb-3 last:border-b-0">
                        <span className="text-[10px] font-bold text-indigo-400">Example Input #{idx + 1}:</span>
                        <pre className="p-2 rounded bg-slate-900 border border-[#1f1f2e] text-slate-300">{tc.input}</pre>
                        <span className="text-[10px] font-bold text-slate-400">Expected Output:</span>
                        <pre className="p-2 rounded bg-slate-900 border border-[#1f1f2e] text-slate-300">{tc.expectedOutput}</pre>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500">No test cases declared.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
