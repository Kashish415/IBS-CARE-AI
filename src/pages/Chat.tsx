import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Brain,
  Send,
  Heart,
  Bot,
  User,
  Loader
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { aiService, ChatMessage } from '../lib/ai-service'
import { backendAPI } from '../lib/backend-api'
import MessageBubble from '../components/MessageBubble'

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, loading: authLoading } = useAuth()

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard', current: false },
    { name: 'AI Chat', icon: MessageSquare, href: '/chat', current: true },
    { name: 'Daily Log', icon: Calendar, href: '/logs', current: false },
    { name: 'Assessment', icon: Brain, href: '/assessment', current: false },
    { name: 'Profile', icon: User, href: '/profile', current: false }
  ]

  useEffect(() => {
    if (!authLoading && user) {
      loadChatHistory()
    } else if (!authLoading && !user) {
      setInitialLoading(false)
    }
  }, [user, authLoading])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    if (!user) return

    try {
      setInitialLoading(true)
      setError('')

      console.log('🔄 Loading chat history for user:', user.uid)

      // Fetch chat history and intro message in parallel
      const [history, introData] = await Promise.all([
        aiService.getChatHistory(user.uid),
        fetchIntroMessage()
      ])

      if (history.length === 0) {
        // Set personalized intro message for new users
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: introData.intro_message || 'Hello! I\'m your personalized IBS care assistant. I\'m here to help you manage your symptoms and provide evidence-based advice tailored to your health history. How are you feeling today?',
          timestamp: new Date().toISOString()
        }
        setMessages([welcomeMessage])
        setSuggestions(introData.suggestions || [])
        setShowSuggestions(true)
        console.log('✅ Initialized chat with welcome message')
      } else {
        setMessages(history)
        setShowSuggestions(false)
        console.log(`✅ Loaded ${history.length} chat messages`)
      }
    } catch (error: any) {
      console.error('❌ Failed to load chat history:', error)

      // Fallback intro message
      const fallbackMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your IBS care assistant. I\'m here to help you manage your symptoms and provide personalized advice. How are you feeling today?',
        timestamp: new Date().toISOString()
      }
      setMessages([fallbackMessage])
      setSuggestions([
        'How can I improve my digestive health?',
        'What foods should I avoid with IBS?',
        'Help me manage stress and anxiety',
        'Tell me about my symptom patterns'
      ])
      setShowSuggestions(true)
      setError('Unable to load chat history. Starting fresh conversation.')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchIntroMessage = async () => {
    try {
      console.log('🔄 Fetching personalized intro message')
      const introData = await backendAPI.getIntroMessage(user?.uid)
      console.log('✅ Received personalized intro message')
      return introData
    } catch (error) {
      console.warn('⚠️ Failed to fetch intro message, using fallback')
      return {
        intro_message: 'Hello! I\'m your IBS care assistant. I\'m here to help you manage your symptoms and provide personalized advice based on your health history. How are you feeling today?',
        suggestions: [
          'How can I improve my digestive health?',
          'What foods should I avoid with IBS?',
          'Help me manage stress and anxiety',
          'Tell me about my symptom patterns'
        ],
        context_available: false
      }
    }
  }

  const sendMessage = async (e: React.FormEvent, messageText?: string) => {
    e.preventDefault()
    const messageToSend = messageText || inputMessage.trim()
    if (!messageToSend || loading || !user) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)
    setError('')
    setShowSuggestions(false) // Hide suggestions after first message

    try {
      console.log('🤖 Sending message to AI:', messageToSend)
      
      // Call backend API service with user context
      const data = await backendAPI.sendChatMessage(messageToSend, user.uid)

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
      console.log('✅ Received AI response')

      // Save to Firebase for persistence
      try {
        await aiService.saveChatMessage(user.uid, messageToSend, data.reply)
        console.log('✅ Chat saved to Firebase')
      } catch (saveError) {
        console.warn('⚠️ Failed to save chat to Firebase:', saveError)
      }

    } catch (error: any) {
      console.error('❌ Failed to send message:', error)

      let errorContent = `I apologize, but I'm experiencing technical difficulties right now. `

      if (error.message.includes('Authentication') || error.message.includes('401')) {
        errorContent += `Please try signing out and signing back in to continue our conversation.`
        setError('Authentication error. Please sign in again.')
      } else if (error.message.includes('Rate limit') || error.message.includes('429')) {
        errorContent += `I'm receiving a high volume of requests. Please wait a moment before trying again.`
        setError('Rate limit exceeded. Please try again in a moment.')
      } else if (error.message.includes('server') || error.message.includes('500')) {
        errorContent += `There's a temporary server issue. Please try again in a few minutes.`
        setError('Server error. Please try again later.')
      } else if (error.message.includes('network') || error.message.includes('Network')) {
        errorContent += `Please check your internet connection and try again.`
        setError('Network connection issue. Please check your internet.')
      } else {
        errorContent += `Please try again, and if the problem persists, you can:

• Review your health dashboard 📊
• Add today's symptoms to your log 📝  
• Take our IBS assessment for insights 🧠

I'll be ready to help as soon as the issue is resolved! 💙`
        setError('Unable to process your message. Please try again.')
      }

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    // Auto-send the suggestion
    setTimeout(() => {
      if (suggestion.trim()) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent
        sendMessage(fakeEvent, suggestion)
      }
    }, 100)
  }

  const clearChat = async () => {
    if (window.confirm('Clear all messages? This action cannot be undone.')) {
      setMessages([])
      setError('')
      setShowSuggestions(true)
      // Reload with welcome message
      await loadChatHistory()
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in to chat with your AI health assistant</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                IBS Care
              </span>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 ml-64 flex flex-col h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-lg">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    AI Health Assistant
                  </h1>
                  <p className="text-sm text-gray-600">
                    {loading
                      ? 'Thinking...'
                      : 'Personalized IBS support & guidance'
                    }
                  </p>
                </div>
              </div>
              
              {messages.length > 1 && (
                <button
                  onClick={clearChat}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear Chat
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {initialLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your chat...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message.content}
                    isUser={message.role === 'user'}
                    timestamp={message.timestamp}
                  />
                ))}
                
                {loading && (
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-md">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">AI is analyzing your health data...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-6 pb-2">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Suggestion Buttons */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150 text-purple-700 text-sm font-medium rounded-full border border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
                    disabled={loading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="bg-white border-t border-gray-200 p-6">
            <form onSubmit={sendMessage} className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about IBS management, diet tips, or how you're feeling..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {loading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
