import os
from flask import Flask, jsonify
from flask_cors import CORS
from parser import process_blueprint

app = Flask(__name__)
CORS(app)

# Resolve full path to sample.png inside backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_IMAGE = os.path.join(BASE_DIR, '..', 'sample.png')

@app.route('/get-walls', methods=['GET'])
def get_walls():
    try:
        walls = process_blueprint(SAMPLE_IMAGE)
        return jsonify(walls), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)