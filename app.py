import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from numpy import vectorize
from werkzeug.utils import secure_filename
from main_ai import create_vectorstore, generate_text_from_pdf, split_text_into_chunks, user_query
from main_url_ai import split_url_text_into_chunks, create_url_vectorstore
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'files' not in request.files:
        print(request.files)
        return jsonify({"error": "No file part"}), 401

    files = request.files.getlist('files')
    if not files or len(files) == 0:
        return jsonify({"error": "No selected files"}), 400
    
    # Process uploaded files and generate text
    text = generate_text_from_pdf(files)

    # Break down text into chunks
    chunks = split_text_into_chunks(text)

    # Create Vector store for our chunks
    create_vectorstore(chunks)

    # for file in files:
    #     print(file)
    # saved_files = []
    # for file in files:
    #     if file:
    #         filename = secure_filename(file.filename)
    #         file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    #         file.save(file_path)
    #         saved_files.append(filename)

    return jsonify({"message": "Files uploaded successfully"}), 200

@app.route('/search', methods=['GET'])
def search_Docs():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "No search query provided"}), 400
    
    print(query)
    response = user_query(query)

    print(response)

    return jsonify(response), 200

@app.route('/urls', methods=['POST'])
def process_url():
    data = json.loads(request.data)
    url = data.get('data','')
    if not url:
        return jsonify({"error": "No URL provided"}), 400
    

    chunks = split_url_text_into_chunks([url.get('url')])

    create_url_vectorstore(chunks)
    # print(chunks)

    return jsonify({"message":"value"}), 200


if __name__ == '__main__':
    app.run(debug = True)