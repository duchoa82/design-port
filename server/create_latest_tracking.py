#!/usr/bin/env python3
"""
Create latest tracking data with current timestamp
"""

import csv
import os
from datetime import datetime

def create_latest_tracking_data():
    """Create latest user tracking data with current time"""
    csv_path = '../public/user_behavior_tracking.csv'
    
    # Get current time
    now = datetime.now()
    current_time = now.strftime("%H:%M - %d%b%y")
    
    # Latest realistic data with current timestamp
    latest_sessions = [
        {
            'user-id': 'user006',
            'start-time': current_time,
            'end-time': current_time,
            'playground-convo-id': 'conv_006',
            'playground-mess-target': 'Tech Lead',
            'playground-mess-description': 'Need senior developer for microservices architecture',
            'playground-step1': 'Completed',
            'playground-mess-team': 'Backend Team',
            'playground-mess-timeline': '3 months',
            'playground-step2': 'Technical Review',
            'chat-bubble-1': 'What is the current architecture?',
            'chat-bubble-2': 'Any specific performance requirements?',
            'chat-bubble-3': 'Deployment strategy?',
            'chat-bubble-4': 'Monitoring and logging needs?',
            'chat-bubble-free': 'I can help design a scalable microservices architecture'
        },
        {
            'user-id': 'user007',
            'start-time': current_time,
            'end-time': current_time,
            'playground-convo-id': 'conv_007',
            'playground-mess-target': 'Design Director',
            'playground-mess-description': 'Looking for UI/UX designer for mobile app redesign',
            'playground-step1': 'Completed',
            'playground-mess-team': 'Design Team',
            'playground-mess-timeline': '4 weeks',
            'playground-step2': 'Design Brief',
            'chat-bubble-1': 'What is the current app like?',
            'chat-bubble-2': 'Target user demographics?',
            'chat-bubble-3': 'Any brand guidelines?',
            'chat-bubble-4': 'Platform requirements?',
            'chat-bubble-free': 'I can create a modern, user-friendly mobile app design'
        },
        {
            'user-id': 'user008',
            'start-time': current_time,
            'end-time': current_time,
            'playground-convo-id': 'conv_008',
            'playground-mess-target': 'Operations Manager',
            'playground-mess-description': 'Need help with workflow automation system',
            'playground-step1': 'Completed',
            'playground-mess-team': 'Automation Team',
            'playground-mess-timeline': '6 weeks',
            'playground-step2': 'Requirements Gathering',
            'chat-bubble-1': 'What processes need automation?',
            'chat-bubble-2': 'Current tools being used?',
            'chat-bubble-3': 'Integration requirements?',
            'chat-bubble-4': 'ROI expectations?',
            'chat-bubble-free': 'I can analyze your workflows and suggest automation solutions'
        }
    ]
    
    # Check if CSV exists
    if not os.path.exists(csv_path):
        print("❌ CSV file not found. Please run tracking system first.")
        return
    
    try:
        # Read existing data to check headers
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            headers = reader.fieldnames
            
        print(f"✅ Found CSV with {len(headers)} columns")
        
        # Get current record count
        with open(csv_path, 'r', encoding='utf-8') as file:
            current_records = sum(1 for line in file) - 1
        
        print(f"📊 Current records: {current_records}")
        
        # Add new latest data
        with open(csv_path, 'a', encoding='utf-8', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=headers)
            
            for session in latest_sessions:
                writer.writerow(session)
                print(f"✅ Added latest session: {session['user-id']} - {session['playground-mess-target']}")
                print(f"   Time: {session['start-time']}")
        
        # Show updated count
        with open(csv_path, 'r', encoding='utf-8') as file:
            total_records = sum(1 for line in file) - 1
        
        print(f"\n🎉 Successfully added {len(latest_sessions)} latest tracking records!")
        print(f"📊 Total records now: {total_records}")
        print(f"🕒 All records created with current time: {current_time}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Creating Latest Tracking Data...")
    print("=" * 50)
    create_latest_tracking_data()
    print("\n💡 Next steps:")
    print("1. Run 'python3 check_latest_data.py' to verify latest data")
    print("2. Check the CSV file for newest records")
    print("3. Data is now up-to-date with current timestamp")

