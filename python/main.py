import os
import json
import asyncio
import httpx
import edge_tts
import requests
from openai import OpenAI
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import ssl
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
ssl._create_default_https_context = ssl._create_unverified_context

JAVA_SERVER_URL = os.getenv("JAVA_SERVER_URL", "https://hackathon-java.onrender.com").rstrip('/')
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

# ייבוא חוקי הברזל
try:
    from prompts import GENERIC_RULES as GENERAL_PROMPT
except ImportError:
    GENERAL_PROMPT = "חוקי סימולציה כלליים."

current_scenario_prompt = ""

# --- פונקציות עזר ---

async def process_deepgram_stt(audio_bytes: bytes) -> str:
    try:
        url = "https://api.deepgram.com/v1/listen?model=nova-3&language=he"
        headers = {"Authorization": f"Token {DEEPGRAM_API_KEY}", "Content-Type": "audio/webm"}
        async with httpx.AsyncClient() as httpx_client:
            response = await httpx_client.post(url, headers=headers, content=audio_bytes, timeout=10.0)
            return response.json()["results"]["channels"][0]["alternatives"][0]["transcript"]
    except: return ""

async def process_tts_hebrew(text: str) -> bytes:
    try:
        def digit_reader(match):
            num = match.group(0).replace("-", "")
            return ", ".join(list(num)) if len(num) >= 4 else num

        text_for_speech = re.sub(r'[\d-]{4,}', digit_reader, text)
        clean_text = text_for_speech.replace("[END_CALL]", "").strip()
        if not clean_text: return b""
        
        communicate = edge_tts.Communicate(clean_text, "he-IL-AvriNeural")
        audio_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio": audio_bytes += chunk["data"]
        return audio_bytes
    except: return b""

# תיקון קריטי: פונקציה אסינכרונית כדי לא לתקוע את השרת ואת המשוב
async def save_result_to_java(full_text: str, assignment_id: int, history: list):
    try:
        if "JSON:" in full_text:
            json_text = full_text.split("JSON:")[1].replace("```json", "").replace("```", "").strip()
            start, end = json_text.find('{'), json_text.rfind('}')
            if start != -1 and end != -1:
                feedback_data = json.loads(json_text[start:end+1])
                payload = {
                    "finalScore": int(feedback_data.get("REVIEW", 8)),
                    "feedback": full_text[:full_text.find("JSON:")].strip(), # שומרים את המשוב המילולי האמיתי
                    "transcript": json.dumps(history, ensure_ascii=False)
                }
                async with httpx.AsyncClient() as httpx_client:
                    await httpx_client.post(f"{JAVA_SERVER_URL}/api/simulation/save?assignmentId={assignment_id}", json=payload, timeout=10.0)
    except Exception as e:
        print(f"Error saving to Java: {e}")

# --- WebSocket ---

@app.websocket("/ws/voice/{assignment_id}")
async def websocket_endpoint(websocket: WebSocket, assignment_id: int):
    await websocket.accept()
    session_history = []
    active_prompt = current_scenario_prompt or GENERAL_PROMPT

    try:
        resp = requests.get(f"{JAVA_SERVER_URL}/api/agent/assignment/{assignment_id}", timeout=5)
        if resp.status_code == 200:
            active_prompt = resp.json().get('scenario', {}).get('systemPrompt', active_prompt)
    except: pass

    try:
        while True:
            message = await websocket.receive()
            if "bytes" in message:
                user_text = await process_deepgram_stt(message["bytes"])
                if not user_text or len(user_text.strip()) < 2: continue

                await websocket.send_text(json.dumps({"user_text": user_text}))
                
                id_match = re.search(r'תעודת זהות[:\s]+([\d-]+)', active_prompt)
                id_val = id_match.group(1) if id_match else "לא צוין"

                # תיקון קריטי מס' 1: אכיפה אגרסיבית של דמות הלקוח בכל תור מחדש
