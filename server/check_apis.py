#!/usr/bin/env python3
"""
Check Google APIs and test different scopes
"""

import os
import gspread
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

def check_apis():
    """Check which APIs are enabled"""
    try:
        print("🔍 Checking enabled APIs...")
        
        # Load credentials
        creds = Credentials.from_service_account_file('credentials.json', 
            scopes=['https://www.googleapis.com/auth/cloud-platform'])
        
        # Build service
        service = build('serviceusage', 'v1', credentials=creds)
        
        # List enabled APIs
        request = service.services().list(
            parent=f'projects/gen-lang-client-0409541986',
            filter='state:ENABLED'
        )
        
        response = request.execute()
        
        print("✅ Enabled APIs:")
        for service_info in response.get('services', []):
            print(f"  - {service_info['config']['name']}")
            
    except Exception as e:
        print(f"❌ Error checking APIs: {e}")

def test_sheets_only():
    """Test Google Sheets without Drive API"""
    try:
        print("\n🔍 Testing Google Sheets only...")
        
        # Use only Sheets scope
        scope = ['https://spreadsheets.google.com/feeds']
        
        creds = Credentials.from_service_account_file('credentials.json', scopes=scope)
        client = gspread.authorize(creds)
        
        print("✅ Google Sheets client created")
        
        # Try to list sheets
        try:
            sheets = client.openall()
            print(f"✅ Found {len(sheets)} accessible sheets")
            for sheet in sheets:
                print(f"  - {sheet.title}")
        except Exception as e:
            print(f"❌ Error listing sheets: {e}")
            
    except Exception as e:
        print(f"❌ Error testing sheets: {e}")

if __name__ == "__main__":
    check_apis()
    test_sheets_only() 