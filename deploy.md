# 🚀 Deployment Guide for IBS Care AI

## Quick Deployment Steps

### 1. GitHub Setup (5 minutes)

```bash
# In your project directory
git add .
git commit -m "Initial commit: IBS Care AI app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ibs-care-ai.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

### 2. Streamlit Cloud Deployment (3 minutes)

1. Go to [share.streamlit.io](https://share.streamlit.io)
2. Sign in with GitHub
3. Click "New app"
4. Select your `ibs-care-ai` repository
5. Set main file path to: `app.py`
6. Click "Deploy!"

### 3. Add API Key (2 minutes)

1. In your deployed app, click ☰ → Settings
2. Go to "Secrets"
3. Add this:
```toml
GEMINI_API_KEY = "your_actual_api_key_here"
```

## 🎯 What You'll Get

- **Live URL**: `https://your-app-name.streamlit.app`
- **Professional Dashboard**: Modern, clean interface
- **AI Chat**: Personalized IBS advice
- **Health Tracking**: Complete wellness management
- **Mobile Responsive**: Works on all devices

## 🔧 Troubleshooting

**If deployment fails:**
- Check that `app.py` is in the root of your repository
- Ensure all dependencies are in `requirements.txt`
- Verify your GitHub repository is public

**If app runs but AI doesn't work:**
- Check your `GEMINI_API_KEY` in Streamlit secrets
- Verify the API key is valid and has credits

## 🌟 Success!

Once deployed, your IBS Care AI app will be:
- **Publicly accessible** to anyone
- **Always running** (no need to keep your computer on)
- **Professional looking** with modern design
- **Fully functional** with AI chat and health tracking

**Share your app URL with friends and family!** 🎉
