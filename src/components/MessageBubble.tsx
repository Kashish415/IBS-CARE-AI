import React from 'react'
import { User, Bot } from 'lucide-react'

interface MessageBubbleProps {
  message: string
  isUser: boolean
  timestamp: string
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser, timestamp }) => {
  // Format AI messages for better readability
  const formatMessage = (text: string) => {
    if (isUser) return text

    // Split by double line breaks to create paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim())

    return paragraphs.map((paragraph, index) => {
      // Handle bullet points
      if (paragraph.includes('•') || paragraph.includes('*')) {
        const lines = paragraph.split('\n').map(line => line.trim()).filter(line => line)
        return (
          <div key={index} className={index > 0 ? 'mt-3' : ''}>
            {lines.map((line, lineIndex) => {
              if (line.startsWith('•') || line.startsWith('*')) {
                return (
                  <div key={lineIndex} className="flex items-start space-x-2 mb-1">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="flex-1">{formatTextFormatting(line.replace(/^[•*]\s*/, ''))}</span>
                  </div>
                )
              }
              return <div key={lineIndex} className="mb-1">{formatTextFormatting(line)}</div>
            })}
          </div>
        )
      }

      // Handle regular paragraphs
      return (
        <div key={index} className={index > 0 ? 'mt-3' : ''}>
          {formatTextFormatting(paragraph)}
        </div>
      )
    })
  }

  // Handle bold text and other simple formatting
  const formatTextFormatting = (text: string) => {
    // Handle **bold** text
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2)
        return <strong key={index} className="font-semibold text-blue-600">{boldText}</strong>
      }
      return part
    })
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start space-x-3 max-w-lg ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-purple-700'
            : 'bg-blue-100'
        } rounded-full p-2`}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Bot className="h-4 w-4 text-blue-600" />
          )}
        </div>

        <div className={`rounded-2xl p-4 ${
          isUser
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
            : 'bg-gray-50 text-gray-900 border border-gray-200'
        }`}>
          <div className="text-sm leading-relaxed">
            {isUser ? message : formatMessage(message)}
          </div>
          <p className={`text-xs mt-2 ${
            isUser ? 'text-purple-200' : 'text-gray-500'
          }`}>
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
