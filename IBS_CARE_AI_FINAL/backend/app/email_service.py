import logging
from flask_mail import Mail, Message
from .config import Config

logger = logging.getLogger(__name__)

# Initialize Flask-Mail
mail = Mail()

def init_email_service(app):
    """Initialize email service with Flask app"""
    app.config['MAIL_SERVER'] = Config.MAIL_SERVER
    app.config['MAIL_PORT'] = Config.MAIL_PORT
    app.config['MAIL_USE_TLS'] = Config.MAIL_USE_TLS
    app.config['MAIL_USERNAME'] = Config.MAIL_USERNAME
    app.config['MAIL_PASSWORD'] = Config.MAIL_PASSWORD
    
    mail.init_app(app)
    logger.info("Email service initialized")

def send_daily_reminder(user_email: str, user_name: str = None):
    """Send daily symptom logging reminder"""
    try:
        subject = "🌅 Daily IBS Symptom Log Reminder"
        
        # Personalize the message
        greeting = f"Hi {user_name}!" if user_name else "Hi there!"
        
        body = f"""
{greeting}

It's time for your daily IBS symptom check-in! 📝

Tracking your symptoms daily helps you:
• Identify patterns and triggers
• Monitor your progress
• Make informed decisions about your health
• Share valuable data with your healthcare provider

Take just 2 minutes to log today's symptoms at: http://localhost:5173/logs

Your health journey matters! 💜

Best regards,
Your IBS Care AI Team

---
This is an automated reminder. Please do not reply to this email.
        """
        
        msg = Message(
            subject=subject,
            sender=Config.MAIL_USERNAME,
            recipients=[user_email]
        )
        msg.body = body.strip()
        
        mail.send(msg)
        logger.info(f"Daily reminder sent to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send daily reminder to {user_email}: {e}")
        return False

def send_welcome_email(user_email: str, user_name: str = None):
    """Send welcome email to new users"""
    try:
        subject = "🎉 Welcome to IBS Care AI!"
        
        greeting = f"Hi {user_name}!" if user_name else "Hi there!"
        
        body = f"""
{greeting}

Welcome to IBS Care AI! We're excited to help you on your health journey. 🌟

Here's what you can do with our platform:

📊 **Track Daily Symptoms**
- Log your mood, pain levels, and triggers
- Monitor patterns over time
- Get insights into your health trends

🤖 **AI-Powered Coaching**
- Get personalized recommendations
- Ask health-related questions
- Receive context-aware advice

📈 **Visual Analytics**
- Beautiful charts showing your progress
- Track improvements over time
- Identify correlations between symptoms and triggers

📧 **Daily Reminders**
- Never miss a symptom log
- Build healthy tracking habits
- Stay consistent with your health goals

Ready to get started? Visit: http://localhost:5173/dashboard

Your health data is secure and private. We're here to support you every step of the way!

Best regards,
The IBS Care AI Team

---
Questions? Contact us at support@ibscare.ai
        """
        
        msg = Message(
            subject=subject,
            sender=Config.MAIL_USERNAME,
            recipients=[user_email]
        )
        msg.body = body.strip()
        
        mail.send(msg)
        logger.info(f"Welcome email sent to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user_email}: {e}")
        return False

def send_weekly_summary(user_email: str, user_name: str, summary_data: dict):
    """Send weekly health summary email"""
    try:
        subject = "📊 Your Weekly IBS Health Summary"
        
        greeting = f"Hi {user_name}!" if user_name else "Hi there!"
        
        # Format summary data
        days_logged = summary_data.get('days_logged', 0)
        avg_mood = summary_data.get('avg_mood', 0)
        avg_pain = summary_data.get('avg_pain', 0)
        common_triggers = summary_data.get('common_triggers', [])
        
        body = f"""
{greeting}

Here's your weekly health summary: 📈

📅 **Week Overview**
• Days tracked: {days_logged}/7
• Average mood: {avg_mood:.1f}/10
• Average pain level: {avg_pain:.1f}/10

🎯 **Key Insights**
• Most common triggers: {', '.join(common_triggers) if common_triggers else 'None identified'}
• Tracking consistency: {'Excellent' if days_logged >= 6 else 'Good' if days_logged >= 4 else 'Could improve'}

💡 **Recommendations**
• Keep up the great tracking work!
• Consider logging on days you missed
• Review your trigger patterns
• Share insights with your healthcare provider

View your full dashboard: http://localhost:5173/dashboard

Keep up the amazing work! Your health journey is unique and important. 💜

Best regards,
Your IBS Care AI Team

---
This is a weekly summary. You can adjust reminder settings in your profile.
        """
        
        msg = Message(
            subject=subject,
            sender=Config.MAIL_USERNAME,
            recipients=[user_email]
        )
        msg.body = body.strip()
        
        mail.send(msg)
        logger.info(f"Weekly summary sent to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send weekly summary to {user_email}: {e}")
        return False
