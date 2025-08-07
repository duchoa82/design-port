#!/usr/bin/env python3
"""
Migration script to upload existing CSV data to Google Sheets
"""

import csv
import os
from googleSheetsTracker import sheets_tracker

def migrate_behavior_tracking():
    """Migrate user behavior tracking data from CSV to Google Sheets"""
    csv_path = '../public/user_behavior_tracking.csv'
    
    if not os.path.exists(csv_path):
        print("❌ Behavior tracking CSV not found")
        return False
    
    try:
        print("📊 Migrating behavior tracking data...")
        
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
        
        if not rows:
            print("ℹ️  No data to migrate")
            return True
        
        # Convert CSV data to session format
        for row in rows:
            session_data = {
                'playground_convo_id': row.get('playground-convo-id'),
                'playground_mess_target': row.get('playground-mess-target'),
                'playground_mess_description': row.get('playground-mess-description'),
                'playground_step1': row.get('playground-step1'),
                'playground_mess_team': row.get('playground-mess-team'),
                'playground_mess_timeline': row.get('playground-mess-timeline'),
                'playground_step2': row.get('playground-step2'),
                'chat_bubble_1': row.get('chat-bubble-1'),
                'chat_bubble_2': row.get('chat-bubble-2'),
                'chat_bubble_3': row.get('chat-bubble-3'),
                'chat_bubble_4': row.get('chat-bubble-4'),
                'chat_bubble_free': row.get('chat-bubble-free')
            }
            
            # Record to Google Sheets
            sheets_tracker.record_user_session(session_data)
        
        print(f"✅ Migrated {len(rows)} behavior tracking records")
        return True
        
    except Exception as e:
        print(f"❌ Error migrating behavior tracking: {e}")
        return False

def migrate_chatwidget_qa():
    """Migrate chat widget Q&A data to a separate sheet"""
    csv_path = '../public/chatwidget.csv'
    
    if not os.path.exists(csv_path):
        print("❌ ChatWidget CSV not found")
        return False
    
    try:
        print("💬 Migrating ChatWidget Q&A data...")
        
        # Create a new worksheet for Q&A data
        try:
            qa_worksheet = sheets_tracker.sheet.add_worksheet(title="ChatWidget Q&A", rows=100, cols=10)
        except Exception:
            # Worksheet might already exist
            qa_worksheet = sheets_tracker.sheet.worksheet("ChatWidget Q&A")
        
        # Clear existing data
        qa_worksheet.clear()
        
        # Read CSV data
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
        
        if not rows:
            print("ℹ️  No Q&A data to migrate")
            return True
        
        # Prepare data for Google Sheets
        headers = ['question', 'answer']
        data = [headers]
        
        for row in rows:
            data.append([
                row.get('question', ''),
                row.get('answer', '')
            ])
        
        # Write to Google Sheets
        qa_worksheet.update('A1', data)
        
        print(f"✅ Migrated {len(rows)} Q&A records to 'ChatWidget Q&A' sheet")
        return True
        
    except Exception as e:
        print(f"❌ Error migrating ChatWidget Q&A: {e}")
        return False

def main():
    """Main migration function"""
    print("🚀 Starting migration to Google Sheets...")
    
    # Check if Google Sheets is available
    if sheets_tracker.client is None:
        print("❌ Google Sheets not available. Please set up credentials first.")
        print("📋 Steps:")
        print("1. Create Google Cloud Project")
        print("2. Enable Google Sheets API")
        print("3. Create service account")
        print("4. Download credentials.json to server/ folder")
        print("5. Create and share Google Sheet")
        return
    
    print(f"✅ Connected to Google Sheet: {sheets_tracker.get_sheet_url()}")
    
    # Migrate data
    success1 = migrate_behavior_tracking()
    success2 = migrate_chatwidget_qa()
    
    if success1 and success2:
        print("\n🎉 Migration completed successfully!")
        print(f"📊 View your data at: {sheets_tracker.get_sheet_url()}")
    else:
        print("\n⚠️  Migration completed with some errors. Check the output above.")

if __name__ == "__main__":
    main() 