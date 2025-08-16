# IBS Care AI - Professional Dashboard

A comprehensive, AI-powered IBS management application built with Streamlit, featuring a modern dashboard interface, AI chat assistant, and health tracking capabilities.

## ✨ Features

### Modern Dashboard Interface
- **Welcome Screen**: Personalized onboarding experience
- **Daily Health Log**: Track mood, symptoms, and diet
- **Professional Metrics**: Clean, organized health overview
- **Navigation**: Intuitive sidebar with multiple sections

### Enhanced Analytics
- **Health Metrics**: Total entries, recent mood, days tracked
- **Data Visualization**: Clean tables and progress indicators
- **History Tracking**: Filterable health data over time
- **Trend Analysis**: Monitor your wellness journey

### AI Chat Assistant
- **Context-Aware Advice**: Personalized recommendations based on your health history
- **Professional Interface**: Clean chat bubbles without emojis
- **Gemini Integration**: Powered by Google's latest AI models
- **Supportive Guidance**: Empathetic IBS management advice

### Organized Pages
- **Dashboard**: Health overview and metrics
- **AI Chat**: Interactive AI consultation
- **Daily Log**: Easy health entry system
- **History**: Comprehensive health records
- **Profile**: Account management and preferences

### Professional Design Elements
- **Dark Theme**: Modern, easy-on-the-eyes interface
- **Gradient Headers**: Beautiful visual hierarchy
- **Responsive Layout**: Works on desktop and mobile
- **Clean Typography**: Professional appearance
- **Color-Coded Elements**: Blue for inputs, Teal for AI, Purple for charts

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ibs-care-ai.git
cd ibs-care-ai
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run the application**
```bash
streamlit run app.py
```

### Deploy to Streamlit Community Cloud

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy on Streamlit Cloud**
- Go to [share.streamlit.io](https://share.streamlit.io)
- Sign in with GitHub
- Select your repository
- Set main file path to `app.py`
- Add your `GEMINI_API_KEY` in the secrets section
- Click Deploy!

## 🔧 Requirements

- Python 3.8+
- Streamlit 1.28.0+
- Pandas 1.5.0+
- Google Generative AI 0.3.0+
- Python-dotenv 1.0.0+

## 📁 Project Structure

```
ibs-care-ai/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── .env               # Environment variables (create this)
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── ibs_care_data.csv  # Local data storage (auto-created)
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## 🌐 Live Demo

Once deployed, your app will be available at:
```
https://your-app-name.streamlit.app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/YOUR_USERNAME/ibs-care-ai/issues) page
2. Create a new issue with detailed information
3. Ensure your `.env` file is properly configured

---

**Enjoy your wellness journey with IBS Care AI!** 🎯