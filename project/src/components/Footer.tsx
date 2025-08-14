import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">IBS Care AI</span>
            </div>
            <p className="text-gray-600 max-w-md">
              Your compassionate AI companion for managing IBS symptoms and improving your quality of life through personalized insights and support.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Features
            </h3>
            <ul className="space-y-2">
              <li><span className="text-gray-600">Daily Tracking</span></li>
              <li><span className="text-gray-600">AI Chat Support</span></li>
              <li><span className="text-gray-600">Symptom Analysis</span></li>
              <li><span className="text-gray-600">Progress Reports</span></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li><span className="text-gray-600">Help Center</span></li>
              <li><span className="text-gray-600">Privacy Policy</span></li>
              <li><span className="text-gray-600">Terms of Service</span></li>
              <li><span className="text-gray-600">Contact Us</span></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            © 2025 IBS Care AI. Made with ❤️ for better health management.
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            This app provides supportive guidance — not medical diagnosis. Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </div>
    </footer>
  )
}