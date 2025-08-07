#!/usr/bin/env python3
"""
Test creating/accessing Google Sheet with correct scopes
"""

import os
import gspread
from google.oauth2.service_account import Credentials

def test_sheet_creation():
    """Test Google Sheets with correct scopes"""
    try:
        print("🔍 Testing Google Sheets with correct scopes...")
        
        # Use the correct scopes for Google Sheets
        scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/spreadsheets'
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
            print(f"✅ Successfully accessed existing sheet: {sheet.title}")
            print(f"📋 Sheet URL: {sheet.url}")
            return True
            
        except gspread.SpreadsheetNotFound:
            print(f"📊 Sheet '{sheet_name}' not found, trying to create...")
            
            # Try to create new sheet (this requires Drive API)
            try:
                sheet = client.create(sheet_name)
                print(f"✅ Successfully created new sheet: {sheet.title}")
                print(f"📋 Sheet URL: {sheet.url}")
                return True
                
            except Exception as create_error:
                print(f"❌ Could not create sheet: {create_error}")
                print("💡 Please manually create the Google Sheet and share it with the service account")
                return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_sheet_creation()
    if success:
        print("\n🎉 Google Sheets test successful!")
    else:
        print("\n⚠️  Google Sheets test failed.") 