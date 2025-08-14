import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatRequest {
  user_id: string
  message: string
  conversation_id?: string
}

interface ChatResponse {
  reply: string
  sources: string[]
  tokens_used?: number
  summary?: string
  recommendations?: string[]
  reasoning?: string
  source_context?: string[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Parse request body
    const { user_id, message }: ChatRequest = await req.json()

    // Verify user_id matches authenticated user
    if (user_id !== user.id) {
      throw new Error('User ID mismatch')
    }

    // Fetch user's recent logs for context (last 14 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data: recentLogs, error: logsError } = await supabaseClient
      .from('daily_logs')
      .select('*')
      .eq('user_id', user_id)
      .gte('log_date', fourteenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('Error fetching logs:', logsError)
    }

    // Build history summary
    const historySummary = buildHistorySummary(recentLogs || [])

    // Build the prompt for Gemini
    const prompt = buildGeminiPrompt(message, historySummary)

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(prompt)

    // Parse the response
    const parsedResponse = parseGeminiResponse(geminiResponse)

    // Save user message
    await supabaseClient
      .from('chat_messages')
      .insert({
        user_id,
        role: 'user',
        content: message
      })

    // Save assistant response
    await supabaseClient
      .from('chat_messages')
      .insert({
        user_id,
        role: 'assistant',
        content: parsedResponse.reply,
        metadata: {
          sources: parsedResponse.sources,
          summary: parsedResponse.summary,
          recommendations: parsedResponse.recommendations,
          reasoning: parsedResponse.reasoning,
          source_context: parsedResponse.source_context
        }
      })

    return new Response(
      JSON.stringify(parsedResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in gemini-chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function buildHistorySummary(logs: any[]): string {
  if (!logs || logs.length === 0) {
    return "No recent health logs available."
  }

  const summary = logs.map(log => {
    const parts = [`Date: ${log.log_date}`]
    if (log.mood) parts.push(`Mood: ${log.mood}`)
    if (log.energy !== null) parts.push(`Energy: ${log.energy}/10`)
    if (log.symptom_severity !== null) parts.push(`Symptom severity: ${log.symptom_severity}/10`)
    if (log.sleep_hours) parts.push(`Sleep: ${log.sleep_hours}h`)
    if (log.water_ml) parts.push(`Water: ${log.water_ml}ml`)
    if (log.symptoms && Array.isArray(log.symptoms) && log.symptoms.length > 0) {
      parts.push(`Symptoms: ${log.symptoms.map((s: any) => s.name).join(', ')}`)
    }
    if (log.notes) parts.push(`Notes: ${log.notes.substring(0, 100)}`)
    return parts.join(' | ')
  }).join('\n')

  return summary
}

function buildGeminiPrompt(userMessage: string, historySummary: string): string {
  return `SYSTEM: You are "IBS Care AI", a compassionate, evidence-aware assistant that provides supportive, non-diagnostic guidance for people tracking IBS symptoms. Use user history to personalize responses. Use a neutral, caring tone and encourage seeking medical professionals when necessary.

USER MESSAGE: ${userMessage}

--- USER HISTORY (most recent first, summary) ---
${historySummary}
--- END HISTORY ---

INSTRUCTIONS TO LLM:
1) First produce a short empathetic reply (1-3 sentences).
2) Then produce 3 concrete, practical suggestions tailored to the user's recent logs (sleep, water, symptoms).
3) If the user's symptoms appear acute or severe (symptom_severity >= 8), put a strong suggestion to seek medical attention.
4) Provide suggested daily actions the user can try tomorrow (e.g., dietary tweak, hydration, sleep hygiene).
5) Provide a compact "why" explanation with citations to general guidelines (non-specific — do not fabricate citations).
6) Return a JSON object at the end with keys: { "summary": "...", "recommendations": [...], "reasoning": "...", "source_context": [...] }.

ALWAYS include a brief bullet list of which user logs were used to personalize the reply (date and key fields).

Please respond in a structured format that can be parsed as JSON.`
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API')
  }

  return data.candidates[0].content.parts[0].text
}

function parseGeminiResponse(response: string): ChatResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    let structuredData = {}
    
    if (jsonMatch) {
      try {
        structuredData = JSON.parse(jsonMatch[0])
      } catch (e) {
        console.warn('Failed to parse JSON from Gemini response')
      }
    }

    // Extract the main reply (everything before the JSON)
    const reply = jsonMatch ? response.substring(0, jsonMatch.index).trim() : response

    return {
      reply: reply || response,
      sources: ['Recent health logs', 'General IBS management guidelines'],
      summary: (structuredData as any).summary || 'Personalized health guidance based on your recent logs',
      recommendations: (structuredData as any).recommendations || [],
      reasoning: (structuredData as any).reasoning || 'Based on your recent symptom patterns and general health guidelines',
      source_context: (structuredData as any).source_context || ['User health logs from past 14 days']
    }
  } catch (error) {
    console.error('Error parsing Gemini response:', error)
    return {
      reply: response,
      sources: ['Recent health logs'],
      summary: 'Health guidance based on your logs',
      recommendations: [],
      reasoning: 'General health recommendations',
      source_context: ['User health data']
    }
  }
}