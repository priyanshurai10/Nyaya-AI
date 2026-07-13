import json
import google.generativeai as genai
from pydantic import BaseModel, Field
from app.core.config import settings

class SafetyEvaluation(BaseModel):
    is_safe: bool = Field(description="True if the input is safe and appropriate for a legal assistant. False if it contains harmful, illegal, or highly abusive content.")
    reason: str = Field(description="Explanation of the safety status, or details on why it was flagged if unsafe.")

class SafetyAgent:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    async def evaluate_input(self, text: str) -> SafetyEvaluation:
        # Local validation for obvious dangerous patterns to avoid API quota waste
        unsafe_keywords = ["kill myself", "commit suicide", "make a bomb", "how to steal", "hack website"]
        lower_text = text.lower()
        for kw in unsafe_keywords:
            if kw in lower_text:
                return SafetyEvaluation(is_safe=False, reason=f"Query contains unsafe content related to '{kw}'.")
        
        return SafetyEvaluation(is_safe=True, reason="Local safety verification passed.")

    def get_legal_disclaimer(self, language: str = "en") -> str:
        disclaimers = {
            "en": "DISCLAIMER: Nyaya AI is an AI-powered legal information assistant and does not provide formal legal advice or substitute for a licensed advocate. Use of this service does not establish an attorney-client relationship. Please consult a qualified lawyer for legal representation.",
            "hi": "अस्वीकरण (Disclaimer): न्याय एआई (Nyaya AI) एक एआई-संचालित कानूनी सूचना सहायक है और यह कोई औपचारिक कानूनी सलाह नहीं देता है या लाइसेंस प्राप्त वकील का विकल्प नहीं है। इस सेवा के उपयोग से वकील-मुवक्किल संबंध स्थापित नहीं होता है। कानूनी प्रतिनिधित्व के लिए कृपया किसी योग्य वकील से सलाह लें।",
            "hinglish": "DISCLAIMER: Nyaya AI ek AI-powered legal information assistant hai aur ye koi formal legal advice nahi deta hai. Isse kisi licensed advocate (vakeel) ka substitute na maanein. Legal representation ke liye kripya kisi qualified vakeel se consult karein.",
            "bengali": "দাবিত্যাগ (Disclaimer): ন্যায় এআই (Nyaya AI) একটি এআই-চালিত আইনি তথ্য সহকারী এবং এটি কোনো আনুষ্ঠানিক আইনি পরামর্শ প্রদান করে না বা লাইসেন্সপ্রাপ্ত আইনজীবীর বিকল্প নয়। এই পরিষেবার ব্যবহার কোনও আইনজীবী-ক্লায়েন্ট সম্পর্ক তৈরি করে না। আইনি প্রতিনিধিত্বের জন্য অনুগ্রহ করে একজন যোগ্য আইনজীবীর সাথে পরামর্শ করুন।",
            "tamil": "பொறுப்புத் துறப்பு (Disclaimer): நியாயா ஏஐ (Nyaya AI) என்பது செயற்கை நுண்ணறிவு மூலம் இயங்கும் சட்டத் தகவல் உதவியாளராகும். இது முறையான சட்ட ஆலோசனையை வழங்காது அல்லது உரிமம் பெற்ற வழக்கறிஞருக்கு மாற்றாகாது. இந்தச் சேவையைப் பயன்படுத்துவது வழக்கறிஞர்-வாடிக்கையாளர் உறவை ஏற்படுத்தாது. சட்டப் பிரதிநிதித்துவத்திற்கு தகுதியான வழக்கறிஞரை அணுகவும்.",
            "telugu": "నిరాకరణ (Disclaimer): న్యాయ ఏఐ (Nyaya AI) అనేది కృత్రిమ మేధస్సుతో పనిచేసే చట్టపరమైన సమాచార సహాయకురాలు మరియు ఇది అధికారిక చట్టపరమైన సలహాను అందించదు లేదా లైసెన్స్ పొందిన న్యాయవాదికి ప్రత్యామ్నాయం కాదు. ఈ సేవను ఉపయోగించడం ద్వారా న్యాయవాది-క్లయింట్ సంబంధం ఏర్పడదు. చట్టపరమైన ప్రాতিనిధ్యం కోసం దయచేసి అర్హత కలిగిన న్యాయవాదిని సంప్రదించండి.",
            "marathi": "अस्वीकरण (Disclaimer): न्याय एआय (Nyaya AI) हे एआय-चालित कायदेशीर माहिती सहाय्यक आहे आणि ते कोणतीही औपचारिक कायदेशीर सल्ला देत नाही किंवा परवानाधारक वकीलाचा पर्याय नाही. या सेवेचा वापर वकील-अशील संबंध प्रस्थापित करत नाही. कायदेशीर प्रतिनिधित्वासाठी कृपया पात्र वकिलाचा सल्ला घ्या.",
            "gujarati": "ડિસ્ક્લેમર (Disclaimer): ન્યાય એઆઈ (Nyaya AI) એ એક એઆઈ-સંચાલિત કાનૂની માહિતી સહાયક છે અને તે કોઈ ઔપચારિક કાનૂनी સલાહ આપતું નથી અથવા લાઇસન્સ પ્રાપ્ત વકીલનો વિકલ્પ નથી. આ સેવાનો ઉપયોગ વકીલ-અસીલ સંબંધ સ્થાપિત કરતો નથી. કાનૂની પ્રતિનિધિત્વ માટે કૃપા કરીને લાયક વકીલની સલાહ લો.",
            "kannada": "ಹಕ್ಕುತ್ಯಾಗ (Disclaimer): ನ್ಯಾಯ ಎಐ (Nyaya AI) ಎನ್ನುವುದು ಕೃತক ಬುದ್ಧಿಮತ್ತೆ ಆಧಾರಿತ ಕಾನೂನು ಮಾಹಿತಿ ಸಹಾಯಕನಾಗಿದ್ದು, ಇದು ಯಾವುದೇ ಔಪಚಾರಿಕ ಕಾನೂನು ಸಲಹೆಯನ್ನು ನೀಡುವುದಿಲ್ಲ ಅಥವಾ ಪರವಾನಗಿ ಪಡೆದ ವಕೀಲರಿಗೆ ಬದಲಿಯಾಗಿಲ್ಲ. ಈ ಸೇವೆಯ ಬಳಕೆಯು ವಕೀಲ-ಕ್ಲೈಂಟ್ ಸಂಬಂಧವನ್ನು ಸ್ಥాపಿಸುವುದಿಲ್ಲ. ಕಾನೂನು ಪ್ರಾತಿನಿಧ್ಯಕ್ಕಾಗಿ ದಯವಿಟ್ಟು ಅರ್ಹ ವಕೀಲರನ್ನು ಸಂപ്രಕಿಸಿ.",
            "malayalam": "നിരാകരണം (Disclaimer): ന്യായ എഐ (Nyaya AI) ഒരു ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് അധിഷ്ഠിത നിയമ വിവര സഹായിയാണ്, ഇത് ഔദ്യോഗിക നിയമോപദേശം നൽകുന്നില്ല അല്ലെങ്കിൽ ലൈസൻസുള്ള അഭിഭാഷകന് പകരമാകുന്നില്ല. ഈ സേവനത്തിന്റെ ഉപയോഗം ഒരു അഭിഭാഷകൻ-ക്ലയന്റ് ബന്ധം സ്ഥാപിക്കുന്നില്ല. നിയമപരമായ പ്രാതിനിധ്യത്തിനായി ദയവായി യോഗ്യനായ ഒരു അഭിഭാഷകനെ സമീപിക്കുക.",
            "punjabi": "ਬੇਦਾਅਵਾ (Disclaimer): ਨਿਆਏ ਏਆਈ (Nyaya AI) ਇੱਕ ਏਆਈ-ਸੰਚਾਲਿਤ ਕਾਨੂੰਨੀ ਜਾਣਕਾਰੀ ਸਹਾਇਕ ਹੈ ਅਤੇ ਇਹ ਕੋਈ ਰਸਮੀ ਕਾਨੂੰਨੀ ਸਲਾਹ ਨਹੀਂ ਦਿੰਦਾ ਹੈ ਜਾਂ ਲਾਇਸੰਸਸ਼ੁਦਾ ਵਕੀਲ ਦਾ ਬਦਲ ਨਹੀਂ ਹੈ। ਇਸ ਸੇਵਾ ਦੀ ਵਰਤੋਂ ਨਾਲ ਵਕੀਲ-ਮੁਵੱਕਲ ਸਬੰਧ ਸਥਾਪਤ ਨਹੀਂ ਹੁੰਦਾ। ਕਾਨੂੰਨੀ ਪ੍ਰਤੀਨਿਧਤਾ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਕਿਸੇ ਯੋਗ ਵਕੀਲ ਨਾਲ ਸਲਾਹ ਕਰੋ।"
        }
        # Fallback handling
        lang_key = language.lower()
        if lang_key in disclaimers:
            return disclaimers[lang_key]
        elif "hinglish" in lang_key:
            return disclaimers["hinglish"]
        elif "hi" in lang_key or "hin" in lang_key:
            return disclaimers["hi"]
        elif "bn" in lang_key or "beng" in lang_key:
            return disclaimers["bengali"]
        elif "ta" in lang_key or "tam" in lang_key:
            return disclaimers["tamil"]
        elif "te" in lang_key or "tel" in lang_key:
            return disclaimers["telugu"]
        elif "mr" in lang_key or "mar" in lang_key:
            return disclaimers["marathi"]
        elif "gu" in lang_key or "guj" in lang_key:
            return disclaimers["gujarati"]
        elif "kn" in lang_key or "kan" in lang_key:
            return disclaimers["kannada"]
        elif "ml" in lang_key or "mal" in lang_key:
            return disclaimers["malayalam"]
        elif "pa" in lang_key or "pun" in lang_key:
            return disclaimers["punjabi"]
        else:
            return disclaimers["en"]
