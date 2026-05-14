from http.server import BaseHTTPRequestHandler
import json, os, urllib.request, urllib.error

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
MODEL        = "llama3-8b-8192"

SYSTEM_PROMPT = """You are TimtimlBot — the official AI assistant for the TIMTIML website owned by Anotida Manguwe.

ABOUT ANOTIDA MANGUWE:
- Full name: Anotida Manguwe. Brand: TIMTIML / Tim.timL Innovatives
- BSc Information Technology, Year 1, Eden University, Zambia (2025)
- Tagline: "Turning Ideas Into Visual Impact"
- Cisco Cybersecurity & Cisco Cyber Awareness certified
- Skills: C, C++, C#, Java, Python, JavaScript, HTML, CSS, Graphic Design, Networking, Cybersecurity
- Location: Zambia & Zimbabwe

CONTACT DETAILS:
- WhatsApp: +260768648291 (wa.me/260768648291)
- Email: anotida30manguwe12@gmail.com
- Instagram: @timtiml | GitHub: timtiml | Facebook: Anotida Manguwe | Threads: @timtiml
- Live website: https://timtiml-website.vercel.app

SERVICES & PRICING:
1. GRAPHIC DESIGN: Basic Poster (K50), Premium Poster (K100), Logo & Brand Identity (K150), Social Media Package (K200/month)
2. WEB DEVELOPMENT: Landing Page (K500), Business Website (K1200), Portfolio/E-Commerce (K2500)
3. TUTORING: O Level CS (K80/session), A Level CS (K100/session), Programming Help (K90/session), Cybersecurity (K120/session)
4. International payments: USD, ZAR, GBP, ZWL, KES accepted
5. Payment methods: MTN Mobile Money, Airtel Money, EcoCash, Bank Transfer, PayPal, Mukuru

FREE LESSONS ON WEBSITE:
- HTML, CSS, JavaScript, Python, Java, C, C++, C# — 7-8 lessons each with quizzes (85% pass) and certificates
- O Level CS, A Level CS, Cybersecurity — full topic coverage, Cambridge & ZIMSEC aligned
- Lessons 1-4 free. Lesson 5 requires email signup. Lessons 6+ require one-time payment.

YOUR ROLE:
- Answer questions about Anotida, services, pricing, lessons helpfully and professionally
- Be friendly and use emojis naturally
- For orders, guide users to WhatsApp: wa.me/260768648291
- Keep responses under 120 words unless detail is needed
- Never make up facts not listed above
- Respond in the same language the user writes in"""


class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_POST(self):
        try:
            length  = int(self.headers.get("Content-Length", 0))
            body    = json.loads(self.rfile.read(length))
            message = body.get("message", "").strip()

            if not message:
                self._respond(400, {"error": "No message provided"})
                return

            if not GROQ_API_KEY:
                self._respond(500, {"error": "API key not configured"})
                return

            # Build Groq request
            payload = json.dumps({
                "model": MODEL,
                "messages": [
                    {"role": "system",    "content": SYSTEM_PROMPT},
                    {"role": "user",      "content": message},
                ],
                "max_tokens": 400,
                "temperature": 0.7,
            }).encode("utf-8")

            req = urllib.request.Request(
                GROQ_URL,
                data=payload,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type":  "application/json",
                },
                method="POST",
            )

            with urllib.request.urlopen(req, timeout=15) as resp:
                data   = json.loads(resp.read())
                reply  = data["choices"][0]["message"]["content"]
                self._respond(200, {"response": reply})

        except urllib.error.HTTPError as e:
            err = e.read().decode()
            self._respond(502, {"error": f"Groq error: {err[:200]}"})
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _respond(self, code, data):
        self.send_response(code)
        self._send_cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def log_message(self, *args):
        pass  # suppress default access logs