# תיקון מס' 1: חוקי התנהגות - נימוס ומיקוד כלקוח בלבד
                system_instruction = (
                    f"CRITICAL RULES FOR THIS TURN:\n"
                    f"1. YOU ARE THE CUSTOMER. YOU ARE NEVER THE AGENT. Do NOT offer help, do NOT ask 'how can I help you'.\n"
                    f"2. Polite Greeting: If the agent says 'Hello' (שלום), reply politely with 'שלום', state your name, and then briefly state your reason for calling.\n"
                    f"3. Focus: If the agent asks irrelevant or confusing questions, politely remind them you are just a customer and demand a solution to your specific problem.\n"
                    f"4. Your ID is {id_val}. Give it immediately when asked.\n"
                    f"5. End of call: When the issue is fully resolved, FIRST say a polite goodbye in Hebrew (e.g. 'תודה רבה על העזרה, המשך יום נעים'), and ONLY AFTER that, add exactly [END_CALL].\n\n"                    f"SCENARIO:\n{active_prompt}"
                )
                
                openai_messages = [{"role": "system", "content": system_instruction}]
                for msg in session_history: openai_messages.append(msg)
                openai_messages.append({"role": "user", "content": user_text})

# תיקון מס' 2: מניעת כפילויות טקסט וחזרות על מילים
                stream = client.chat.completions.create(
                    model="gpt-4o",
                    messages=openai_messages,
                    stream=True,
                    temperature=0.4,
                    frequency_penalty=0.5  # מונע מה-AI לחזור על עצמו כמו תוכי!
                )
                
                full_response, sentence_buffer, chunk_buffer = "", "", ""
                is_feedback_mode = False

                for chunk in stream:
                    if chunk.choices[0].delta.content:
                        t = chunk.choices[0].delta.content
                        full_response += t
                        chunk_buffer += t
                        
                        if "[END_CALL]" in full_response:
                            is_feedback_mode = True
                            break # ברגע שמזהה ניתוק, עוצר ולא שולח יותר!

                        # תיקון קריטי מס' 2: חסימת הדלפת תגיות ל-UI ומניעת כפילויות
                        if "[" not in chunk_buffer:
                            await websocket.send_text(json.dumps({"text": chunk_buffer}))
                            sentence_buffer += chunk_buffer
                            chunk_buffer = ""
                        elif "]" in chunk_buffer:
                            clean_t = chunk_buffer.replace("[END_CALL]", "")
                            if clean_t:
                                await websocket.send_text(json.dumps({"text": clean_t}))
                                sentence_buffer += clean_t
                            chunk_buffer = ""

                        if any(p in chunk_buffer for p in [".", "?", "!", "\n"]):
                            if len(sentence_buffer.strip()) > 1:
                                audio = await process_tts_hebrew(sentence_buffer.strip())
                                if audio: await websocket.send_bytes(audio)
                                sentence_buffer = ""

                if chunk_buffer.strip() and not is_feedback_mode and "[" not in chunk_buffer:
                    await websocket.send_text(json.dumps({"text": chunk_buffer}))
                    sentence_buffer += chunk_buffer

                # הקראה אחרונה של מה שנשאר בבפר
                if sentence_buffer.strip() and not is_feedback_mode:
                    audio = await process_tts_hebrew(sentence_buffer.strip())
                    if audio: await websocket.send_bytes(audio)

                # הוספת השיחה להיסטוריה (נקי מתגיות)
                session_history.append({"role": "user", "content": user_text})
                clean_response = full_response.replace("[END_CALL]", "").strip()
                if clean_response:
                    session_history.append({"role": "assistant", "content": clean_response})

                # --- השלב הקריטי מס' 3: הפקת משוב (Feedback) לאחר הניתוק ---
                if is_feedback_mode:
                    # 1. הודעה לריאקט לעבור לטעינה (Processing)
                    await websocket.send_text(json.dumps({"status": "finished"}))
                    
                    # 2. ה-AI מפיק משוב עם פורמט JSON ברור בסוף
                    eval_prompt = (
                        "נתח את השיחה הבאה של נציג שירות. בדוק מקצועיות, אדיבות ופתרון הבעיה. "
                        "כתוב משוב מפורט ובונה בעברית מנקודת מבט אובייקטיבית.\n"
                        "חובה!! בסוף המשוב, הוסף את השורה הבאה בדיוק (בלי markdown): \n"
                        "JSON: {\"REVIEW\": ציון_מ_1_עד_10}\n\n"
                        f"היסטוריית השיחה:\n{json.dumps(session_history, ensure_ascii=False)}"
                    )
                    
                    eval_response = client.chat.completions.create(
                        model="gpt-4o",
                        messages=[
                            {"role": "system", "content": "You are a senior call center evaluator. Output strictly in Hebrew."},
                            {"role": "user", "content": eval_prompt}
                        ]
                    )
                    
                    feedback_text = eval_response.choices[0].message.content
                    
                    # 3. נשלח למסך (מקפיץ את הפופ-אפ)
                    await websocket.send_text(feedback_text)
                    
                    # 4. נשמר בדאטה-בייס בצורה שאינה תוקעת את השרת!
                    await save_result_to_java(feedback_text, assignment_id, session_history)
                    break

    except WebSocketDisconnect: pass
    except Exception as e: print(f"WebSocket Error: {e}")

