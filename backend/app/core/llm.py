import requests
import json
import time
import google.generativeai as genai
from app.core.config import settings

def call_llm(prompt: str, json_mode: bool = False, response_schema = None) -> str:
    # 1. Try Groq if GROQ_API_KEY is configured
    if settings.GROQ_API_KEY:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        system_prompt = "You are Nyaya AI, a world-class legal technology assistant for India. Help ordinary citizens understand their rights, laws, contracts, notices, and police complaints."
        if json_mode:
            system_prompt += " You must respond strictly in JSON format matching the requested schema. Ensure all fields and keys are present and correctly formatted. Do not include any introductory or concluding text outside the JSON object."
            if response_schema:
                system_prompt += f" The JSON schema you MUST follow is: {response_schema.model_json_schema() if hasattr(response_schema, 'model_json_schema') else getattr(response_schema, 'schema_json', lambda: '')()}"

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
            
        for attempt in range(3):
            try:
                r = requests.post(url, json=payload, headers=headers, timeout=30)
                if r.status_code == 200:
                    res_data = r.json()
                    return res_data["choices"][0]["message"]["content"]
                elif r.status_code == 429:
                    print(f"Groq API rate limited (429). Attempt {attempt + 1}/3. Waiting before retry...")
                    time.sleep(3 * (attempt + 1))
                    continue
                else:
                    print(f"Groq API call failed with status code {r.status_code}: {r.text}")
                    break
            except Exception as e:
                print(f"Exception during Groq API call: {e}")
                time.sleep(1)
            
    # 2. Try Gemini if GEMINI_API_KEY is configured
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
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
                break
            
    raise Exception("No active LLM providers (Groq/Gemini) succeeded or were configured.")
