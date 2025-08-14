import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Trash2, MessageCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../hooks/useAuth'
import { formatTime } from '../lib/utils'

export function Chat() {
  const { user } = useAuth()
  const { messages, sendMessage, isSending, isTyping, clearChat, isClearing } = useChat()
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isSending) return

    sendMessage(inputMessage.trim())
    setInputMessage('')
  }

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all chat messages? This action cannot be undone.')) {
      clearChat()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Health Assistant</h1>
              <p className="text-gray-600">
                Get personalized insights based on your health data. Ask me anything about your symptoms, patterns, or general IBS management.
              </p>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                disabled={isClearing}
                className="ml-4"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center">
              <Bot className="h-5 w-5 mr-2 text-primary" />
              IBS Care AI Assistant
            </CardTitle>
            <p className="text-sm text-gray-600">
              This AI gives supportive guidance — not a medical diagnosis. Always consult healthcare professionals for medical advice.
            </p>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-600 mb-4">
                    Ask me about your symptoms, get insights from your logs, or learn about IBS management.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>Try asking:</p>
                    <ul className="space-y-1">
                      <li>"How have my symptoms been trending lately?"</li>
                      <li>"What patterns do you see in my logs?"</li>
                      <li>"Any suggestions for better sleep?"</li>
                    </ul>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && (
                          <Bot className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                        )}
                        {message.role === 'user' && (
                          <User className="h-5 w-5 mt-0.5 text-primary-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Show metadata for assistant messages */}
                          {message.role === 'assistant' && message.metadata && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {message.metadata.recommendations && message.metadata.recommendations.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-gray-600 mb-1">Recommendations:</p>
                                  <ul className="text-xs text-gray-600 space-y-1">
                                    {message.metadata.recommendations.map((rec: string, index: number) => (
                                      <li key={index} className="flex items-start">
                                        <span className="mr-1">•</span>
                                        <span>{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {message.metadata.sources && message.metadata.sources.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-1">Sources:</p>
                                  <p className="text-xs text-gray-600">
                                    {message.metadata.sources.join(', ')}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs opacity-70 mt-2">
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about your symptoms, patterns, or IBS management..."
                disabled={isSending}
                className="flex-1"
                maxLength={500}
              />
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                size="icon"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send • {inputMessage.length}/500 characters
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}