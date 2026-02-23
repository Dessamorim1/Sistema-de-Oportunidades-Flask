import os
import sys
import logging

from flask import Flask, render_template,session,request,redirect,url_for,jsonify
from waitress import serve
from dotenv import load_dotenv
from login_required import login_required
from datetime import timedelta
from exceptions import SAPError

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [%(name)s] %(message)s',
    handlers=[
        logging.FileHandler("app.log", encoding="utf-8"), 
        logging.StreamHandler() 
    ]
)

logger = logging.getLogger(__name__)

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS  
    except Exception:
        base_path = os.path.abspath(".")  
    return os.path.join(base_path, relative_path)

app = Flask(__name__,template_folder=resource_path("templates"),static_folder=resource_path("static"))
app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.permanent_session_lifetime = timedelta(minutes=30)

@app.errorhandler(SAPError)
def handle_sap_error(e):
    return jsonify({"erro": e.mensagem, "code": e.code}), e.status_code

@app.route('/')
def home():
    if session.get("user_ok"):
        return redirect(url_for("opor_page"))
    return render_template('login.html')

@app.route('/oportunidades')
@login_required
def opor_page():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    user = request.form.get('app_user')
    passw = request.form.get('app_pass')

    if user == os.getenv('APP_USER') and passw == os.getenv('APP_PASS'):
        session.clear()
        session.permanent = True
        session['user_ok'] = True
        return jsonify({"ok": True})
    
    return jsonify({"ok": False, "erro": "Usuário ou senha inválidos"}), 401

@app.route('/logout',methods=['POST'])
@login_required
def logout():
    session.clear()
    return jsonify({"ok": True})
        
if __name__ == "__main__":
    serve(app, host='0.0.0.0', port=5000,threads=8)
