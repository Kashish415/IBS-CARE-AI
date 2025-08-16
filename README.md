# IBS Care AI

A professional, modern dashboard application for IBS (Irritable Bowel Syndrome) management with AI-powered personalized advice and comprehensive health tracking.

## ✨ **New Professional Features**

### 🎯 **Modern Dashboard Interface**
- **Professional Design**: Clean, organized layout with proper navigation
- **Sidebar Navigation**: Easy access to all features
- **Metric Cards**: Beautiful progress indicators with hover effects
- **Responsive Layout**: Optimized for all screen sizes

### 📊 **Enhanced Analytics**
- **Real-time Metrics**: Mood, energy, symptoms, and tracking days
- **Interactive Charts**: Professional Plotly visualizations
- **Progress Tracking**: Weekly goals and achievement monitoring
- **Trend Analysis**: Historical data visualization

### 💬 **AI Chat Assistant**
- **Personalized Conversations**: Chat with your IBS care AI
- **Real-time Advice**: Get instant support and recommendations
- **Context Awareness**: AI remembers your health history
- **Professional Responses**: Warm, supportive, and helpful

### 📱 **Organized Pages**
- **📊 Dashboard**: Overview with key metrics and charts
- **💬 AI Chat**: Interactive AI conversation
- **📝 Daily Log**: Structured health entry form
- **📈 History**: Comprehensive data analysis
- **👤 Profile**: User account management

## 🚀 **Setup Instructions**

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Get Google Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key for use in the app

3. **Configure API Key** (Choose one method):
   
   **Option A: Using .env file (Recommended)**:
   - Create a `.env` file in the project directory
   - Add your API key: `GEMINI_API_KEY=your_actual_api_key_here`
   - The app will automatically load it
   
   **Option B: Manual input**:
   - Run the app and enter your API key when prompted
   
4. **Run the Application**:
   ```bash
   streamlit run app.py
   ```

**Note**: Create a `.env` file in the project directory with `GEMINI_API_KEY=your_actual_api_key_here` to automatically load your API key.

Example `.env` file content:
```
GEMINI_API_KEY=your_actual_api_key_here
```

5. **First Time Setup**:
   - Enter your Google Gemini API key when prompted
   - Enter your name (one-time setup)
   - Start exploring the professional dashboard!

## 🎨 **How to Use**

### **Dashboard Overview**
- View your weekly health metrics at a glance
- Track mood, energy, symptoms, and progress
- See beautiful charts and progress indicators

### **AI Chat**
- Click on "💬 AI Chat" in the sidebar
- Ask questions about IBS management
- Get personalized advice and support
- Chat naturally with your AI assistant

### **Daily Logging**
- Use "📝 Daily Log" for structured entries
- Track mood (1-10 scale) and energy levels
- Log symptoms and diet details
- Build your health history over time

### **Progress Tracking**
- Monitor weekly goals and achievements
- View trends and patterns in your data
- Track symptom severity changes
- Celebrate your progress!

## 📁 **File Structure**

- `app.py`: Professional dashboard application
- `requirements.txt`: Python dependencies
- `.env`: Environment variables file (create this with your API key)
- `ibs_care_data.csv`: Your health data storage (created automatically)

## 🔒 **Data Privacy**

All your data is stored locally in a CSV file on your machine. No data is sent to external servers except for AI advice generation through Google Gemini API.

## 🏥 **Medical Disclaimer**

This application is for wellness support only. Always consult with healthcare professionals for medical advice and treatment of IBS or any other health conditions.

## 🛠 **Technical Features**

- **Modern UI**: Professional dashboard design
- **Real-time Updates**: Live data visualization
- **Error Handling**: Robust error management
- **Responsive Design**: Works on all devices
- **Clean Code**: Modular, maintainable architecture

## 🚀 **Ready to Run**

Your professional IBS Care AI dashboard is now ready! Run with:

```bash
pip install -r requirements.txt
streamlit run app.py
```

Enjoy your professional health management experience! 🌟