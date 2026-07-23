import os
import requests
import json
import time
import traceback
from app.core.config import settings

def call_llm(prompt: str, json_mode: bool = False, response_schema = None) -> str:
    # 1. Try Groq if GROQ_API_KEY is configured
    groq_key = (settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY") or "").strip().strip('"').strip("'")
    
    print("\n------------------ [LLM PIPELINE TRACE] ------------------")
    print(f"--> GROQ_API_KEY Loaded: {'YES (Key length: ' + str(len(groq_key)) + ')' if groq_key else 'NO (MISSING)'}")
    
    if groq_key:
        url = "https://api.groq.com/openai/v1/chat/completions"
        model_name = "llama-3.3-70b-versatile"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }
        
        system_prompt = "You are Nyaya AI, a world-class legal technology assistant for India. Help ordinary citizens understand their rights, laws, contracts, notices, and police complaints."
        if json_mode:
            system_prompt += " You must respond strictly in JSON format matching the requested schema. Ensure all fields and keys are present and correctly formatted. Do not include any introductory or concluding text outside the JSON object."
            if response_schema:
                system_prompt += f" The JSON schema you MUST follow is: {response_schema.model_json_schema() if hasattr(response_schema, 'model_json_schema') else getattr(response_schema, 'schema_json', lambda: '')()}"

        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
            
        print(f"--> Target Endpoint: {url}")
        print(f"--> Model Name: {model_name}")
        print(f"--> JSON Mode: {json_mode}")
        print(f"--> Prompt Length: {len(prompt)} characters")

        for attempt in range(3):
            try:
                start_time = time.time()
                r = requests.post(url, json=payload, headers=headers, timeout=30)
                elapsed = time.time() - start_time
                print(f"--> Groq HTTP Response Status: {r.status_code} (took {elapsed:.2f}s)")

                if r.status_code == 200:
                    res_data = r.json()
                    response_text = res_data["choices"][0]["message"]["content"]
                    print(f"--> Groq Response Received Successfully ({len(response_text)} chars)")
                    print("-----------------------------------------------------------\n")
                    return response_text
                elif r.status_code == 429:
                    print(f"⚠️ Groq API rate limited (429). Attempt {attempt + 1}/3. Waiting before retry...")
                    time.sleep(3 * (attempt + 1))
                    continue
                else:
                    print(f"❌ Groq API error response ({r.status_code}): {r.text}")
                    raise Exception(f"Groq API Error {r.status_code}: {r.text}")
            except Exception as e:
                print(f"❌ Exception during Groq API call (Attempt {attempt + 1}/3): {e}")
                traceback.print_exc()
                if attempt == 2:
                    raise e
                time.sleep(1)

    # 2. Try Gemini if GEMINI_API_KEY is configured
    gemini_key = (settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY") or "").strip().strip('"').strip("'")
    if gemini_key:
        print(f"--> Fallback to Gemini API (Key length: {len(gemini_key)})")
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            gen_config = None
            if json_mode and response_schema:
                gen_config = genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=response_schema
                )
            elif json_mode:
                gen_config = genai.GenerationConfig(
                    response_mime_type="application/json"
                )
                
            for attempt in range(3):
                try:
                    response = model.generate_content(prompt, generation_config=gen_config)
                    return response.text
                except Exception as e:
                    err_str = str(e).lower()
                    if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
                        print(f"Gemini API rate limited/quota hit. Attempt {attempt + 1}/3. Waiting before retry...")
                        time.sleep(4 * (attempt + 1))
                        continue
                    print(f"Exception during Gemini API call: {e}")
                    traceback.print_exc()
                    break
        except Exception as e:
            print(f"Gemini SDK initialization error: {e}")
            traceback.print_exc()
            
    print("-----------------------------------------------------------\n")
    raise Exception("No active LLM providers (Groq/Gemini) succeeded or were configured. Please verify GROQ_API_KEY in backend/.env.")
