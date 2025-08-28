import os
import sys
import logging
from flask import Flask, jsonify

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a simple Flask app first
app = Flask(__name__)

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Service is running'}), 200

@app.route('/')
def home():
    return jsonify({'message': 'Design Port API is running'}), 200

@app.route('/api/test')
def test():
    return jsonify({'message': 'API endpoint working'}), 200

if __name__ == '__main__':
    try:
        port = int(os.environ.get('PORT', 3001))
        logger.info(f"Starting simple Flask server on port: {port}")
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Files in current directory: {os.listdir('.')}")
        
        # Start the simple app first
        app.run(host='0.0.0.0', port=port, debug=False)
        
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        # Keep the process running for debugging
        logger.info("Keeping process alive for debugging...")
        import time
        while True:
            time.sleep(10)
            logger.info("Process still alive...") 