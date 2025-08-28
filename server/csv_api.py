#!/usr/bin/env python3
"""
CSV API Server for remote CSV viewing
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import csv
import os
import json
from datetime import datetime
import pandas as pd

app = Flask(__name__)
CORS(app)

# CSV file path
CSV_PATH = '../public/user_behavior_tracking.csv'

@app.route('/api/csv/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'CSV API Server'
    })

@app.route('/api/csv/stats', methods=['GET'])
def get_stats():
    """Get CSV statistics"""
    try:
        if not os.path.exists(CSV_PATH):
            return jsonify({'error': 'CSV file not found'}), 404
        
        # Read CSV with pandas for better handling
        df = pd.read_csv(CSV_PATH)
        
        stats = {
            'total_records': len(df),
            'total_columns': len(df.columns),
            'columns': list(df.columns),
            'last_updated': datetime.now().isoformat(),
            'file_size': f"{os.path.getsize(CSV_PATH) / 1024:.2f} KB"
        }
        
        # Add some data insights
        if len(df) > 0:
            stats['unique_users'] = df['user-id'].nunique() if 'user-id' in df.columns else 0
            stats['date_range'] = {
                'earliest': df['start-time'].min() if 'start-time' in df.columns else 'N/A',
                'latest': df['start-time'].max() if 'start-time' in df.columns else 'N/A'
            }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/csv/data', methods=['GET'])
def get_csv_data():
    """Get CSV data with pagination and filtering"""
    try:
        if not os.path.exists(CSV_PATH):
            return jsonify({'error': 'CSV file not found'}), 404
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        search = request.args.get('search', '').lower()
        
        # Read CSV
        df = pd.read_csv(CSV_PATH)
        
        # Apply search filter if provided
        if search:
            mask = df.astype(str).apply(lambda x: x.str.lower().str.contains(search, na=False)).any(axis=1)
            df = df[mask]
        
        # Calculate pagination
        total_records = len(df)
        total_pages = (total_records + per_page - 1) // per_page
        
        # Get page data
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        page_data = df.iloc[start_idx:end_idx]
        
        # Convert to list of dictionaries
        records = page_data.to_dict('records')
        
        return jsonify({
            'data': records,
            'pagination': {
                'current_page': page,
                'per_page': per_page,
                'total_records': total_records,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'search': search
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/csv/download', methods=['GET'])
def download_csv():
    """Download CSV file"""
    try:
        if not os.path.exists(CSV_PATH):
            return jsonify({'error': 'CSV file not found'}), 404
        
        return send_file(
            CSV_PATH,
            as_attachment=True,
            download_name=f'user_tracking_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv',
            mimetype='text/csv'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/csv/columns/<column_name>', methods=['GET'])
def get_column_data(column_name):
    """Get unique values and counts for a specific column"""
    try:
        if not os.path.exists(CSV_PATH):
            return jsonify({'error': 'CSV file not found'}), 404
        
        df = pd.read_csv(CSV_PATH)
        
        if column_name not in df.columns:
            return jsonify({'error': f'Column {column_name} not found'}), 404
        
        # Get value counts
        value_counts = df[column_name].value_counts().to_dict()
        
        return jsonify({
            'column': column_name,
            'total_values': len(df[column_name]),
            'unique_values': len(value_counts),
            'value_counts': value_counts
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/csv/recent', methods=['GET'])
def get_recent_data():
    """Get most recent records"""
    try:
        if not os.path.exists(CSV_PATH):
            return jsonify({'error': 'CSV file not found'}), 404
        
        limit = int(request.args.get('limit', 10))
        
        df = pd.read_csv(CSV_PATH)
        
        # Get recent records (assuming they're in order)
        recent_data = df.tail(limit).to_dict('records')
        
        return jsonify({
            'recent_records': recent_data,
            'total_recent': len(recent_data),
            'requested_limit': limit
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/csv/search', methods=['POST'])
def search_csv():
    """Advanced search with multiple criteria"""
    try:
        if not os.path.exists(CSV_PATH):
            return jsonify({'error': 'CSV file not found'}), 404
        
        data = request.get_json()
        search_criteria = data.get('criteria', {})
        
        df = pd.read_csv(CSV_PATH)
        
        # Apply multiple search criteria
        for column, value in search_criteria.items():
            if column in df.columns and value:
                if isinstance(value, str):
                    mask = df[column].astype(str).str.contains(value, case=False, na=False)
                    df = df[mask]
                elif isinstance(value, dict):
                    # Handle range searches
                    if 'min' in value and 'max' in value:
                        mask = (df[column] >= value['min']) & (df[column] <= value['max'])
                        df = df[mask]
        
        results = df.to_dict('records')
        
        return jsonify({
            'search_results': results,
            'total_results': len(results),
            'criteria_used': search_criteria
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting CSV API Server...")
    print("📊 Available endpoints:")
    print("  GET  /api/csv/health - Health check")
    print("  GET  /api/csv/stats - Get CSV statistics")
    print("  GET  /api/csv/data - Get paginated data")
    print("  GET  /api/csv/download - Download CSV")
    print("  GET  /api/csv/columns/<name> - Get column analysis")
    print("  GET  /api/csv/recent - Get recent records")
    print("  POST /api/csv/search - Advanced search")
    print("\n💡 Access your CSV data at:")
    print("  http://localhost:5001/api/csv/stats")
    print("  http://localhost:5001/api/csv/data?page=1&per_page=20")
    
    app.run(host='0.0.0.0', port=5001, debug=True)

