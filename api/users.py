from http.server import BaseHTTPRequestHandler
import json, os, urllib.request, urllib.error

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def supabase(method, table, data=None, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}{params}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200); self._cors(); self.end_headers()

    def do_POST(self):
        try:
            body   = json.loads(self.rfile.read(int(self.headers.get("Content-Length",0))))
            action = body.get("action")

            if action == "register":
                name  = body.get("name","").strip()
                email = body.get("email","").strip().lower()
                if not name or not email:
                    return self._respond(400, {"error":"Name and email required"})
                supabase("POST","users",{"name":name,"email":email},"?on_conflict=email")
                user,_ = supabase("GET","users",params=f"?email=eq.{email}&select=*")
                u = user[0] if user else {"name":name,"email":email}
                return self._respond(200, {"success":True,"user":u})

            elif action == "get":
                email = body.get("email","").strip().lower()
                user,_ = supabase("GET","users",params=f"?email=eq.{email}&select=*")
                if not user: return self._respond(404,{"error":"Not found"})
                return self._respond(200, {"user":user[0]})

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
