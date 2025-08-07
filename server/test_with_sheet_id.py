#!/usr/bin/env python3
"""
Test Google Sheets using direct sheet ID
"""

import os
import gspread
from google.oauth2.service_account import Credentials

def test_with_sheet_id():
    """Test Google Sheets using direct sheet ID"""
    try:
        print("🔍 Testing Google Sheets with direct sheet ID...")
        
        # Use the correct scopes
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
        
        # Use the direct sheet ID
        sheet_id = '1d_0rWHNf5p7-63kmLqbFeFq5BiWOo3pTplmt5rX5dxU'
        
        try:
            sheet = client.open_by_key(sheet_id)
            print(f"✅ Successfully accessed sheet: {sheet.title}")
            print(f"📋 Sheet URL: {sheet.url}")
            
            # Test basic operations
            worksheet = sheet.get_worksheet(0)
            print(f"✅ Worksheet accessed: {worksheet.title}")
            
            # Get all values
            values = worksheet.get_all_values()
            print(f"✅ Sheet has {len(values)} rows")
            
            # Show first few rows
            if values:
                print("\n📊 First few rows:")
                for i, row in enumerate(values[:3]):
                    print(f"  Row {i+1}: {row[:3]}...")  # Show first 3 columns
            
            return True
            
        except Exception as sheet_error:
            print(f"❌ Error accessing sheet: {sheet_error}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    success = test_with_sheet_id()
    if success:
        print("\n🎉 Google Sheets access successful!")
    else:
        print("\n⚠️  Google Sheets access failed.") 