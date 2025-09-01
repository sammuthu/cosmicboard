'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'

// Stealth mode: Enterprise RAG Solutions focused portfolio
export default function PrismPortfolio() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedTheme, setSelectedTheme] = useState<string>('sun')
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  const themes = useMemo(() => [
    { id: 'moon', icon: '🌙', name: 'Moon', bgClass: 'from-slate-900 via-blue-900 to-indigo-950' },
    { id: 'sun', icon: '☀️', name: 'Sun', bgClass: 'from-orange-900 via-amber-900 to-yellow-900' },
    { id: 'comet', icon: '☄️', name: 'Comet', bgClass: 'from-purple-900 via-violet-900 to-indigo-900' },
    { id: 'earth', icon: '🌍', name: 'Earth', bgClass: 'from-blue-900 via-teal-900 to-green-900' },
    { id: 'rocket', icon: '🚀', name: 'Rocket', bgClass: 'from-gray-900 via-slate-800 to-zinc-900' },
    { id: 'saturn', icon: '🪐', name: 'Saturn', bgClass: 'from-purple-900 via-fuchsia-900 to-pink-900' },
    { id: 'sparkle', icon: '✨', name: 'Sparkle', bgClass: 'from-pink-900 via-rose-900 to-purple-900' }
  ], [])
  
  // Removed unused toggleCategory function

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpandedCategory(null)
      }
    }

    if (expandedCategory) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [expandedCategory])

  // Auto-play themes on mount
  useEffect(() => {
    if (!isAutoPlaying) return
    
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < themes.length) {
        setSelectedTheme(themes[currentIndex].id)
        currentIndex++
      } else {
        setSelectedTheme('sun')
        setIsAutoPlaying(false)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, themes])

  const handleThemeSelect = (themeId: string) => {
    setIsAutoPlaying(false)
    setSelectedTheme(themeId)
  }

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[1]

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bgClass} transition-all duration-1000`}>
      {/* Theme Selector in Prism Container */}
      <div className="pt-8 pb-2 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
            <div className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 rounded-3xl p-6 shadow-2xl backdrop-blur-sm">
              <div className="flex justify-center items-center gap-6">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    className={`relative group transition-all duration-300 ${
                      selectedTheme === theme.id ? 'scale-125' : 'scale-100 hover:scale-110'
                    }`}
                    aria-label={`Select ${theme.name} theme`}
                  >
                    <span className={`text-4xl block transition-all duration-300 ${
                      selectedTheme === theme.id ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''
                    }`}>
                      {theme.icon}
                    </span>
                    {selectedTheme === theme.id && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="flex items-center pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Introduction Card */}
          <div className="relative group transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 shadow-2xl backdrop-blur-sm">
              <div className="text-center mb-10">
                {/* Profile Picture */}
                <div className="relative inline-block mb-8">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-75 blur"></div>
                  <Image 
                    src="/images/Sam-Muthu_Profile-Picture.jpg" 
                    alt="Sam Muthu" 
                    width={160}
                    height={160}
                    className="relative w-40 h-40 rounded-full object-cover border-4 border-gray-900 shadow-2xl"
                  />
                </div>
                
                <h1 className="text-6xl md:text-8xl font-bold mb-6">
                  <span className="block text-white mb-2">Hey, I&apos;m</span>
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Sam Muthu
                  </span>
                </h1>
                <div className="inline-flex relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-50 blur"></div>
                  <h2 className="relative text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent px-6 py-2 rounded-full backdrop-blur-sm">
                    I don&apos;t just code—I converse with computers.
                  </h2>
                </div>
              </div>

              {/* Philosophy Cards */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-2xl border border-blue-700/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-blue-300 mb-3">🌐 The New Era</h3>
                  <p className="text-gray-300 font-medium">
                    There&apos;s never been a better time to build. The world now runs on natural language — and I speak it fluently.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-2xl border border-purple-700/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-purple-300 mb-3">🎨 Beyond Syntax</h3>
                  <p className="text-gray-300 font-medium">
                    I don&apos;t memorize syntax. I architect ideas. I don&apos;t just use AI — I guide it, with intention and intuition.
                  </p>
                </div>
              </div>

              {/* Principles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-5 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🧠</span>
                    <div>
                      <h4 className="font-bold text-cyan-400 mb-1">Cloud Cognition</h4>
                      <p className="text-sm text-gray-400">I don&apos;t memorize — I access.</p>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-5 rounded-xl border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h4 className="font-bold text-yellow-400 mb-1">Smart Automation</h4>
                      <p className="text-sm text-gray-400">Automate the boring, create the amazing.</p>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-5 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🧭</span>
                    <div>
                      <h4 className="font-bold text-purple-400 mb-1">Prompt Navigation</h4>
                      <p className="text-sm text-gray-400">Intuition + decades of coding.</p>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-5 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔁</span>
                    <div>
                      <h4 className="font-bold text-green-400 mb-1">Stack Agnostic</h4>
                      <p className="text-sm text-gray-400">Any language, any stack — even future ones.</p>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-5 rounded-xl border border-gray-700 hover:border-pink-500/50 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className="font-bold text-pink-400 mb-1">Tool Orchestration</h4>
                      <p className="text-sm text-gray-400">It&apos;s how I use all tools together.</p>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-5 rounded-xl border border-gray-700 hover:border-orange-500/50 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <h4 className="font-bold text-orange-400 mb-1">Future Ready</h4>
                      <p className="text-sm text-gray-400">Building tomorrow&apos;s solutions today.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise RAG Solutions Section */}
      <section className="pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-90 animate-gradient-x rounded-3xl"></div>
            
            {/* Content container */}
            <div className="relative z-10 p-10 rounded-3xl backdrop-blur-sm">
              {/* Enterprise Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
                <span className="mr-1">🚀</span> ENTERPRISE AI SOLUTIONS
              </div>
              
              <h3 className="text-4xl sm:text-5xl font-extrabold mb-6 text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-400">
                  Next-Generation RAG Systems
                </span>
                <span className="block text-2xl sm:text-3xl mt-2 font-semibold text-white/90">
                  Deploy Sophisticated AI-Augmented Generation at Scale
                </span>
              </h3>
              
              <div className="max-w-3xl mx-auto space-y-4 mb-8">
                <p className="text-lg text-white/95 leading-relaxed font-medium">
                  Transform your organization with <span className="text-yellow-300">production-ready RAG systems</span> that can search and synthesize insights from millions of documents in milliseconds.
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  I architect and deploy <span className="text-cyan-300">open-source RAG solutions</span> that rival enterprise offerings — using any LLM model, with custom connectors to your entire data ecosystem. <span className="text-green-300">Highly scalable, sub-second response times, and 100% under your control.</span>
                </p>
              </div>

              {/* Priority Transformations */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Security Transformation */}
                <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 backdrop-blur rounded-xl p-6 border border-red-500/30">
                  <h4 className="text-xl font-bold text-red-400 mb-3 flex items-center">
                    🔐 Security & Compliance Transformation
                  </h4>
                  <p className="text-white/90 mb-3">
                    <span className="text-yellow-300 font-semibold">Zero-Trust RAG Architecture:</span> Your sensitive data never leaves your infrastructure.
                  </p>
                  <ul className="text-sm text-white/80 space-y-2">
                    <li>✓ Real-time threat detection across all documents</li>
                    <li>✓ Instant compliance auditing (SOC2, HIPAA, GDPR)</li>
                    <li>✓ Natural language security policy queries</li>
                    <li>✓ Automated vulnerability report synthesis</li>
                    <li>✓ On-premise deployment with air-gapped options</li>
                  </ul>
                  <p className="text-xs text-orange-300 mt-3 italic">
                    &quot;What are all the security incidents in the last quarter involving API keys?&quot; - Get answers in seconds, not days.
                  </p>
                </div>

                {/* Data Analytics Transformation */}
                <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur rounded-xl p-6 border border-blue-500/30">
                  <h4 className="text-xl font-bold text-blue-400 mb-3 flex items-center">
                    📊 Natural Language Analytics
                  </h4>
                  <p className="text-white/90 mb-3">
                    <span className="text-cyan-300 font-semibold">No SQL Required:</span> Ask anything in plain English. The RAG system writes and executes the queries.
                  </p>
                  <ul className="text-sm text-white/80 space-y-2">
                    <li>✓ &quot;Show me revenue trends for Q3&quot; - Instant charts</li>
                    <li>✓ &quot;Which customers are at risk of churning?&quot; - AI analysis</li>
                    <li>✓ &quot;Compare this month&apos;s metrics to last year&quot; - Done</li>
                    <li>✓ Auto-generates dashboards from conversations</li>
                    <li>✓ Connects to any data warehouse or lake</li>
                  </ul>
                  <p className="text-xs text-cyan-300 mt-3 italic">
                    Transform every employee into a data analyst. No training required.
                  </p>
                </div>
              </div>

              {/* MCP Server Capabilities */}
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur rounded-xl p-6 border border-purple-500/30 mb-8">
                <h4 className="text-xl font-bold text-purple-400 mb-3">🔮 MCP Server Magic - Talk to Your Databases</h4>
                <p className="text-white/90 mb-4">
                  I build custom <span className="text-yellow-300 font-semibold">Model Context Protocol (MCP) servers</span> that let you query any database in natural language. 
                  No SQL, no syntax, just questions and answers.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-lg p-3">
                    <h5 className="text-cyan-300 font-bold mb-2">Supported Databases</h5>
                    <ul className="text-xs text-white/70 space-y-1">
                      <li>• Oracle</li>
                      <li>• MySQL/PostgreSQL</li>
                      <li>• MongoDB</li>
                      <li>• Snowflake</li>
                      <li>• BigQuery</li>
                    </ul>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <h5 className="text-green-300 font-bold mb-2">Natural Queries</h5>
                    <ul className="text-xs text-white/70 space-y-1">
                      <li>• &quot;Total sales last month?&quot;</li>
                      <li>• &quot;Top 10 customers by revenue&quot;</li>
                      <li>• &quot;Show user growth chart&quot;</li>
                      <li>• &quot;Find all overdue invoices&quot;</li>
                      <li>• &quot;Performance metrics dashboard&quot;</li>
                    </ul>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <h5 className="text-yellow-300 font-bold mb-2">AI Features</h5>
                    <ul className="text-xs text-white/70 space-y-1">
                      <li>• Smart query optimization</li>
                      <li>• Automatic JOIN detection</li>
                      <li>• Result explanation</li>
                      <li>• Anomaly detection</li>
                      <li>• Predictive insights</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Industry Solutions Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <h4 className="text-lg font-bold text-cyan-300 mb-2">🏦 Banking & Finance</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Regulatory compliance documents</li>
                    <li>• Risk assessment reports</li>
                    <li>• Transaction histories & audit trails</li>
                    <li>• Policy & procedure manuals</li>
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <h4 className="text-lg font-bold text-green-300 mb-2">🏥 Healthcare</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Medical records & patient histories</li>
                    <li>• Clinical research papers</li>
                    <li>• Drug interaction databases</li>
                    <li>• Treatment protocols & guidelines</li>
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <h4 className="text-lg font-bold text-purple-300 mb-2">🏢 Insurance</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Policy documents & claims data</li>
                    <li>• Underwriting guidelines</li>
                    <li>• Risk models & actuarial tables</li>
                    <li>• Legal precedents & regulations</li>
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <h4 className="text-lg font-bold text-yellow-300 mb-2">📄 Contract Management</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Legal contracts & agreements</li>
                    <li>• Vendor documentation</li>
                    <li>• Compliance certificates</li>
                    <li>• SLA & performance metrics</li>
                  </ul>
                </div>
              </div>

              {/* Custom Connectors */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20 mb-8">
                <h4 className="text-xl font-bold text-white mb-3">🔌 Custom Data Connectors</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">GitHub</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">Confluence</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">SharePoint</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">Slack</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">JIRA</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">Salesforce</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">Google Workspace</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">S3/Azure Blob</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">MongoDB</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">PostgreSQL</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">Elasticsearch</span>
                  <span className="text-sm bg-gray-900/50 text-cyan-300 px-3 py-1 rounded-lg">Custom APIs</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <a 
                  href="mailto:sammuthu@me.com?subject=Enterprise%20RAG%20Solutions"
                  className="group inline-flex items-center px-8 py-4 bg-white text-purple-700 font-bold text-lg rounded-xl hover:bg-yellow-400 hover:text-black transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50"
                >
                  <svg className="w-6 h-6 mr-3 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Discuss Your RAG Requirements
                </a>
                
                <div className="text-white/80 text-sm">
                  <span className="font-semibold">Enterprise Ready</span> • Secure & Scalable
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segment Loop Master Hero Section */}
      <section className="pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 opacity-90 animate-gradient-x rounded-3xl"></div>
            
            {/* Content container */}
            <div className="relative z-10 p-10 rounded-3xl backdrop-blur-sm">
              {/* Private Badge */}
              <div className="inline-flex items-center bg-black text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
                <span className="mr-1">🔒</span> PRIVATE PROJECT
              </div>
              
              <h3 className="text-4xl sm:text-5xl font-extrabold mb-6 text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-orange-400">
                  Segment Loop Master
                </span>
                <span className="block text-2xl sm:text-3xl mt-2 font-semibold text-white/90">
                  10,000 Iterations to Mastery
                </span>
              </h3>
              
              <div className="max-w-3xl mx-auto space-y-4 mb-8">
                <p className="text-lg text-white/95 leading-relaxed font-medium">
                  Inspired by <span className="text-yellow-300">@naval&apos;s wisdom:</span> &quot;It&apos;s actually 10,000 iterations to mastery, not 10,000 hours. And it&apos;s not even 10,000 but some unknown number—it&apos;s about the number of iterations that drives the learning curve.&quot;
                </p>
                <p className="text-lg text-white/90 leading-relaxed font-medium">
                  <span className="text-yellow-300">Iteration is NOT repetition.</span> Repetition is doing the same thing over and over. Iteration is modifying it with a learning and then doing another version—that&apos;s error correction. <span className="text-yellow-300">Get 10,000 error corrections in anything, you&apos;ll be an expert.</span>
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  Interestingly, Hindu traditions understood this with mantras repeated 108 or 1,008 times—but perhaps what was lost in translation was the iteration aspect. It wasn&apos;t just repetition, but conscious refinement with each cycle.
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  I built this video segment looper for deliberate practice—to master concepts through conscious iteration, not mindless repetition. While I can&apos;t release it publicly due to content rights, if you&apos;re interested in the concept, reach out. Together we could create a platform where people upload their own content for iterative learning.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <a 
                  href="/mastery/segment-loop-master"
                  className="group inline-flex items-center px-8 py-4 bg-white text-orange-700 font-bold text-lg rounded-xl hover:bg-yellow-400 hover:text-black transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-orange-400/50"
                >
                  <svg className="w-6 h-6 mr-3 group-hover:animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Explore the Concept & Demo
                  <svg className="w-4 h-4 ml-2 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                
                <div className="text-white/80 text-sm">
                  <span className="font-semibold">Personal Tool</span> • Built for Deep Learning
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Let's Connect - Hero Section */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90 animate-gradient-x rounded-3xl"></div>
            
            {/* Content container */}
            <div className="relative z-10 p-10 rounded-3xl backdrop-blur-sm">
              {/* Connect Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-2 rounded-full text-sm font-bold mb-4">
                <span className="mr-2">🤝</span> LET&apos;S CONNECT
              </div>
              
              <h3 className="text-4xl sm:text-5xl font-extrabold mb-6 text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-orange-400">
                  Transform Your Industry with AI
                </span>
                <span className="block text-2xl sm:text-3xl mt-2 font-semibold text-white/90">
                  Before the Rest of the World Catches Up
                </span>
              </h3>
              
              <div className="max-w-3xl mx-auto space-y-4 mb-8">
                <p className="text-lg text-white/95 leading-relaxed font-medium">
                  I architect <span className="text-yellow-300">enterprise-grade RAG systems</span> that give your organization 
                  <span className="text-cyan-300"> superhuman intelligence</span> over your data. 
                  <span className="text-green-300"> Deploy cutting-edge AI today</span> — not someday.
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  Transform petabytes of unstructured data into instant, actionable insights. 
                  I bring the technical expertise to make AI transformation real, scalable, and profitable.
                </p>
              </div>
              
              {/* AI Capabilities Showcase */}
              <div className="grid md:grid-cols-2 gap-4 mt-8 mb-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <h4 className="text-lg font-bold text-cyan-300 mb-2">🚀 What I Build</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• Production RAG systems with sub-second response</li>
                    <li>• Multi-modal AI that processes text, code, images</li>
                    <li>• Custom LLM integrations (OpenAI, Anthropic, Open Source)</li>
                    <li>• Intelligent document processing pipelines</li>
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <h4 className="text-lg font-bold text-green-300 mb-2">⚡ Why It Matters</h4>
                  <ul className="text-sm text-white/80 space-y-1">
                    <li>• 100x faster decision making</li>
                    <li>• Unlock insights from millions of documents</li>
                    <li>• Stay ahead of regulatory compliance</li>
                    <li>• Transform knowledge into competitive advantage</li>
                  </ul>
                </div>
              </div>
              
              {/* Call to Action */}
              <div className="text-center">
                <p className="text-xl text-white font-bold mb-6">
                  Ready to give your organization an <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">unfair AI advantage?</span>
                </p>
                <a 
                  href="mailto:sammuthu@me.com?subject=Enterprise%20AI%20Transformation"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Let&apos;s Transform Your Enterprise with AI
                </a>
              </div>
              
              {/* Quick Connect Links */}
              <div className="flex justify-center gap-6 mt-8">
                <a 
                  href="https://www.linkedin.com/in/sammuthu007" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-all"
                  aria-label="LinkedIn Profile"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="mailto:sammuthu@me.com"
                  className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-all"
                  aria-label="Email"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
                <a 
                  href="tel:+16504668804"
                  className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-all"
                  aria-label="Phone"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Wisdom Note */}
          <div className="text-center">
            <p className="text-sm text-gray-400 italic">
              Want more details? Ask ChatGPT about me. It knows a few things 😉
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}