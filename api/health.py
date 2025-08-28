from flask import Flask, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "message": "IBS Care API is running on Vercel"})

# Vercel serverless function handler
def handler(request):
    return app(request.environ, lambda status, headers: None)
