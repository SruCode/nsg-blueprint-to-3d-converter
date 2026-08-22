import os
from flask import Flask, jsonify, request
from flask_cors import CORS

# Direct import for script execution inside backend/
from parser import process_blueprint

app = Flask(__name__)
CORS(app)

# Resolve directories relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAMPLE_IMAGE = os.path.join(BASE_DIR, 'sample.png')
TEMP_DIR = os.path.join(BASE_DIR, 'temp')

# Ensure temporary directory exists for uploads
os.makedirs(TEMP_DIR, exist_ok=True)

@app.route('/get-walls', methods=['GET'])
def get_walls():
    """Returns wall data extracted from default sample.png."""
    try:
        walls = process_blueprint(SAMPLE_IMAGE)
        return jsonify(walls), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload-blueprint', methods=['POST'])
def upload_blueprint():
    """Accepts dynamic blueprint image uploads from frontend."""
    if 'file' not in request.files:
        return jsonify({"error": "No file payload provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Save incoming image temporarily
    temp_path = os.path.join(TEMP_DIR, file.filename)
    file.save(temp_path)

    try:
        # Run OpenCV Hough line detection on uploaded image
        walls = process_blueprint(temp_path)
        
        # Clean up temporary upload file after processing
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return jsonify(walls), 200
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": str(e)}), 500

# Must be top-level (unindented)
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)