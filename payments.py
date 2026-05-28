from http.server import BaseHTTPRequestHandler
import json, os, urllib.request, urllib.error

SUPABASE_URL = os.environ.get("SUPABASE_URL","")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY","")

def sb(method, table, data=None, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}{params}"
    req = urllib.request.Request(url,
        data=json.dumps(data).encode() if data else None,
        method=method,
        headers={"apikey":SUPABASE_KEY,"Authorization":f"Bearer {SUPABASE_KEY}",
                 "Content-Type":"application/json","Prefer":"return=representation"})
    try:
        with urllib.request.urlopen(req,timeout=10) as r: return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e: return json.loads(e.read()), e.code

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200); self._cors(); self.end_headers()

    def do_POST(self):
        try:
            body   = json.loads(self.rfile.read(int(self.headers.get("Content-Length",0))))
            action = body.get("action")

            # ── Save new payment record ──
            if action == "save":
                required = ["name","email","phone","currency","amount","ref_code"]
                for f in required:
                    if not body.get(f):
                        return self._respond(400,{"error":f"Missing: {f}"})
                data,status = sb("POST","payments",{
                    "name":     body["name"],
                    "email":    body["email"].lower(),
                    "phone":    body["phone"],
                    "currency": body["currency"],
                    "amount":   body["amount"],
                    "ref_code": body["ref_code"].upper(),
                    "verified": False,
                })
                if status not in [200,201]:
                    return self._respond(500,{"error":"Failed to save payment"})
                return self._respond(200,{"success":True})

            # ── Verify payment code entered by user ──
            elif action == "verify":
                email    = body.get("email","").lower()
                ref_code = body.get("ref_code","").upper()
                if not email or not ref_code:
                    return self._respond(400,{"error":"Email and ref_code required"})
                data,_ = sb("GET","payments",
                    params=f"?email=eq.{email}&ref_code=eq.{ref_code}&select=*")
                if not data:
                    return self._respond(404,{"error":"Payment record not found"})
                payment = data[0]
                if not payment.get("verified"):
                    return self._respond(403,{"error":"Payment not yet verified by Anotida"})
                return self._respond(200,{"success":True,"payment":payment})

            # ── Anotida marks payment as verified ──
            elif action == "approve":
                secret   = body.get("secret","")
                if secret != os.environ.get("ADMIN_SECRET",""):
                    return self._respond(403,{"error":"Unauthorised"})
                ref_code = body.get("ref_code","").upper()
                sb("PATCH","payments",
                    {"verified":True,"verified_at":"now()"},
                    f"?ref_code=eq.{ref_code}")
                return self._respond(200,{"success":True})

            # ── Get all pending payments (Anotida admin) ──
            elif action == "get_pending":
                secret = body.get("secret","")
                if secret != os.environ.get("ADMIN_SECRET",""):
                    return self._respond(403,{"error":"Unauthorised"})
                data,_ = sb("GET","payments",
                    params="?verified=eq.false&select=*&order=created_at.desc")
                return self._respond(200,{"payments": data or []})

            # ── Check if email already has verified payment ──
            elif action == "check":
                email = body.get("email","").lower()
                data,_ = sb("GET","payments",
                    params=f"?email=eq.{email}&verified=eq.true&select=ref_code,verified_at")
                return self._respond(200,{"paid": len(data) > 0})

            else:
                return self._respond(400,{"error":"Unknown action"})

        except Exception as e:
            self._respond(500,{"error":str(e)})

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin","*")
        self.send_header("Access-Control-Allow-Methods","POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers","Content-Type")

    def _respond(self, code, data):
        self.send_response(code); self._cors()
        self.send_header("Content-Type","application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def log_message(self,*a): pass
