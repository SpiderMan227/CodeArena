import React, { useState } from 'react';
import api from '../services/api';
import { Plus, Trash2, Check, AlertTriangle, FileText, Beaker, HelpCircle } from 'lucide-react';

interface TestCaseInput {
  input: string;
  expectedOutput: string;
  isSample: boolean;
}

interface HintInput {
  level: number;
  content: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'details' | 'testcases' | 'hints'>('details');

  // Form states
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('EASY');
  const [statement, setStatement] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [tags, setTags] = useState('');
  
  const [testCases, setTestCases] = useState<TestCaseInput[]>([
    { input: '', expectedOutput: '', isSample: true },
  ]);

  const [hints, setHints] = useState<HintInput[]>([
    { level: 1, content: '' },
  ]);

  const [editorialContent, setEditorialContent] = useState('');
  const [editorialSolution, setEditorialSolution] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isSample: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, key: keyof TestCaseInput, value: any) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [key]: value };
    setTestCases(updated);
  };

  const handleAddHint = () => {
    if (hints.length >= 4) return; // Progressive hints max 4 levels
    setHints([...hints, { level: hints.length + 1, content: '' }]);
  };

  const handleRemoveHint = (index: number) => {
    const filtered = hints.filter((_, i) => i !== index);
    const remapped = filtered.map((h, i) => ({ ...h, level: i + 1 }));
    setHints(remapped);
  };

  const handleHintChange = (index: number, content: string) => {
    const updated = [...hints];
    updated[index].content = content;
    setHints(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    // Form payload mapping
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title,
      difficulty,
      statement,
      inputFormat,
      outputFormat,
      constraints,
      tags: parsedTags,
      testCases,
      hints: hints.filter((h) => h.content.trim().length > 0),
      editorial: editorialContent.trim()
        ? { content: editorialContent, codeSolution: editorialSolution || undefined }
        : undefined,
    };

    try {
      await api.post('/problems', payload);
      setSuccess('Problem created successfully!');
      
      // Reset form
      setTitle('');
      setDifficulty('EASY');
      setStatement('');
      setInputFormat('');
      setOutputFormat('');
      setConstraints('');
      setTags('');
      setTestCases([{ input: '', expectedOutput: '', isSample: true }]);
      setHints([{ level: 1, content: '' }]);
      setEditorialContent('');
      setEditorialSolution('');
      setActiveTab('details');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create problem. Verify inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative overflow-hidden">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Create Problem</h2>
        <p className="text-sm text-slate-400 mt-1">Publish new tasks, configure hidden test cases, and attach hints.</p>
      </div>

      <div className="flex border-b border-[#1f1f2e] gap-4">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'details'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          Statement Details
        </button>
        <button
          onClick={() => setActiveTab('testcases')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'testcases'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Beaker className="h-4 w-4" />
          Test Cases ({testCases.length})
        </button>
        <button
          onClick={() => setActiveTab('hints')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'hints'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Editorial & Hints
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[#121216]/80 p-8 rounded-2xl border border-[#1f1f2e] shadow-2xl">
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <Check className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Problem Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Two Sum"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 px-4 text-slate-300 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Problem Statement (Markdown)
              </label>
              <textarea
                required
                rows={6}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none font-mono"
                placeholder="Write the full problem description, example inputs/outputs, and notes..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Input Format
                </label>
                <textarea
                  required
                  rows={3}
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. First line contains integer N..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Output Format
                </label>
                <textarea
                  required
                  rows={3}
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Output the sum of the integers..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Constraints
                </label>
                <textarea
                  required
                  rows={3}
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none font-mono"
                  placeholder="e.g. 1 <= N <= 10^5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. Arrays, Hash Table, Math"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Test cases */}
        {activeTab === 'testcases' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Test Cases</h3>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Test Case
              </button>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 divide-y divide-[#1f1f2e]">
              {testCases.map((tc, index) => (
                <div key={index} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400">
                      Test Case #{index + 1}
                    </span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={tc.isSample}
                          onChange={(e) => handleTestCaseChange(index, 'isSample', e.target.checked)}
                          className="rounded border-[#1f1f2e] bg-[#0c0c0f] text-indigo-500 focus:ring-0 cursor-pointer"
                        />
                        Sample Test Case
                      </label>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(index)}
                          className="text-rose-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Input</label>
                      <textarea
                        required
                        rows={3}
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        className="block w-full rounded-lg border border-[#1f1f2e] bg-[#0c0c0f] py-2 px-3 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                        placeholder="Raw input data..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Output</label>
                      <textarea
                        required
                        rows={3}
                        value={tc.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                        className="block w-full rounded-lg border border-[#1f1f2e] bg-[#0c0c0f] py-2 px-3 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                        placeholder="Expected stdout..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Hints & Editorial */}
        {activeTab === 'hints' && (
          <div className="space-y-6">
            {/* Editorial */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Editorial Solution</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Editorial Explanation (Markdown)</label>
                <textarea
                  rows={4}
                  value={editorialContent}
                  onChange={(e) => setEditorialContent(e.target.value)}
                  className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 px-4 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Explain the solution approach, complexities, and logic..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">C++ Solution Code</label>
                <textarea
                  rows={5}
                  value={editorialSolution}
                  onChange={(e) => setEditorialSolution(e.target.value)}
                  className="block w-full rounded-xl border border-[#1f1f2e] bg-[#0c0c0f] py-3 px-4 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  placeholder="// Reference solution code in C++..."
                />
              </div>
            </div>

            {/* Hints */}
            <div className="border-t border-[#1f1f2e] pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI hints</h3>
                {hints.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddHint}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Add Hint Level
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {hints.map((hint, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-indigo-400">
                        Hint Level {hint.level} - {index === 0 ? 'Tiny clue' : index === 1 ? 'Detailed clue' : index === 2 ? 'Algorithm direction' : 'Complete approach'}
                      </span>
                      {hints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHint(index)}
                          className="text-rose-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      required
                      rows={2}
                      value={hint.content}
                      onChange={(e) => handleHintChange(index, e.target.value)}
                      className="block w-full rounded-lg border border-[#1f1f2e] bg-[#0c0c0f] py-2 px-3 text-white text-sm focus:border-indigo-500 focus:outline-none"
                      placeholder="Hint text content..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-[#1f1f2e] pt-6 flex justify-end gap-4">
          {activeTab !== 'details' && (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'hints' ? 'testcases' : 'details')}
              className="px-5 py-2.5 rounded-xl border border-[#1f1f2e] text-sm font-semibold text-slate-300 hover:bg-[#121216] transition-colors"
            >
              Previous
            </button>
          )}

          {activeTab !== 'hints' ? (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'details' ? 'testcases' : 'hints')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Problem'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
