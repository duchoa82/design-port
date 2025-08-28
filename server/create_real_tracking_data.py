#!/usr/bin/env python3
"""
Create realistic tracking data for testing
"""

import csv
import os
from datetime import datetime, timedelta
import random

def create_realistic_tracking_data():
    """Create realistic user tracking data"""
    csv_path = '../public/user_behavior_tracking.csv'
    
    # Sample realistic data
    realistic_sessions = [
        {
            'user-id': 'user001',
            'start-time': '14:30 - 07Aug25',
            'end-time': '14:45 - 07Aug25',
            'playground-convo-id': 'conv_001',
            'playground-mess-target': 'Marketing Manager',
            'playground-mess-description': 'Looking for a developer to build a customer portal',
            'playground-step1': 'Completed',
            'playground-mess-team': 'Frontend Team',
            'playground-mess-timeline': '2 weeks',
            'playground-step2': 'In Progress',
            'chat-bubble-1': 'What is your budget range?',
            'chat-bubble-2': 'Do you need mobile responsive?',
            'chat-bubble-3': 'Any specific tech stack preference?',
            'chat-bubble-4': 'When do you want to start?',
            'chat-bubble-free': 'Can you share more details about the project?'
        },
        {
            'user-id': 'user002',
            'start-time': '15:15 - 07Aug25',
            'end-time': '15:35 - 07Aug25',
            'playground-convo-id': 'conv_002',
            'playground-mess-target': 'Startup Founder',
            'playground-mess-description': 'Need help with MVP development for SaaS platform',
            'playground-step1': 'Completed',
            'playground-mess-team': 'Full Stack Team',
            'playground-mess-timeline': '1 month',
            'playground-step2': 'Completed',
            'chat-bubble-1': 'What features are essential for MVP?',
            'chat-bubble-2': 'Do you have user research data?',
            'chat-bubble-3': 'What is your target market?',
            'chat-bubble-4': 'Any existing design mockups?',
            'chat-bubble-free': 'I can help you prioritize features for launch'
        },
        {
            'user-id': 'user003',
            'start-time': '16:00 - 07Aug25',
            'end-time': '16:20 - 07Aug25',
            'playground-convo-id': 'conv_003',
            'playground-mess-target': 'Product Manager',
            'playground-mess-description': 'Seeking developer for e-commerce platform redesign',
            'playground-step1': 'Completed',
            'playground-mess-team': 'UI/UX Team',
            'playground-mess-timeline': '3 weeks',
            'playground-step2': 'Planning',
            'chat-bubble-1': 'What is the current platform?',
            'chat-bubble-2': 'Any specific pain points?',
            'chat-bubble-3': 'Target conversion improvement?',
            'chat-bubble-4': 'Mobile app needed?',
            'chat-bubble-free': 'I can analyze your current platform and suggest improvements'
        },
        {
            'user-id': 'user004',
            'start-time': '16:45 - 07Aug25',
            'end-time': '17:05 - 07Aug25',
            'playground-convo-id': 'conv_004',
            'playground-mess-target': 'HR Director',
            'playground-mess-description': 'Looking for full-time React developer',
            'playground-step1': 'Completed',
            'playground-mess-team': 'Engineering Team',
            'playground-mess-timeline': 'Immediate',
            'playground-step2': 'Interview Scheduled',
            'chat-bubble-1': 'What is the company size?',
            'chat-bubble-2': 'Remote work available?',
            'chat-bubble-3': 'Tech stack details?',
            'chat-bubble-4': 'Salary range?',
            'chat-bubble-free': 'I am interested in the position and available for interview'
        },
        {
            'user-id': 'user005',
            'start-time': '17:30 - 07Aug25',
            'end-time': '17:50 - 07Aug25',
            'playground-convo-id': 'conv_005',
            'playground-mess-target': 'Agency Owner',
            'playground-mess-description': 'Need developer for client project - CMS development',
            'playground-step1': 'Completed',
            'playground-mess-team': 'Backend Team',
            'playground-mess-timeline': '2 months',
            'playground-step2': 'Proposal Sent',
            'chat-bubble-1': 'What CMS platform?',
            'chat-bubble-2': 'Custom features needed?',
            'chat-bubble-3': 'Integration requirements?',
            'chat-bubble-4': 'Maintenance included?',
            'chat-bubble-free': 'I can provide a detailed proposal with timeline and cost'
        }
    ]
    
    # Check if CSV exists and has headers
    if not os.path.exists(csv_path):
        print("❌ CSV file not found. Please run tracking system first.")
        return
    
    # Read existing data to check headers
    try:
        with open(csv_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            headers = reader.fieldnames
            
        print(f"✅ Found CSV with {len(headers)} columns")
        print(f"📊 Current records: {sum(1 for line in open(csv_path)) - 1}")
        
        # Add new realistic data
        with open(csv_path, 'a', encoding='utf-8', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=headers)
            
            for session in realistic_sessions:
                writer.writerow(session)
                print(f"✅ Added session: {session['user-id']} - {session['playground-mess-target']}")
        
        print(f"\n🎉 Successfully added {len(realistic_sessions)} realistic tracking records!")
        
        # Show updated count
        with open(csv_path, 'r', encoding='utf-8') as file:
            total_records = sum(1 for line in file) - 1
        print(f"📊 Total records now: {total_records}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Creating Realistic Tracking Data...")
    print("=" * 50)
    create_realistic_tracking_data()
    print("\n💡 Next steps:")
    print("1. Run 'python3 check_latest_data.py' to verify")
    print("2. Check the CSV file for new data")
    print("3. Start your tracking server for real-time data")
