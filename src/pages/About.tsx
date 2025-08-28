import React from 'react'
import { Heart, Users, Target, Award, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">IBS Care AI</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to empower individuals with IBS to take control of their digestive health 
            through innovative AI technology and personalized care.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Living with IBS can be challenging, unpredictable, and isolating. That's why we created 
                IBS Care AI - to provide personalized, AI-powered support that helps you understand 
                your symptoms, identify triggers, and manage your condition with confidence.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our platform combines cutting-edge artificial intelligence with evidence-based medical 
                insights to deliver personalized recommendations that adapt to your unique patterns and needs.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Personalized AI-driven insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Evidence-based recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Comprehensive symptom tracking</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl p-8">
              <div className="text-center">
                <Heart className="h-16 w-16 text-purple-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Empowering Health</h3>
                <p className="text-gray-600">
                  We believe everyone deserves to live comfortably with their digestive health. 
                  Our technology makes that possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Patient-Centered</h3>
                <p className="text-gray-600">
                  Every feature we build starts with understanding the real needs and challenges 
                  of people living with IBS.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Precision Care</h3>
                <p className="text-gray-600">
                  We use advanced AI to provide personalized insights that are tailored to your 
                  unique patterns and symptoms.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Evidence-Based</h3>
                <p className="text-gray-600">
                  All our recommendations are grounded in the latest medical research and 
                  clinical best practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">Healthcare professionals and technologists working together</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dr. Jane Doe</h3>
              <p className="text-purple-600 font-medium mb-3">Chief Medical Officer</p>
              <p className="text-gray-600 text-sm">
                Gastroenterologist with 15+ years of experience in IBS treatment and research.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                AS
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Alex Smith</h3>
              <p className="text-blue-600 font-medium mb-3">Head of AI</p>
              <p className="text-gray-600 text-sm">
                Machine learning expert specializing in healthcare applications and personalized medicine.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-green-600 to-green-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                MJ
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Maria Johnson</h3>
              <p className="text-green-600 font-medium mb-3">Product Director</p>
              <p className="text-gray-600 text-sm">
                UX researcher focused on healthcare accessibility and patient experience design.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default About
