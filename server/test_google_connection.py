#!/usr/bin/env python3
"""
Test Google Sheets connection
"""

import os
import gspread
from google.oauth2.service_account import Credentials

def test_connection():
    """Test Google Sheets connection"""
    try:
        print("🔍 Testing Google Sheets connection...")
        
        # Check if credentials file exists
        creds_path = 'credentials.json'
        if not os.path.exists(creds_path):
            print(f"❌ Credentials file not found: {creds_path}")
            return False
        
        print(f"✅ Credentials file found: {creds_path}")
        
        # Set up scopes
        scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
        
        # Load credentials
        print("🔑 Loading credentials...")
        creds = Credentials.from_service_account_file(creds_path, scopes=scope)
        print("✅ Credentials loaded")
        
        # Authorize client
        print("🔐 Authorizing client...")
        client = gspread.authorize(creds)
        print("✅ Client authorized")
        
        # Test sheet access
        print("📊 Testing sheet access...")
        sheet_name = "Portfolio User Tracking Data"
        
        try:
            sheet = client.open(sheet_name)
            print(f"✅ Successfully accessed sheet: {sheet_name}")
            print(f"📋 Sheet URL: {sheet.url}")
            return True
        except gspread.SpreadsheetNotFound:
            print(f"❌ Sheet not found: {sheet_name}")
            print("💡 Please create the Google Sheet and share it with the service account")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    success = test_connection()
    if success:
        print("\n🎉 Google Sheets connection successful!")
    else:
        print("\n⚠️  Google Sheets connection failed. Check the errors above.") 