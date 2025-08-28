import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Home,
  MessageSquare,
  Calendar,
  Brain,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Heart,
  Award,
  User
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { assessmentQuestions, assessmentService, AssessmentResult } from '../lib/assessment'
import { backendAPI } from '../lib/backend-api'

interface Question {
  id: string
  question: string
  type: 'multiple_choice' | 'scale' | 'text' | 'checkbox'
  options?: string[]
  required: boolean
  category: string
}

const Assessment: React.FC = () => {
  const [questions] = useState<Question[]>(assessmentQuestions)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const sidebarItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard', current: false },
    { name: 'AI Chat', icon: MessageSquare, href: '/chat', current: false },
    { name: 'Daily Log', icon: Calendar, href: '/logs', current: false },
    { name: 'Assessment', icon: Brain, href: '/assessment', current: true },
    { name: 'Profile', icon: User, href: '/profile', current: false }
  ]

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const handleCheckboxAnswer = (questionId: string, option: string, checked: boolean) => {
    const currentAnswers = answers[questionId] || []
    let newAnswers: string[]
    
    if (checked) {
      newAnswers = [...currentAnswers, option]
    } else {
      newAnswers = currentAnswers.filter((item: string) => item !== option)
    }
    
    setAnswers({ ...answers, [questionId]: newAnswers })
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitAssessment = async () => {
    setSubmitting(true)
    setError('')

    try {
      console.log('🧠 Processing assessment with answers:', answers)
      
      // Use local assessment service to analyze answers
      const assessmentResult = assessmentService.assessAnswers(answers)
      
      // Save assessment result to Firestore if user is logged in
      if (user) {
        try {
          // Save assessment result using backend API
          await backendAPI.submitAssessment({
            user_id: user.uid,
            answers: answers,
            type: assessmentResult.classification.ibs_type,
            severity: assessmentResult.classification.severity,
            score: assessmentResult.classification.score,
            recommendations: assessmentResult.classification.recommendations
          })
          console.log('✅ Assessment result saved')
        } catch (saveError) {
          console.warn('⚠️ Failed to save assessment result:', saveError)
          // Continue with local result even if saving fails
        }
      }
      
      setResult(assessmentResult)
      console.log('✅ Assessment completed successfully')
      
    } catch (error: any) {
      console.error('❌ Assessment processing failed:', error)
      setError('Failed to process assessment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const goToDashboard = () => {
    navigate('/dashboard')
  }

  if (result) {
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

          {/* Results */}
          <div className="flex-1 ml-64 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Award className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h1>
                <p className="text-gray-600">Here are your personalized results and recommendations</p>
              </div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-purple-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">IBS Type</h3>
                    <p className="text-2xl font-bold text-purple-600">{result.classification.ibs_type}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.classification.ibs_type === 'IBS-C' ? 'Constipation-predominant' :
                       result.classification.ibs_type === 'IBS-D' ? 'Diarrhea-predominant' :
                       result.classification.ibs_type === 'IBS-M' ? 'Mixed bowel habits' : 'Unspecified'}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Severity</h3>
                    <p className={`text-2xl font-bold ${
                      result.classification.severity === 'Mild' ? 'text-green-600' :
                      result.classification.severity === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {result.classification.severity}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Score: {result.classification.score}</p>
                  </div>

                  <div className="text-center p-6 bg-green-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Confidence</h3>
                    <p className="text-2xl font-bold text-green-600">{Math.round(result.classification.confidence * 100)}%</p>
                    <p className="text-sm text-gray-600 mt-1">Assessment accuracy</p>
                  </div>
                </div>

                <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical Assessment</h3>
                  <p className="text-gray-700">{result.classification.reasoning}</p>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Personalized Recommendations</h3>
                  <div className="space-y-4 mb-8">
                    {result.classification.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Next Steps</h3>
                  <div className="space-y-4">
                    {result.next_steps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="bg-purple-100 text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={goToDashboard}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-200"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  // Check if current question is answered
  const isAnswered = () => {
    const answer = answers[currentQ?.id]
    if (currentQ?.type === 'checkbox') {
      return answer && Array.isArray(answer) && answer.length > 0
    }
    return answer !== undefined && answer !== null && answer !== ''
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

        {/* Assessment */}
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">IBS Health Assessment</h1>
              <p className="text-gray-600">Answer these questions to get personalized insights about your IBS</p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Question */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                  {currentQ?.category.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQ?.question}
              </h2>

              {currentQ?.type === 'multiple_choice' && (
                <div className="space-y-3">
                  {currentQ.options?.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={currentQ.id}
                        value={option}
                        checked={answers[currentQ.id] === option}
                        onChange={() => handleAnswer(currentQ.id, option)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ?.type === 'checkbox' && (
                <div className="space-y-3">
                  {currentQ.options?.map((option, index) => (
                    <label key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={(answers[currentQ.id] || []).includes(option)}
                        onChange={(e) => handleCheckboxAnswer(currentQ.id, option, e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQ?.type === 'scale' && (
                <div className="space-y-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={answers[currentQ.id] || 5}
                    onChange={(e) => handleAnswer(currentQ.id, parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>1 (No impact/Never)</span>
                    <span className="font-medium text-purple-600 text-lg">
                      {answers[currentQ.id] || 5}
                    </span>
                    <span>10 (Severe impact/Always)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={submitAssessment}
                  disabled={!isAnswered() || submitting}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Assessment
                      <CheckCircle className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  disabled={!isAnswered()}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  Next
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assessment
