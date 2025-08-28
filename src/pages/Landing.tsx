import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Heart, BarChart3, MessageSquare, Brain, Activity, Calendar } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm border border-purple-100 text-purple-800 mb-4">
              <Heart className="h-4 w-4 mr-2" />
              AI-Powered IBS Management
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Personal
            <span className="block bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              IBS Care Assistant
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Manage your IBS symptoms with AI-powered insights, personalized tracking, and 
            supportive care. Take control of your digestive health journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 border-2 border-green-500 text-lg font-medium rounded-xl text-green-600 bg-white hover:bg-green-50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Brain className="mr-2 h-5 w-5" />
              Take Free Assessment
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            ✨ No credit card required • Free assessment takes 3-5 minutes
          </p>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white py-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-gray-600">Built with medical expertise and evidence-based practices</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical Grade</h3>
              <div className="text-gray-600">HIPAA compliant and secure</div>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <div className="text-gray-600">Advanced machine learning</div>
            </div>
            <div className="p-6">
              <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient First</h3>
              <div className="text-gray-600">Designed for your needs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-gray-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Take Control of Your <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">IBS Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Personalized insights, symptom tracking, and AI-powered 
              recommendations to help you manage IBS symptoms and 
              improve your quality of life.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-3 rounded-xl flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Support</h3>
                  <p className="text-gray-600">
                    Get personalized recommendations and instant answers to your 
                    IBS-related questions from our advanced AI assistant.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Symptom Tracking</h3>
                  <p className="text-gray-600">
                    Monitor your daily symptoms, mood, and triggers with easy-to-use 
                    tracking tools and visualize your progress over time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-xl flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Insights</h3>
                  <p className="text-gray-600">
                    Receive customized dietary suggestions, lifestyle tips, and 
                    management strategies based on your unique patterns.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Health Dashboard</h4>
                <p className="text-gray-600 mb-6">
                  Track your symptoms, monitor patterns, and get AI-powered insights to better understand your IBS.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Daily symptom tracking
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                      Personalized insights
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-purple-500 mr-2" />
                      Progress visualization
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/signup"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 block text-center shadow-lg"
              >
                Start Your Journey →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment CTA Section */}
      <div className="relative bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-12 h-12 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-8 h-8 bg-white rounded-full"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 p-4 rounded-2xl w-20 h-20 mx-auto mb-8 flex items-center justify-center">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Discover Your IBS Type with Our Free Assessment
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Take our comprehensive 5-minute assessment to understand your IBS subtype and get personalized recommendations from healthcare professionals.
          </p>
          <div className="space-y-4">
            <Link
              to="/signup"
              className="inline-flex items-center px-10 py-4 border-2 border-white text-lg font-medium rounded-xl text-green-600 bg-white hover:bg-green-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              <Brain className="mr-3 h-6 w-6" />
              Take Free Assessment
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
            <p className="text-green-100 text-sm">
              ✨ No credit card required • Takes 5 minutes • Instant results
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white rounded-full"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-xl w-16 h-16 mx-auto mb-8 flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to start your journey to better digestive health?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-3xl mx-auto">
            Join thousands of people who are taking control of their IBS with personalized, AI-powered care.
            Start your free journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/signup"
              className="inline-flex items-center px-10 py-4 text-lg font-medium rounded-xl text-purple-600 bg-white hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Get Started Free
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-10 py-4 border-2 border-white text-lg font-medium rounded-xl text-white bg-transparent hover:bg-white/10 transition-all duration-200"
            >
              <MessageSquare className="mr-3 h-6 w-6" />
              Contact Us
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-8 text-purple-200 text-sm">
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Free forever
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              No credit card
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              HIPAA compliant
            </span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Landing
