import os
import sys
import logging
from flask import Flask, send_from_directory

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    # Add the server directory to the Python path
    server_path = os.path.join(os.path.dirname(__file__), 'server')
    sys.path.append(server_path)
    logger.info(f"Added server path: {server_path}")

    # Change to the server directory
    os.chdir('server')
    logger.info(f"Changed to server directory: {os.getcwd()}")

    # Import and run the Flask app
    from gemini_server import app
    logger.info("Successfully imported Flask app")

    # Add route to serve static files from React build
    @app.route('/')
    def serve_frontend():
        return send_from_directory('../public', 'index.html')
    
    @app.route('/<path:path>')
    def serve_static(path):
        if os.path.exists(os.path.join('../public', path)):
            return send_from_directory('../public', path)
        else:
            return send_from_directory('../public', 'index.html')

    if __name__ == '__main__':
        port = int(os.environ.get('PORT', 3001))
        logger.info(f"Starting server on port: {port}")
        app.run(host='0.0.0.0', port=port, debug=False)
        
except Exception as e:
    logger.error(f"Error starting server: {e}")
    raise 