# --- Initialize Simulation (המנהל יוצר תרחיש) ---

@app.post("/initialize-simulation")
async def initialize_simulation(request: Request):
    global current_scenario_prompt
    try:
        local_data = await request.json()
        
        c_name = local_data.get("customerName") or local_data.get("name") or "לקוח"
        c_id = local_data.get("customerId") or local_data.get("idNumber") or "לא צוין"
        c_policy = local_data.get("policyNumber") or local_data.get("policy") or "לא צוין"
        c_credit = local_data.get("lastDigits") or "לא צוין"
        c_sms = local_data.get("smsCode") or "לא צוין"
        c_reason = local_data.get("reason") or "בירור"
        c_mood = local_data.get("conflict") or "ניטרלי"
        
        questions = local_data.get("questions", [])
        qa_block = "\n".join([f"- נושא/שאלה: {q.get('question')}\n  ציפייה לתשובה: {q.get('answer')}" for q in questions])

        # תוספת אכיפת דמות הלקוח גם למטה-פרומפט של המנהל
# תיקון מס' 3: המטה-פרומפט המעודכן ליצירת לקוח מנומס וממוקד
        meta_prompt = f"""
        אתה מעצב סימולציות בכיר. המשימה שלך היא לכתוב "הוראות מערכת" (System Prompt) ארוכות, מפורטות ומקצועיות עבור AI שישחק לקוח בשיחה טלפונית. 
        
        מבנה הפרומפט שאתה חייב ליצור:
        
        1. **הגדרת תפקיד ונימוס:** פתח בהסבר שזהו אימון נציגים ושה-AI הוא הלקוח {c_name}. הוסף הוראה מפורשת: "אם הנציג אומר שלום, ענה בנימוס, אמור 'שלום', הצג את שמך, ורק אז תאר את הבעיה. לעולם אל תציע עזרה ולעולם אל תשמש כנציג. אם הנציג שואל שאלות לא קשורות, ענה שאתה רק לקוח שמבקש שירות."
        2. **פרטי זיהוי חובה:** רשום בצורה ברורה את ת.ז ({c_id}), הפוליסה ({c_policy}), האשראי ({c_credit}) וקוד ה-SMS ({c_sms}). פקוד על ה-AI למסור אותם רק כשמבקשים.
        3. **סיפור רקע ומצב רגשי:** תאר בפירוט את סיבת הפנייה ({c_reason}) ואת המצב הרגשי ({c_mood}).
        4. **זרימת שיחה מאתגרת:** שלב את השאלות והתשובות הבאות כחלק מהמטרות של הלקוח בשיחה:
        {qa_block}
        5. **חוקי הברזל של הסימולציה:** הטמע בתוך הפרומפט את כל "פקודות המערכת הקריטיות" הבאות:
        {GENERAL_PROMPT}
        
        הוראה קריטית: אל תכתוב הקדמות. כתוב אך ורק את הפרומפט הסופי שמתחיל ב: "בשיחה זאת אתה תהיה הלקוח...".
        וודא שהפרומפט ארוך, מקיף, וכולל את הפקודה לסיים את השיחה עם [END_CALL].
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a simulation architect. You output ONLY long, detailed, raw system instructions for AI actors."},
                {"role": "user", "content": meta_prompt}
            ],
            temperature=0.3
        )

        current_scenario_prompt = response.choices[0].message.content.strip()
        
        print(f"\n{'='*20} NEW DETAILED PROMPT CREATED {'='*20}\n{current_scenario_prompt}\n{'='*60}\n")

        if JAVA_SERVER_URL:
            payload = {
                "name": c_name,
                "systemPrompt": current_scenario_prompt,
                "difficulty": local_data.get("difficulty", "Medium"),
                "category": local_data.get("category", "General"),
                "rawData": json.dumps(local_data, ensure_ascii=False)
            }
            # כיוון שזו פונקצית אתחול, אפשר להשאיר את ה-requests, זה רץ לפני השיחה
            requests.post(f"{JAVA_SERVER_URL}/api/manager/add-scenario", json=payload, timeout=10)

        return {"status": "success", "final_prompt": current_scenario_prompt}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)