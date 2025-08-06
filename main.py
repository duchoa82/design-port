import os
import sys
import logging

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

    if __name__ == '__main__':
        port = int(os.environ.get('PORT', 3001))
        logger.info(f"Starting server on port: {port}")
        app.run(host='0.0.0.0', port=port, debug=False)
        
except Exception as e:
    logger.error(f"Error starting server: {e}")
    raise 