import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ChatMessage, ChatResponse } from '../types/database'
import { useAuth } from './useAuth'

export function useChat() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isTyping, setIsTyping] = useState(false)

  const messagesQuery = useQuery({
    queryKey: ['chat-messages', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No user')
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as ChatMessage[]
    },
    enabled: !!user
  })

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error('No user')

      setIsTyping(true)

      // Save user message
      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: 'user',
          content: message
        })
        .select()
        .single()

      if (userError) throw userError

      // Mock AI response for now (replace with actual edge function call)
      const aiResponse: ChatResponse = {
        reply: "Thank you for sharing that with me. I understand how challenging IBS can be. Based on your recent logs, I notice some patterns that might be helpful to discuss.\n\nHere are some personalized suggestions:\n1. Try to maintain consistent meal times\n2. Consider keeping a food diary to identify triggers\n3. Ensure you're getting adequate hydration\n\nRemember, I'm here to provide supportive guidance, but please consult with your healthcare provider for medical advice.",
        sources: ['Recent health logs', 'General IBS management guidelines'],
        summary: 'Personalized health guidance based on your recent logs',
        recommendations: [
          'Maintain consistent meal times',
          'Keep a food diary',
          'Stay hydrated'
        ],
        reasoning: 'Based on your recent symptom patterns and general health guidelines'
      }

      // Save AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role: 'assistant',
          content: aiResponse.reply,
          metadata: {
            sources: aiResponse.sources,
            summary: aiResponse.summary,
            recommendations: aiResponse.recommendations,
            reasoning: aiResponse.reasoning,
            source_context: aiResponse.source_context
          }
        })
        .select()
        .single()

      if (aiError) throw aiError

      return { userMessage, aiMessage, aiResponse }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', user?.id] })
      setIsTyping(false)
    },
    onError: () => {
      setIsTyping(false)
    }
  })

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user')

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', user?.id] })
    }
  })

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    isTyping,
    clearChat: clearChatMutation.mutate,
    isClearing: clearChatMutation.isPending
  }
}