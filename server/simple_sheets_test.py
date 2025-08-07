#!/usr/bin/env python3
"""
Simple Google Sheets test without Drive API
"""

import os
import gspread
from google.oauth2.service_account import Credentials

def test_simple_sheets():
    """Test Google Sheets with minimal scopes"""
    try:
        print("🔍 Testing simple Google Sheets connection...")
        
        # Use only Sheets scope (no Drive API)
        scope = ['https://spreadsheets.google.com/feeds']
        
        # Load credentials
        creds = Credentials.from_service_account_file('credentials.json', scopes=scope)
        print("✅ Credentials loaded")
        
        # Authorize client
        client = gspread.authorize(creds)
        print("✅ Client authorized")
        
        # Try to access existing sheet by name
        try:
            sheet = client.open('Portfolio User Tracking Data')
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
            print("❌ Sheet 'Portfolio User Tracking Data' not found")
            print("💡 Please create the Google Sheet and share it with the service account")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_simple_sheets()
    if success:
        print("\n🎉 Simple Google Sheets connection successful!")
    else:
        print("\n⚠️  Simple Google Sheets connection failed.") 