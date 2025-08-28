import os
import sys
import logging
from flask import Flask, send_from_directory

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"Files in current directory: {os.listdir('.')}")
    
    # Check if server directory exists
    if not os.path.exists('server'):
        logger.error("Server directory not found!")
        logger.error(f"Available directories: {[d for d in os.listdir('.') if os.path.isdir(d)]}")
        raise FileNotFoundError("Server directory not found")
    
    # Add the server directory to the Python path
    server_path = os.path.abspath('server')
    sys.path.insert(0, server_path)
    logger.info(f"Added server path: {server_path}")
    logger.info(f"Files in server directory: {os.listdir('server')}")

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

    # Simple health check endpoint
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'Service is running'}, 200

    if __name__ == '__main__':
        port = int(os.environ.get('PORT', 3001))
        logger.info(f"Starting server on port: {port}")
        logger.info(f"Current working directory: {os.getcwd()}")
        logger.info(f"Python path: {sys.path}")
        
        # Start the app
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