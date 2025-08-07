#!/usr/bin/env python3
"""
Simple migration script that works without Drive API
"""

import csv
import os
from datetime import datetime

def migrate_to_csv_backup():
    """Migrate data to an enhanced CSV backup"""
    print("📊 Creating enhanced CSV backup...")
    
    # Read existing data
    behavior_csv = '../public/user_behavior_tracking.csv'
    chatwidget_csv = '../public/chatwidget.csv'
    
    # Create enhanced backup
    backup_file = '../public/enhanced_user_tracking.csv'
    
    try:
        # Read behavior tracking data
        behavior_data = []
        if os.path.exists(behavior_csv):
            with open(behavior_csv, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                behavior_data = list(reader)
            print(f"✅ Read {len(behavior_data)} behavior tracking records")
        
        # Read chat widget data
        chat_data = []
        if os.path.exists(chatwidget_csv):
            with open(chatwidget_csv, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                chat_data = list(reader)
            print(f"✅ Read {len(chat_data)} chat widget records")
        
        # Create enhanced backup with summary
        with open(backup_file, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            
            # Write summary header
            writer.writerow(['=== PORTFOLIO USER TRACKING DATA ==='])
            writer.writerow(['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
            writer.writerow(['Total Behavior Records:', len(behavior_data)])
            writer.writerow(['Total Chat Records:', len(chat_data)])
            writer.writerow([])
            
            # Write behavior data
            if behavior_data:
                writer.writerow(['=== BEHAVIOR TRACKING DATA ==='])
                writer.writerow(behavior_data[0].keys())  # Headers
                for row in behavior_data:
                    writer.writerow(row.values())
                writer.writerow([])
            
            # Write chat data
            if chat_data:
                writer.writerow(['=== CHAT WIDGET Q&A DATA ==='])
                writer.writerow(chat_data[0].keys())  # Headers
                for row in chat_data:
                    writer.writerow(row.values())
        
        print(f"✅ Enhanced backup created: {backup_file}")
        print(f"📊 Total records backed up: {len(behavior_data) + len(chat_data)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating backup: {e}")
        return False

def show_data_summary():
    """Show summary of existing data"""
    print("\n📊 DATA SUMMARY:")
    print("=" * 50)
    
    # Check behavior tracking
    behavior_csv = '../public/user_behavior_tracking.csv'
    if os.path.exists(behavior_csv):
        with open(behavior_csv, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
            print(f"📈 Behavior Tracking: {len(rows)} records")
            if rows:
                print(f"   Latest: {rows[-1].get('start-time', 'N/A')}")
    
    # Check chat widget
    chatwidget_csv = '../public/chatwidget.csv'
    if os.path.exists(chatwidget_csv):
        with open(chatwidget_csv, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
            print(f"💬 Chat Widget Q&A: {len(rows)} records")
    
    print("=" * 50)

if __name__ == "__main__":
    print("🚀 Starting data backup and summary...")
    
    show_data_summary()
    success = migrate_to_csv_backup()
    
    if success:
        print("\n🎉 Data backup completed successfully!")
        print("📁 Your data is safely backed up in CSV format")
        print("💡 You can manually upload this to Google Sheets if needed")
    else:
        print("\n⚠️  Data backup completed with errors.") 