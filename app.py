import os
import sys
import logging

from flask import Flask, render_template 
from waitress import serve
from dotenv import load_dotenv

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

@app.route('/')
def home():
    return render_template('index.html')
        
if __name__ == "__main__":
    serve(app, host='0.0.0.0', port=5000,threads=8)
