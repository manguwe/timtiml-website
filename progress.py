from http.server import BaseHTTPRequestHandler
import json, os, urllib.request, urllib.error

SUPABASE_URL = os.environ.get("SUPABASE_URL","")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY","")

def sb(method, table, data=None, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}{params}"
    req = urllib.request.Request(url, data=json.dumps(data).encode() if data else None,
        method=method, headers={"apikey":SUPABASE_KEY,"Authorization":f"Bearer {SUPABASE_KEY}",
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

            # ── Save lesson completed ──
            if action == "save":
                email  = body.get("email","").strip().lower()
                course = body.get("course","").strip()
                lesson = int(body.get("lesson", 0))
                if not email or not course or not lesson:
                    return self._respond(400,{"error":"email, course and lesson required"})
                data,_ = sb("POST","lesson_progress",
                    {"user_email":email,"course":course,"lesson_num":lesson,"quiz_passed":True},
                    "?on_conflict=user_email,course,lesson_num")
                return self._respond(200,{"success":True})

            # ── Get all progress for a user ──
            elif action == "get":
                email  = body.get("email","").strip().lower()
                course = body.get("course","")
                params = f"?user_email=eq.{email}&select=course,lesson_num,quiz_passed"
                if course: params += f"&course=eq.{course}"
                data,_ = sb("GET","lesson_progress",params=params)
                # Build map: { course: [1,2,3,...] }
                progress = {}
                for row in (data or []):
                    c = row["course"]
                    if c not in progress: progress[c] = []
                    if row["quiz_passed"]: progress[c].append(row["lesson_num"])
                return self._respond(200,{"progress":progress})

            # ── Get leaderboard — top learners ──
            elif action == "leaderboard":
                data,_ = sb("GET","lesson_progress",
                    params="?quiz_passed=eq.true&select=user_email&order=user_email")
                from collections import Counter
                counts = Counter(row["user_email"] for row in (data or []))
                top = [{"email":e[:3]+"***"+e[e.find("@"):],"lessons":c}
                       for e,c in counts.most_common(10)]
                return self._respond(200,{"leaderboard":top})

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
