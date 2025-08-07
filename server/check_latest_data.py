#!/usr/bin/env python3
"""
Check latest tracking data
"""

import csv
import os
from datetime import datetime
from googleSheetsTracker import sheets_tracker

def check_csv_data():
    """Check latest CSV data"""
    csv_path = '../public/user_behavior_tracking.csv'
    
    if not os.path.exists(csv_path):
        print("❌ CSV file not found")
        return
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
        
        print(f"📊 CSV Records: {len(rows)} total")
        
        if rows:
            latest = rows[-1]
            print(f"📅 Latest CSV Record:")
            print(f"   User ID: {latest.get('user-id', 'N/A')}")
            print(f"   Time: {latest.get('start-time', 'N/A')}")
            print(f"   Target: {latest.get('playground-mess-target', 'N/A')}")
            print(f"   Description: {latest.get('playground-mess-description', 'N/A')}")
            print(f"   Step 1: {latest.get('playground-step1', 'N/A')}")
            print(f"   Team: {latest.get('playground-mess-team', 'N/A')}")
            print(f"   Timeline: {latest.get('playground-mess-timeline', 'N/A')}")
            print(f"   Step 2: {latest.get('playground-step2', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")

def check_google_sheets_data():
    """Check latest Google Sheets data"""
    try:
        if sheets_tracker.sheet:
            # Get all values from the sheet
            all_values = sheets_tracker.sheet.get_all_values()
            
            if len(all_values) > 1:  # Has data beyond headers
                headers = all_values[0]
                latest_row = all_values[-1]
                
                print(f"📊 Google Sheets Records: {len(all_values) - 1} total")
                print(f"📅 Latest Google Sheets Record:")
                
                # Create a dictionary from headers and latest row
                latest_data = dict(zip(headers, latest_row))
                
                print(f"   User ID: {latest_data.get('user-id', 'N/A')}")
                print(f"   Time: {latest_data.get('start-time', 'N/A')}")
                print(f"   Target: {latest_data.get('playground-mess-target', 'N/A')}")
                print(f"   Description: {latest_data.get('playground-mess-description', 'N/A')}")
                print(f"   Step 1: {latest_data.get('playground-step1', 'N/A')}")
                print(f"   Team: {latest_data.get('playground-mess-team', 'N/A')}")
                print(f"   Timeline: {latest_data.get('playground-mess-timeline', 'N/A')}")
                print(f"   Step 2: {latest_data.get('playground-step2', 'N/A')}")
            else:
                print("📊 Google Sheets: No data yet")
        else:
            print("❌ Google Sheets not connected")
            
    except Exception as e:
        print(f"❌ Error reading Google Sheets: {e}")

def check_recent_activity():
    """Check recent activity (last 5 records)"""
    print("\n🕒 Recent Activity (Last 5 Records):")
    print("=" * 50)
    
    # Check CSV recent activity
    csv_path = '../public/user_behavior_tracking.csv'
    if os.path.exists(csv_path):
        try:
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                rows = list(reader)
            
            recent_csv = rows[-5:] if len(rows) >= 5 else rows
            
            for i, row in enumerate(recent_csv):
                print(f"📝 Record {len(rows) - len(recent_csv) + i + 1}:")
                print(f"   Time: {row.get('start-time', 'N/A')}")
                print(f"   Target: {row.get('playground-mess-target', 'N/A')}")
                print(f"   Description: {row.get('playground-mess-description', 'N/A')[:50]}...")
                print(f"   Step 1: {row.get('playground-step1', 'N/A')}")
                print(f"   Step 2: {row.get('playground-step2', 'N/A')}")
                print()
                
        except Exception as e:
            print(f"❌ Error reading recent CSV: {e}")

if __name__ == "__main__":
    print("🔍 Checking Latest Tracking Data...")
    print("=" * 50)
    
    check_csv_data()
    print()
    check_google_sheets_data()
    check_recent_activity()
    
    print("✅ Data check completed!")
    print("\n💡 To see real-time updates:")
    print("1. Test your live site")
    print("2. Run this script again")
    print("3. Check Google Sheets directly") 