#!/usr/bin/env python3
"""
Test Google Sheets with full scope including Drive API
"""

import os
import gspread
from google.oauth2.service_account import Credentials

def test_full_scope():
    """Test Google Sheets with full scope"""
    try:
        print("🔍 Testing Google Sheets with full scope...")
        
        # Use full scope including Drive API
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
        
        # Load credentials
        creds = Credentials.from_service_account_file('credentials.json', scopes=scope)
        print("✅ Credentials loaded")
        
        # Authorize client
        client = gspread.authorize(creds)
        print("✅ Client authorized")
        
        sheet_name = 'Portfolio User Tracking Data'
        
        # Try to access existing sheet
        try:
            sheet = client.open(sheet_name)
            print(f"✅ Successfully accessed sheet: {sheet.title}")
            print(f"📋 Sheet URL: {sheet.url}")
            
            # Test basic operations
            worksheet = sheet.get_worksheet(0)
            print(f"✅ Worksheet accessed: {worksheet.title}")
            
            # Get all values
            values = worksheet.get_all_values()
            print(f"✅ Sheet has {len(values)} rows")
            
            return True
            
        except gspread.SpreadsheetNotFound:
            print(f"❌ Sheet '{sheet_name}' not found")
            print("💡 Please create the Google Sheet and share it with the service account")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    success = test_full_scope()
    if success:
        print("\n🎉 Full scope Google Sheets test successful!")
    else:
        print("\n⚠️  Full scope Google Sheets test failed.") 