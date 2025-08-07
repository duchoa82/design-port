#!/usr/bin/env python3
"""
Simple test endpoint to verify Railway is working
"""

from flask import Flask, jsonify
from datetime import datetime
import os

app = Flask(__name__)

@app.route('/test-write', methods=['GET'])
def test_write():
    """Simple test to write a timestamp to a file"""
    try:
        # Write a simple timestamp to a test file
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        test_data = f"Railway test at: {timestamp}\n"
        
        # Write to a simple test file
        with open('railway_test.log', 'a') as f:
            f.write(test_data)
        
        return jsonify({
            'status': 'success',
            'message': f'Test write successful at {timestamp}',
            'file_written': 'railway_test.log'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Test write failed: {str(e)}'
        })

@app.route('/test-read', methods=['GET'])
def test_read():
    """Simple test to read the test file"""
    try:
        if os.path.exists('railway_test.log'):
            with open('railway_test.log', 'r') as f:
                content = f.read()
            return jsonify({
                'status': 'success',
                'content': content,
                'file_exists': True
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Test file does not exist',
                'file_exists': False
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Test read failed: {str(e)}'
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 3001))) 