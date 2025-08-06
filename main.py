import os
import sys

# Add the server directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'server'))

# Change to the server directory
os.chdir('server')

# Import and run the Flask app
from gemini_server import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 3001))) 