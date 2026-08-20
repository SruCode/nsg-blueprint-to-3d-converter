from flask import Flask, jsonify, request
from flask_cors import CORS
from parser import process_blueprint

app = Flask(__name__)
CORS(app) # Frontend connectivity ke liye zaroori hai

@app.route('/get-walls', methods=['GET'])
def get_walls():
    # Process image and return JSON
    walls = process_blueprint('sample.png')
    return jsonify(walls)

if __name__ == '__main__':
    print("Server running on http://localhost:5000")
    app.run(port=5000, debug=True)
