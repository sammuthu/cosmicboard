/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import Link from 'next/link'

type TabType = 'concept' | 'demo' | 'source'

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>('concept')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Navigation */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/" 
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all inline-flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-900/20 via-red-900/20 to-purple-900/20 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              Segment Loop Master
            </h1>
            <p className="text-xl text-gray-400 mt-2">
              Master Any Concept Through Iterative Error Correction
            </p>
            <div className="mt-4 inline-flex relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full opacity-50 blur"></div>
              <div className="relative inline-flex items-center px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-yellow-400 font-bold">🔄 10,000 Iterations Theory in Practice</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-4">
            <div className="relative inline-flex">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-75 blur"></div>
              <div className="relative bg-gradient-to-r from-gray-900/90 to-gray-800/90 p-1 rounded-xl inline-flex gap-1 backdrop-blur-sm shadow-lg">
              {(['concept', 'demo', 'source'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-3 rounded-lg font-semibold capitalize whitespace-nowrap transition-all text-sm ${
                    activeTab === tab 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {tab === 'concept' && '🧠 '}
                  {tab === 'demo' && '📸 '}
                  {tab === 'source' && '💻 '}
                  {tab === 'source' ? 'Source Code' : tab}
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'concept' && (
          <div className="space-y-12">
            {/* Philosophy */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="text-4xl mr-3">🧠</span>
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    The Philosophy
                  </span>
                </h2>
                <div className="space-y-6">
                  <blockquote className="border-l-4 border-orange-500 pl-6 py-2">
                    <p className="text-2xl italic mb-2 text-orange-300 font-semibold">
                      "It's actually 10,000 iterations to mastery, not 10,000 hours. And it's not even 10,000 but some unknown number—it's about the number of iterations that drives the learning curve."
                    </p>
                    <cite className="text-orange-400 font-semibold">— Naval Ravikant</cite>
                  </blockquote>
                  
                  <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-6 rounded-xl border border-purple-700/50 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-purple-300 mb-3">Ancient Wisdom Meets Modern Learning</h3>
                    <p className="mb-4 text-gray-300 font-medium">
                      Hindu traditions prescribed mantras to be repeated 108 or 1,008 times—sacred numbers believed to create permanent neural pathways. But perhaps what was lost over millennia was the crucial distinction: <span className="text-purple-300 font-bold">iteration is not repetition.</span>
                    </p>
                    <p className="mb-4 text-gray-300 font-medium">
                      <span className="text-purple-300 font-bold">Repetition</span> is doing the same thing over and over. <span className="text-purple-300 font-bold">Iteration</span> is modifying it with a learning and then doing another version—that's error correction. Get 10,000 error corrections in anything, and you'll be an expert.
                    </p>
                    <p className="text-gray-300 font-medium">
                      Segment Loop Master revives this ancient practice with modern understanding. Break content into digestible segments, loop them with conscious attention, document insights with each iteration. Each loop isn't mere repetition—it's a refinement, an error correction, a step closer to mastery.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Measure Your Mastery */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-yellow-900/30 to-red-900/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="text-4xl mr-3">📊</span>
                  <span className="bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
                    Measure Your Mastery
                  </span>
                </h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 p-6 rounded-xl border border-orange-700/50 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-orange-300 mb-3">Track Your "Aha!" Moments</h3>
                    <p className="mb-4 text-gray-300 font-medium">
                      The player features an <span className="text-orange-300 font-bold">"Add Insight"</span> comment editor. When you have a breakthrough—whether at iteration 19, 108, or 1008—document it. The system automatically timestamps each insight:
                    </p>
                    <div className="bg-gray-900 p-3 rounded text-sm font-mono mb-4">
                      <div className="text-gray-400">6/14/2025, 9:17:09 PM - Iteration #19</div>
                      <div className="text-orange-300">"Finally understood the recursion pattern!"</div>
                    </div>
                    <p className="text-gray-300 font-medium">
                      This creates a personal mastery pattern. Over time, you'll discover your unique iteration threshold—the number of cycles your brain needs to truly internalize concepts.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-red-900/40 to-pink-900/40 p-6 rounded-xl border border-red-700/50 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-red-300 mb-3">Precision Learning Controls</h3>
                    <div className="space-y-3 text-gray-300 font-medium">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🔁</span>
                        <div>
                          <span className="text-red-300 font-bold">Loop Mode:</span> Auto-repeat the same 20-second segment until mastery. No manual replay needed—just pure focused iteration.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⏪</span>
                        <div>
                          <span className="text-red-300 font-bold">Micro-Navigation:</span> Skip backward/forward by custom seconds (e.g., 3 seconds) to replay that crucial sentence or concept within the segment.
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">📈</span>
                        <div>
                          <span className="text-red-300 font-bold">Future Vision:</span> When public, aggregate data will reveal fascinating patterns—how many iterations different concepts require across learners.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="text-4xl mr-3">⚙️</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    How It Works
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-800/60 to-cyan-900/20 p-6 rounded-xl border border-gray-600/50 hover:border-cyan-500/50 transition-colors backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-cyan-400 mb-3">1. Segment Your Content</h3>
                    <p className="text-gray-300 mb-3 font-medium">
                      Split videos into 20-second segments for focused learning. Each segment becomes a learning unit.
                    </p>
                    <code className="block bg-gray-900 p-3 rounded text-sm text-green-400 font-mono">
                      split_video_by_minute_segment.sh
                    </code>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800/60 to-pink-900/20 p-6 rounded-xl border border-gray-600/50 hover:border-pink-500/50 transition-colors backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-pink-400 mb-3">2. Iterate, Don't Just Repeat</h3>
                    <p className="text-gray-300 mb-3 font-medium">
                      Each loop is an iteration with error correction. Notice something new, refine understanding, document the insight.
                    </p>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="bg-green-600/20 px-2 py-1 rounded border border-green-600/30">Iteration 1</span>
                      <span>→</span>
                      <span className="bg-green-600/40 px-2 py-1 rounded border border-green-600/50">Iteration 50</span>
                      <span>→</span>
                      <span className="bg-green-600/60 px-2 py-1 rounded border border-green-600/70">Iteration 108</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800/60 to-purple-900/20 p-6 rounded-xl border border-gray-600/50 hover:border-purple-500/50 transition-colors backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-purple-400 mb-3">3. Capture "Aha!" Moments</h3>
                    <p className="text-gray-300 mb-3 font-medium">
                      Click "Add Insight" when breakthroughs happen. System auto-timestamps with iteration number.
                    </p>
                    <div className="bg-gray-900 p-3 rounded text-sm font-mono">
                      <div className="text-gray-400">6/14/2025, 9:17:09 PM - Iteration #23</div>
                      <div className="text-purple-300">"First glimpse of the pattern"</div>
                      <div className="text-gray-400">6/14/2025, 9:21:42 PM - Iteration #67</div>
                      <div className="text-purple-300">"Connection to previous concept!"</div>
                      <div className="text-gray-400">6/14/2025, 9:25:18 PM - Iteration #108</div>
                      <div className="text-purple-300">"Complete understanding achieved"</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800/60 to-blue-900/20 p-6 rounded-xl border border-gray-600/50 hover:border-blue-500/50 transition-colors backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-blue-400 mb-3">4. Build Neural Pathways</h3>
                    <p className="text-gray-300 mb-3 font-medium">
                      Iteration with error correction creates permanent understanding. Knowledge becomes intuition through refinement.
                    </p>
                    <div className="flex justify-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center animate-pulse">
                        <span className="text-2xl font-bold">∞</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Architecture */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="text-4xl mr-3">🛠️</span>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Technical Architecture
                  </span>
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">FE</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Vanilla JavaScript Frontend</h3>
                      <p className="text-gray-400 font-medium">
                        Clean, fast, no framework overhead. Direct DOM manipulation for precise control.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-cyan-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">⚛️</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">React Delux Frontend</h3>
                      <p className="text-gray-400 font-medium">
                        Polished UI with advanced state management, smooth animations, and rich interactions. Features real-time progress tracking, keyboard shortcuts, and an intuitive learning dashboard.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">BE</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Python FastAPI Backend</h3>
                      <p className="text-gray-400 font-medium">
                        High-performance async API. Handles media serving and iteration tracking.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">DB</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">MongoDB Database</h3>
                      <p className="text-gray-400 font-medium">
                        Flexible document storage for segments, iterations, and insights.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">🔍</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Sequence Logger System</h3>
                      <p className="text-gray-400 font-medium">
                        Revolutionary debugging with unified frontend/backend event tracking.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Private */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="text-4xl mr-3">🔒</span>
                  <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Why This Remains Private
                  </span>
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-300 font-medium">
                    This tool was built for personal mastery, not public distribution. The legal complexities of content rights make public release challenging.
                  </p>
                  <p className="text-gray-300 font-medium">
                    However, I believe in the concept's power. If you're interested in building a platform where users upload their own content—avoiding copyright issues entirely—let's connect. Together we could democratize deliberate practice.
                  </p>
                  <div className="bg-gradient-to-r from-yellow-900/40 to-amber-900/40 p-5 rounded-lg mt-4 border border-yellow-700/50 backdrop-blur-sm">
                    <p className="text-yellow-300 font-semibold">
                      Vision: A YouTube for deliberate practice, where learners own their content and iterations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="space-y-8">
            {/* Player Evolution */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-teal-900/30 to-cyan-900/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="text-4xl mr-3">📸</span>
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    Player Evolution
                  </span>
                </h2>
              
                {/* Vanilla JavaScript Player */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-4">🍦 Vanilla JavaScript Frontend Media Player</h3>
                  <p className="text-gray-300 mb-6 font-medium">
                    The initial implementation using pure JavaScript - clean, fast, and functional. This version proved that simplicity wins over complexity.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative rounded-xl overflow-hidden border border-gray-700">
                      <img 
                        src="/images/vanilla Javascript Frontend media player - screenshot-1.png" 
                        alt="Vanilla JavaScript Player Screenshot 1"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-gray-700">
                      <img 
                        src="/images/vanilla Javascript Frontend media player - screenshot-2.png" 
                        alt="Vanilla JavaScript Player Screenshot 2"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* React Delux Player */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-4">
                    <span>⚛️</span>
                    <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent ml-2">
                      React Delux Frontend Media Player
                    </span>
                  </h3>
                  <p className="text-gray-300 mb-6 font-medium">
                    The polished React-based implementation with enhanced UI, better state management, and the revolutionary sequence logging system.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative rounded-xl overflow-hidden border border-gray-700">
                      <img 
                        src="/images/React Delux Frontend media player - screenshot-1.png" 
                        alt="React Delux Player Screenshot 1"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-gray-700">
                      <img 
                        src="/images/React Delux Frontend media player - screenshot-2.png" 
                        alt="React Delux Player Screenshot 2"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Sequence Logger Output */}
                <div>
                  <h3 className="text-2xl font-bold text-green-400 mb-4">🔍 Sequence Logger Output</h3>
                  <p className="text-gray-300 mb-6 font-medium">
                    The game-changing unified logging system that shows the exact sequence of frontend and backend events. This innovation revealed race conditions and timing issues that were invisible with traditional logging.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative rounded-xl overflow-hidden border border-gray-700">
                      <img 
                        src="/images/Sequence Logger Output - Screenshot-1.png" 
                        alt="Sequence Logger Output Screenshot 1"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-gray-700">
                      <img 
                        src="/images/Sequence Logger Output - Screenshot-2.png" 
                        alt="Sequence Logger Output Screenshot 2"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="text-4xl mr-3">🎯</span>
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    Real Benefits I've Experienced
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-600 hover:border-green-500/50 transition-colors">
                    <h3 className="text-xl font-bold text-green-400 mb-3">Language Learning</h3>
                    <p className="text-gray-300 font-medium">
                      Mastered complex pronunciation patterns by looping native speaker segments. What took months now takes weeks.
                    </p>
                  </div>
                  <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-600 hover:border-blue-500/50 transition-colors">
                    <h3 className="text-xl font-bold text-blue-400 mb-3">Technical Concepts</h3>
                    <p className="text-gray-300 font-medium">
                      Complex algorithms become intuitive when you watch the same explanation 108 times with full attention.
                    </p>
                  </div>
                  <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-600 hover:border-purple-500/50 transition-colors">
                    <h3 className="text-xl font-bold text-purple-400 mb-3">Music & Rhythm</h3>
                    <p className="text-gray-300 font-medium">
                      Internalized complex rhythms that seemed impossible. The pattern reveals itself through iteration.
                    </p>
                  </div>
                  <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-600 hover:border-orange-500/50 transition-colors">
                    <h3 className="text-xl font-bold text-orange-400 mb-3">Problem Solving</h3>
                    <p className="text-gray-300 font-medium">
                      Watching master problem solvers repeatedly builds intuition for their thought patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'source' && (
          <div className="space-y-8">
            {/* Key Features */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="text-4xl mr-3">🔑</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Key Features
                  </span>
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-400 mb-2">Intelligent Segment Management</h3>
                    <p className="text-gray-300 mb-3 font-medium">Automatically splits content into digestible 20-second segments</p>
                    <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <code className="text-green-400 text-sm">{`# Split video into segments
python split_video.py --input lecture.mp4 --segment-length 20
# Output: lecture_001.mp4, lecture_002.mp4, ...`}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-pink-400 mb-2">Loop Counter & Analytics</h3>
                    <p className="text-gray-300 mb-3 font-medium">Track iterations and identify learning patterns</p>
                    <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <code className="text-green-400 text-sm">{`{
  "segment_id": "lecture_042",
  "iterations": 67,
  "insights": [
    {"iteration": 23, "note": "Pattern emerging"},
    {"iteration": 45, "note": "Connection to previous concept"},
    {"iteration": 67, "note": "Full understanding achieved"}
  ]
}`}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-purple-400 mb-2">Unified Sequence Logger</h3>
                    <p className="text-gray-300 mb-3 font-medium">Revolutionary debugging tool that unifies frontend and backend events</p>
                    <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      <code className="text-green-400 text-sm">{`[2024-01-15 10:23:45.123] [FE] User clicked play button
[2024-01-15 10:23:45.125] [BE] Received play request for segment_042
[2024-01-15 10:23:45.128] [BE] Streaming media chunk 1/5
[2024-01-15 10:23:45.156] [FE] Media buffer received
[2024-01-15 10:23:45.158] [FE] Playback started`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Architecture */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-blue-900/30 to-green-900/30 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="text-4xl mr-3">📂</span>
                  <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                    Project Structure
                  </span>
                </h2>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-gray-300">
                  <code>{`segment-loop-master/
├── frontend/
│   ├── vanilla/          # Pure JS implementation
│   ├── react-delux/      # React enhanced version
│   └── shared/           # Common utilities
├── backend/
│   ├── api/              # FastAPI endpoints
│   ├── services/         # Business logic
│   └── models/           # MongoDB schemas
├── scripts/
│   ├── split_video.py    # Video segmentation
│   ├── analyze_logs.py   # Sequence log analyzer
│   └── setup_db.py       # Database initialization
└── docs/
    ├── philosophy.md     # The why behind it
    └── api.md           # API documentation`}</code>
                </pre>
              </div>
            </div>

            {/* Call to Action */}
            <div className="relative group transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
              <div className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-4 flex items-center">
                  <span className="text-4xl mr-3">🚀</span>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Want to Build This Together?
                  </span>
                </h2>
                <p className="text-gray-300 mb-6">
                  While this specific implementation remains private, I'm excited about creating a public platform where learners can upload their own content and practice deliberately. 
                  Imagine a world where anyone can master anything through structured iteration.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/founders"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    Partner With Me
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link 
                    href="/investors"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
                  >
                    Explore Investment Opportunity
                    <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link 
              href="/mastery" 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Mastery Hub
            </Link>
            <div className="text-center text-sm">
              <span>
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent font-bold">Built with</span>
                <span className="mx-1">🧠</span>
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent font-bold">and 10,000 iterations</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}