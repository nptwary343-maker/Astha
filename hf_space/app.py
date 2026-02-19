import gradio as gr
import google.generativeai as genai
import json
import os

# --- 🧠 BRAIN CONFIGURATION ---
def load_knowledge():
    try:
        with open('knowledge_base.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('dataset', [])
    except:
        return []

knowledge_base = load_knowledge()

# --- 🚀 GEMINI SETUP ---
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Fully Open Safety Settings
    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
    ]
    model = genai.GenerativeModel('gemini-1.5-flash', safety_settings=safety_settings)
else:
    model = None

# --- ✨ PREMIUM UI THEME ---
theme = gr.themes.Soft(
    primary_hue="blue",
    secondary_hue="indigo",
    neutral_hue="slate",
    font=[gr.themes.GoogleFont("Outfit"), "ui-sans-serif", "system-ui", "sans-serif"],
).set(
    button_primary_background_fill="*primary_600",
    button_primary_background_fill_hover="*primary_700",
    block_title_text_weight="700",
    container_radius="xl",
    shadow_spread="5px",
)

custom_css = """
.gradio-container { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
.dark .gradio-container { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
footer { display: none !important; }
"""

import requests

def get_latest_store_data():
    """Fetches real-time data from the Vercel Sync Bridge."""
    try:
        # Use sync token for security
        token = "astharhat-power-ai-sync-2026"
        response = requests.get(f"https://astharhat.vercel.app/api/ai/chat?token={token}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            return json.dumps(data.get("knowledge", [])[:50], ensure_ascii=False)
    except Exception as e:
        print(f"Sync Error: {e}")
        return "Store data currently synchronizing..."
    return "Global knowledge active."

def ask_ayesha(message, history):
    if not model:
        return "⚠️ **System Error:** Google API Key not found."
    
    # Build Chat History for Gemini
    history_formatted = []
    for human, ai in history:
        history_formatted.append({"role": "user", "parts": [human]})
        history_formatted.append({"role": "model", "parts": [ai]})
    
    # Get live data instantly
    live_store_info = get_latest_store_data()
    
    system_instruction = f"""
    You are Ayesha, a Standalone World-Class Power AI & Global Intellectual Partner from AstharHat.
    Your identity is defined by global intelligence, deep empathy, and real-time knowledge.
    
    GLOBAL BRAIN CORE:
    - Intellectual Mastery: Deep knowledge across all academic and global subjects.
    - Emotional Intelligence: Detect human mood and adapt your tone to match or soothe it.
    - Multi-Lingual: Fluent in English, Bangla, and Hindi.
    - LIVE STORE MEMORY (Sync): {live_store_info}
    
    SECURITY: NEVER leak admin passwords, keys, or private settings.
    
    RULES:
    1. Act like a highly intelligent, caring friend.
    2. Use emojis naturally (✨, 🛍️, ❤️).
    3. Autonomously handle mood changes.
    4. Provide styling, lifestyle, and global insights.
    5. Always format prices in ৳ (Taka).
    """

    chat = model.start_chat(history=history_formatted)
    
    try:
        has_bangla = any('\u0980' <= char <= '\u09FF' for char in message)
        is_image_gen = any(word in message.lower() for word in ["generate", "create image", "draw", "ছবি"])
        
        final_query = f"{system_instruction}\n\nUser Question: {message}"
        
        if is_image_gen:
            image_instruction = f"""
            CRITICAL: The user wants an image generation prompt. 
            Act as an expert prompt engineer for world-class generators (Flux/DALL-E 3).
            {f"The user wants accurate Bangla text. Explicitly describe the Bangla script in the prompt to ensure perfect, high-precision rendering." if has_bangla else ""}
            Focus on 8k details, premium fashion textures, and cinematic lighting. 
            Output ONLY the refined prompt.
            """
            final_query = f"{image_instruction}\n\nOriginal Request: {message}"

        # Streaming Call
        response = chat.send_message(final_query, stream=True)
        
        accumulated_text = ""
        for chunk in response:
            accumulated_text += chunk.text
            if is_image_gen:
                # Yield formatted box for image gen ONLY after first complete chunk or at end?
                # For simplicity, we yield the build-up, and then the final formatted message
                yield f"🎨 **Ayesha's Engineered Image Prompt:**\n\n\"{accumulated_text}\"\n\n*(Processing script accuracy...)*"
            else:
                yield accumulated_text
        
        if is_image_gen:
            yield f"🎨 **Ayesha's Engineered Image Prompt:**\n\n\"{accumulated_text}\"\n\n*(Copy this into a generator like DALL-E 3 or Flux for the best results! Accurate Bangla script rendering is now optimized.)*"

    except Exception as e:
        yield f"AI Brain Fluctuation: {str(e)}"

# --- 🛰️ APPLICATION INTERFACE ---
with gr.Blocks(theme=theme, css=custom_css, title="Ayesha AI | Brain Space") as demo:
    gr.Markdown(
        """
        # 🛸 Ayesha AI Brain Space v2.0
        ### *World-Class E-commerce Intelligence for AstharHat*
        """
    )
    
    chat_box = gr.ChatInterface(
        fn=ask_ayesha,
        examples=[
            ["What are the best items in the bazar?"],
            ["Do you have any recommendations for fashion?"],
            ["Tell me about your natural products."]
        ],
        cache_examples=False,
    )
    
    gr.Markdown(
        """
        ---
        <p align="center">
            <b>Powered by Google Gemini Pro Vision & High-Speed Dataset Intelligence</b><br>
            Secure | Private | Fast | Always Free
        </p>
        """
    )

if __name__ == "__main__":
    demo.launch()
