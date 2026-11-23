"""Isolated browser QA server; no changes to the user's application database."""
from pathlib import Path
import sys, os
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
import server
server.DB_PATH=str(server.ROOT/'data'/'browser-qa.sqlite3')
server.initialize()
with server.db() as c:
    for name in ('preview_tester','preview_teammate'):
        row=c.execute('SELECT id FROM users WHERE username=?',(name,)).fetchone()
        if row: continue
        uid=server.secrets.token_hex(12)
        c.execute('INSERT INTO users VALUES(?,?,?,?,?)',(uid,name,name+'@example.test',server.password_hash('Preview-test-only-42'),server.time.time()))
        bid=server.secrets.token_hex(12);now=server.time.time()
        c.execute('INSERT INTO records VALUES(?,?,?,?,?,?,?)',(bid,'bankroll',uid,None,server.json.dumps({'name':'QA bankroll','currency':'USD','initial':10000,'type':'solo'}),now,now))
        c.execute('INSERT INTO members VALUES(?,?,?,?)',(bid,uid,'owner',100))
print('Isolated browser QA server: http://127.0.0.1:8001',flush=True)
server.ThreadingHTTPServer(('127.0.0.1',8001),server.Handler).serve_forever()
