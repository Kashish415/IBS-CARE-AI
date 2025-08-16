import streamlit as st
import pandas as pd
import google.generativeai as genai
import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the page
st.set_page_config(
    page_title="IBS Care AI",
    page_icon="💜",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize session state
if 'user_name' not in st.session_state:
    st.session_state.user_name = ""
if 'current_page' not in st.session_state:
    st.session_state.current_page = "welcome"
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

# CSV file path
CSV_FILE = "ibs_care_data.csv"

def initialize_csv():
    """Initialize CSV file if it doesn't exist"""
    if not os.path.exists(CSV_FILE):
        df = pd.DataFrame(columns=['name', 'date', 'mood', 'symptoms', 'diet', 'timestamp'])
        df.to_csv(CSV_FILE, index=False)

def save_entry(name, mood, symptoms, diet):
    """Save entry to CSV file with timestamp"""
    try:
        timestamp = datetime.datetime.now()
        date = timestamp.date()
        
        new_entry = {
            'name': name,
            'date': date,
            'mood': mood,
            'symptoms': symptoms,
            'diet': diet,
            'timestamp': timestamp
        }
        
        df = pd.read_csv(CSV_FILE) if os.path.exists(CSV_FILE) else pd.DataFrame()
        df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
        df.to_csv(CSV_FILE, index=False)
        return True
    except Exception as e:
        st.error(f"Error saving entry: {str(e)}")
        return False

def get_user_history(name, limit=30):
    """Get user's recent history"""
    try:
        df = pd.read_csv(CSV_FILE)
        user_data = df[df['name'].str.lower() == name.lower()]
        
        if 'date' in user_data.columns and len(user_data) > 0:
            if user_data['date'].dtype == 'object':
                user_data['date'] = pd.to_datetime(user_data['date']).dt.date
        
        user_data = user_data.sort_values('timestamp', ascending=False).head(limit)
        return user_data
    except Exception as e:
        return pd.DataFrame()

def get_ai_advice(name, current_mood, current_symptoms, current_diet, history_df):
    """Get AI advice from Gemini with context-aware responses"""
    try:
        # Check if API key is available
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return "API key not configured. Please add GEMINI_API_KEY to your .env file."
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Prepare context with last 5 entries
        context = f"""You are an empathetic IBS care assistant. The user's name is {name}.

Current Status:
- Mood: {current_mood}
- Symptoms: {current_symptoms}  
- Diet: {current_diet}

Recent History (last 5 entries):
"""
        
        if not history_df.empty:
            for _, row in history_df.iterrows():
                date_str = str(row['date'])
                context += f"- Date: {date_str}, Mood: {row['mood']}, Symptoms: {row['symptoms']}, Diet: {row['diet']}\n"
        else:
            context += "- No previous entries found.\n"
        
        context += """\n
Please provide personalized, supportive advice for managing IBS symptoms. Consider:
1. Dietary recommendations based on current and past patterns
2. Lifestyle suggestions for symptom management  
3. Emotional support and encouragement
4. Gentle reminders about stress management

Keep the tone warm, understanding, and professional. Limit response to 150-200 words."""
        
        # Try different models in order of preference
        models_to_try = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
        
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(context)
                return response.text
            except Exception as e:
                continue
        
        return "I'm having trouble connecting to the AI service right now. Please try again later."
        
    except Exception as e:
        return f"I'm having trouble connecting to the AI service right now. Please try again later."

def sidebar_navigation():
    """Create sidebar navigation"""
    with st.sidebar:
        st.markdown("""
        <div style="text-align: center; padding: 1rem 0;">
            <h2 style="color: white; margin: 0;">IBS Care</h2>
            <p style="color: #94a3b8; margin: 0.5rem 0;">Your Wellness Companion</p>
        </div>
        """, unsafe_allow_html=True)
        
        nav_items = [
            ("Dashboard", "dashboard"),
            ("AI Chat", "ai_chat"),
            ("Daily Log", "daily_log"),
            ("History", "history"),
            ("Profile", "profile")
        ]
        
        for icon_text, page in nav_items:
            if st.button(icon_text, key=f"nav_{page}", use_container_width=True):
                st.session_state.current_page = page
        
        st.markdown("---")
        
        # User info only - NO AI Assistant Ready message
        if st.session_state.user_name:
            st.markdown(f"""
            <div style="text-align: center; padding: 1rem; background: rgba(102, 126, 234, 0.2); border-radius: 10px;">
                <p style="color: white; margin: 0;"><strong>Welcome, {st.session_state.user_name}!</strong></p>
            </div>
            """, unsafe_allow_html=True)

def welcome_screen():
    """Welcome screen asking for user's name"""
    st.markdown("""
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 3rem; border-radius: 20px; text-align: center; color: white; margin: 2rem auto; max-width: 600px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">Welcome to IBS Care</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem; color: #94a3b8;">
            Your personal wellness companion for managing IBS symptoms with AI-powered insights
        </p>
        <div style="background: rgba(102, 126, 234, 0.2); padding: 1rem; border-radius: 10px; margin-bottom: 2rem;">
            <p style="margin: 0; color: #cbd5e1;">Let's start your wellness journey together!</p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("### What's your name?")
        name = st.text_input("", placeholder="Enter your name here...", key="welcome_name")
        
        if st.button("Start My Journey", type="primary", use_container_width=True):
            if name.strip():
                st.session_state.user_name = name.strip()
                st.session_state.current_page = "daily_log"
                st.rerun()
            else:
                st.warning("Please enter your name to continue.")

def dashboard_page():
    """Dashboard page with metrics and charts"""
    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 2rem; border-radius: 15px; margin-bottom: 2rem; color: white; border-left: 5px solid #667eea;">
        <h1>Welcome back, {st.session_state.user_name}!</h1>
        <p style="color: #cbd5e1; font-size: 1.1rem;">Here's your health overview for this week. You're making great progress!</p>
    </div>
    """, unsafe_allow_html=True)
    
    history = get_user_history(st.session_state.user_name, 30)
    
    if not history.empty:
        # Simple metrics
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Entries", len(history))
        
        with col2:
            recent_mood = history.iloc[0]['mood'] if len(history) > 0 else "No data"
            st.metric("Recent Mood", recent_mood)
        
        with col3:
            days_tracked = len(history)
            st.metric("Days Tracked", days_tracked)
        
        # Recent entries table
        st.markdown("### Recent Entries")
        display_df = history[['date', 'mood', 'symptoms', 'diet']].head(10).copy()
        display_df['date'] = pd.to_datetime(display_df['date']).dt.strftime('%b %d, %Y')
        st.dataframe(display_df, use_container_width=True)
    else:
        st.info("Start logging to see your dashboard data!")

def ai_chat_page():
    """AI Chat page with enhanced UI"""
    st.markdown("""
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 2rem; border-radius: 15px; margin-bottom: 2rem; color: white; border-left: 5px solid #667eea;">
        <h1>AI Care Assistant</h1>
        <p style="color: #cbd5e1; font-size: 1.1rem;">Chat with your personal IBS care AI for advice and support</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Chat container
    st.markdown("""
    <div style="background: #1e293b; padding: 1.5rem; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); border: 1px solid #334155; color: white;">
    """, unsafe_allow_html=True)
    
    # Chat messages
    if not st.session_state.chat_history:
        st.markdown("""
        <div style="background: #0f766e; color: white; padding: 1rem; border-radius: 15px; max-width: 80%; border-bottom-left-radius: 5px;">
            <strong>AI Assistant:</strong> Hello! I'm here to help you manage your IBS symptoms. 
            How are you feeling today? Feel free to ask me about diet, lifestyle tips, or any concerns you have.
        </div>
        """, unsafe_allow_html=True)
    else:
        for message in st.session_state.chat_history:
            if message['type'] == 'user':
                st.markdown(f"""
                <div style="background: #667eea; color: white; padding: 1rem; border-radius: 15px; max-width: 80%; margin-left: auto; border-bottom-right-radius: 5px;">
                    <strong>You:</strong> {message["content"]}
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div style="background: #0f766e; color: white; padding: 1rem; border-radius: 15px; max-width: 80%; border-bottom-left-radius: 5px;">
                    <strong>AI Assistant:</strong> {message["content"]}
                </div>
                """, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Chat input
    user_input = st.text_input("Type your message...", key="chat_input", placeholder="Ask about IBS management, diet tips, or get support...")
    col1, col2 = st.columns([1, 4])
    
    with col1:
        if st.button("Send", type="primary"):
            if user_input:
                # Add user message
                st.session_state.chat_history.append({"type": "user", "content": user_input})
                
                # Get AI response
                with st.spinner("AI is thinking..."):
                    history = get_user_history(st.session_state.user_name, 5)
                    ai_response = get_ai_advice(
                        st.session_state.user_name, 
                        "Good", "general wellness", "balanced diet", 
                        history
                    )
                    st.session_state.chat_history.append({"type": "ai", "content": ai_response})
                
                st.rerun()
            else:
                st.warning("Please enter a message!")

def daily_log_page():
    """Daily log entry page with improved form"""
    st.markdown("""
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 2rem; border-radius: 15px; margin-bottom: 2rem; color: white; border-left: 5px solid #667eea;">
        <h1>Daily Health Log</h1>
        <p style="color: #cbd5e1; font-size: 1.1rem;">Track your daily mood, symptoms, and diet</p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("""
    <div style="background: #1e293b; padding: 2rem; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); border: 1px solid #334155; color: white;">
    """, unsafe_allow_html=True)
    
    # Mood selection
    st.markdown("#### How are you feeling today?")
    mood_options = ["Great", "Good", "Okay", "Not great", "Difficult"]
    mood = st.selectbox("Select your mood", mood_options, key="mood_select")
    
    # Symptoms
    st.markdown("#### Any symptoms today?")
    symptoms = st.text_area("Describe any IBS symptoms", placeholder="e.g., bloating, cramping, digestive issues, fatigue...", height=100, key="symptoms_input")
    
    # Diet
    st.markdown("#### What did you eat today?")
    diet = st.text_area("List your meals, snacks, and drinks", placeholder="e.g., Breakfast: oatmeal with banana, Lunch: grilled chicken salad, Snacks: nuts...", height=100, key="diet_input")
    
    # Save button
    if st.button("Save Today's Entry", type="primary", use_container_width=True):
        if symptoms and diet:
            if save_entry(st.session_state.user_name, mood, symptoms, diet):
                st.success("Entry saved successfully!")
                st.rerun()
            else:
                st.error("Error saving entry. Please try again.")
        else:
            st.warning("Please fill in both symptoms and diet fields.")
    
    st.markdown('</div>', unsafe_allow_html=True)

def history_page():
    """History and trends page with clean design"""
    st.markdown("""
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 2rem; border-radius: 15px; margin-bottom: 2rem; color: white; border-left: 5px solid #667eea;">
        <h1>Health History & Trends</h1>
        <p style="color: #cbd5e1; font-size: 1.1rem;">View your health journey over time</p>
    </div>
    """, unsafe_allow_html=True)
    
    history = get_user_history(st.session_state.user_name, 100)
    
    if not history.empty:
        # Date filter
        st.markdown("#### Filter by Date")
        col1, col2 = st.columns(2)
        
        with col1:
            start_date = st.date_input("From", value=history['date'].min() if len(history) > 0 else datetime.date.today())
        with col2:
            end_date = st.date_input("To", value=history['date'].max() if len(history) > 0 else datetime.date.today())
        
        # Filter data
        filtered_history = history[
            (history['date'] >= start_date) & 
            (history['date'] <= end_date)
        ]
        
        st.markdown("#### Recent Entries")
        if not filtered_history.empty:
            display_df = filtered_history[['date', 'mood', 'symptoms', 'diet']].copy()
            display_df['date'] = pd.to_datetime(display_df['date']).dt.strftime('%b %d, %Y')
            
            st.dataframe(display_df, use_container_width=True)
        else:
            st.info("No entries found for the selected date range.")
    else:
        st.info("No entries found. Start logging your daily health to see your history!")

def profile_page():
    """User profile page"""
    st.markdown("""
    <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 2rem; border-radius: 15px; margin-bottom: 2rem; color: white; border-left: 5px solid #667eea;">
        <h1>Your Profile</h1>
        <p style="color: #cbd5e1; font-size: 1.1rem;">Manage your account and preferences</p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.markdown(f"""
        <div style="text-align: center; padding: 2rem; background: #1e293b; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); border: 1px solid #334155;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">User</div>
            <h3 style="color: white;">{st.session_state.user_name}</h3>
            <p style="color: #94a3b8;">IBS Care User</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        history = get_user_history(st.session_state.user_name, 1000)
        st.markdown(f"""
        <div style="background: #1e293b; padding: 2rem; border-radius: 15px; box-shadow: 0 8px 25px rgba(0,0,0,0.2); border: 1px solid #334155; color: white;">
            <h4 style="color: #667eea;">Account Information</h4>
            <p><strong>Name:</strong> {st.session_state.user_name}</p>
            <p><strong>Member Since:</strong> {datetime.datetime.now().strftime("%B %Y")}</p>
            <p><strong>Total Entries:</strong> {len(history)}</p>
            
            <h4 style="margin-top: 2rem; color: #667eea;">Preferences</h4>
            <p><strong>Theme:</strong> Dark Mode</p>
            <p><strong>Notifications:</strong> Enabled</p>
            <p><strong>Data Export:</strong> Available</p>
        </div>
        """, unsafe_allow_html=True)

def main():
    """Main application function"""
    initialize_csv()
    
    # Check if user is set up
    if not st.session_state.user_name:
        sidebar_navigation()
        welcome_screen()
    else:
        sidebar_navigation()
        
        # Route to appropriate page
        if st.session_state.current_page == "dashboard":
            dashboard_page()
        elif st.session_state.current_page == "ai_chat":
            ai_chat_page()
        elif st.session_state.current_page == "daily_log":
            daily_log_page()
        elif st.session_state.current_page == "history":
            history_page()
        elif st.session_state.current_page == "profile":
            profile_page()

if __name__ == "__main__":
    main()
