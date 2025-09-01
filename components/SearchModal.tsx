'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, CheckSquare, Hash, Calendar, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface SearchResult {
  tasks: any[];
  references: any[];
  total: number;
  query: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export default function SearchModal({ isOpen, onClose, projectId }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const total = (results?.tasks.length || 0) + (results?.references.length || 0);
          return prev < total - 1 ? prev + 1 : prev;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && results) {
        e.preventDefault();
        handleResultClick(selectedIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: 'all',
        ...(projectId && { projectId })
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setResults(data);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleResultClick = (index: number) => {
    if (!results) return;
    
    const taskCount = results.tasks.length;
    if (index < taskCount) {
      const task = results.tasks[index];
      if (task.projectId) {
        router.push(`/projects/${task.projectId}?tab=tasks&highlight=${task._id}`);
      }
    } else {
      const reference = results.references[index - taskCount];
      if (reference.projectId) {
        router.push(`/projects/${reference.projectId}?tab=references&highlight=${reference._id}`);
      }
    }
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/20">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <Search className="w-5 h-5 text-purple-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, references, tags..."
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
          />
          {loading && (
            <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full" />
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Search Results */}
        {results && results.total > 0 && (
          <div className="max-h-96 overflow-y-auto">
            {/* Tasks Section */}
            {results.tasks.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-800/50">
                  TASKS ({results.tasks.length})
                </div>
                {results.tasks.map((task, index) => (
                  <div
                    key={task._id}
                    onClick={() => handleResultClick(index)}
                    className={`px-4 py-3 hover:bg-purple-500/10 cursor-pointer border-l-2 transition-colors ${
                      selectedIndex === index ? 'bg-purple-500/10 border-purple-400' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckSquare className="w-4 h-4 text-purple-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{task.title}</span>
                          <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(task.dueDate), 'MMM d')}
                            </span>
                          )}
                        </div>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {task.tags.map((tag: string) => (
                              <span key={tag} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* References Section */}
            {results.references.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-800/50">
                  REFERENCES ({results.references.length})
                </div>
                {results.references.map((ref, index) => {
                  const actualIndex = results.tasks.length + index;
                  return (
                    <div
                      key={ref._id}
                      onClick={() => handleResultClick(actualIndex)}
                      className={`px-4 py-3 hover:bg-purple-500/10 cursor-pointer border-l-2 transition-colors ${
                        selectedIndex === actualIndex ? 'bg-purple-500/10 border-purple-400' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-blue-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-white font-medium">{ref.title}</div>
                          {ref.description && (
                            <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {ref.description}
                            </div>
                          )}
                          {ref.tags && ref.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {ref.tags.map((tag: string) => (
                                <span key={tag} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {results && results.total === 0 && (
          <div className="p-8 text-center text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No results found for "{query}"</p>
            <p className="text-sm mt-1">Try different keywords or tags</p>
          </div>
        )}

        {/* Keyboard Shortcuts */}
        <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Enter</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Esc</kbd> Close</span>
          </div>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Quick Search
          </span>
        </div>
      </div>
    </div>
  );
}