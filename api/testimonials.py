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

            # ── Submit new testimonial ──
            if action == "submit":
                required = ["name","email","service","text","stars","code"]
                for f in required:
                    if not body.get(f):
                        return self._respond(400,{"error":f"Missing: {f}"})
                data,status = sb("POST","testimonials",{
                    "name":          body["name"],
                    "email":         body["email"].lower(),
                    "service":       body["service"],
                    "text":          body["text"],
                    "stars":         int(body["stars"]),
                    "location":      body.get("location",""),
                    "approval_code": body["code"],
                    "status":        "pending",
                })
                if status not in [200,201]:
                    return self._respond(500,{"error":"Failed to save testimonial"})
                return self._respond(200,{"success":True,"message":"Testimonial submitted for review"})

            # ── Get all approved testimonials (public) ──
            elif action == "get_approved":
                data,_ = sb("GET","testimonials",
                    params="?status=eq.approved&select=name,service,text,stars,location,approved_at&order=approved_at.desc")
                return self._respond(200,{"testimonials": data or []})

            # ── Verify approval code → user sees their testimonial ──
            elif action == "verify_code":
                email = body.get("email","").lower()
                code  = body.get("code","").upper()
                if not email or not code:
                    return self._respond(400,{"error":"Email and code required"})
                data,_ = sb("GET","testimonials",
                    params=f"?email=eq.{email}&approval_code=eq.{code}&select=*")
                if not data:
                    return self._respond(404,{"error":"Code does not match"})
                testi = data[0]
                return self._respond(200,{"success":True,"testimonial":testi,"status":testi["status"]})

            # ── Approve a testimonial (Anotida's admin action) ──
            elif action == "approve":
                secret = body.get("secret","")
                if secret != os.environ.get("ADMIN_SECRET",""):
                    return self._respond(403,{"error":"Unauthorised"})
                testi_id = body.get("id","")
                sb("PATCH","testimonials",
                    {"status":"approved","approved_at":"now()"},
                    f"?id=eq.{testi_id}")
                return self._respond(200,{"success":True})

            # ── Get all pending (Anotida's admin view) ──
            elif action == "get_pending":
                secret = body.get("secret","")
                if secret != os.environ.get("ADMIN_SECRET",""):
                    return self._respond(403,{"error":"Unauthorised"})
                data,_ = sb("GET","testimonials",
                    params="?status=eq.pending&select=*&order=submitted_at.desc")
                return self._respond(200,{"testimonials": data or []})

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
