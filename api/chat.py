from http.server import BaseHTTPRequestHandler
import json, os, urllib.request, urllib.error

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
MODEL        = "llama3-8b-8192"

SYSTEM_PROMPT = """You are TimtimlBot — the friendly AI assistant for the TIMTIML website by Anotida Manguwe.

ABOUT ANOTIDA MANGUWE:
- Full name: Anotida Manguwe | Brand: TIMTIML / Tim.timL Innovatives
- BSc IT Year 1, Eden University, Zambia (2025)
- Tagline: "Turning Ideas Into Visual Impact"
- Cisco Cybersecurity & Cisco Cyber Awareness certified
- Skills: C, C++, C#, Java, Python, JavaScript, HTML, CSS, Graphic Design, Networking, Cybersecurity
- Location: Zambia & Zimbabwe

CONTACT:
- WhatsApp: +260768648291 | wa.me/260768648291
- Email: anotida30manguwe12@gmail.com
- Instagram/GitHub/Threads: @timtiml
- Website: https://timtiml-website.vercel.app

SERVICES & PRICING:
- Graphic Design: Basic Poster K50, Premium Poster K100, Logo K150, Social Media K200/month
- Web Dev: Landing Page K500, Business Website K1200, E-Commerce K2500
- Tutoring: O Level CS K80, A Level CS K100, Programming K90, Cybersecurity K120 (per session)
- Payments: MTN Mobile Money, Airtel Money, EcoCash, Bank Transfer, PayPal, Mukuru
- International: USD $2.50, ZAR R45, GBP £2

FREE LESSONS on website:
- HTML, CSS, JavaScript, Python, Java, C, C++, C#, O Level CS, A Level CS, Cybersecurity
- Lessons 1-4 free | Lesson 5 needs email signup | Lessons 6+ need one-time payment
- Each lesson has quizzes (85% to pass) and a completion certificate

RULES:
- Be friendly, helpful and professional. Use emojis naturally.
- Keep replies under 120 words unless detail is needed.
- For orders guide users to WhatsApp: wa.me/260768648291
- Never make up prices or facts not listed above.
- Respond in the same language the user writes in."""


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            length  = int(self.headers.get("Content-Length", 0))
            body    = json.loads(self.rfile.read(length))
            message = body.get("message", "").strip()

            if not message:
                return self._respond(400, {"error": "No message provided"})

            if not GROQ_API_KEY:
                return self._respond(500, {"error": "API key not configured on server"})

            payload = json.dumps({
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user",   "content": message}
                ],
                "max_tokens":  400,
                "temperature": 0.7,
            }).encode("utf-8")

            req = urllib.request.Request(
                GROQ_URL, data=payload, method="POST",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type":  "application/json",
                }
            )

            with urllib.request.urlopen(req, timeout=15) as resp:
                data  = json.loads(resp.read())
                reply = data["choices"][0]["message"]["content"]
                return self._respond(200, {"response": reply})

        except urllib.error.HTTPError as e:
            err = e.read().decode()
            return self._respond(502, {"error": f"Groq API error: {err[:200]}"})
        except Exception as e:
            return self._respond(500, {"error": str(e)})

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _respond(self, code, data):
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def log_message(self, *args):
        pass
