#!/usr/bin/env python3
"""
Direct test of UserTracker to see if CSV writing works
"""

from gemini_server import user_tracker

def test_user_tracker():
    """Test UserTracker directly"""
    print("🔍 Testing UserTracker directly...")
    
    # Test session data
    test_session_data = {
        'playground_convo_id': 'direct-test',
        'playground_mess_target': 'test-user',
        'playground_mess_description': 'test-description',
        'playground_step1': 'Completed',
        'playground_mess_team': None,
        'playground_mess_timeline': None,
        'playground_step2': None,
        'chat_bubble_1': None,
        'chat_bubble_2': None,
        'chat_bubble_3': None,
        'chat_bubble_4': None,
        'chat_bubble_free': None
    }
    
    print(f"📊 Test session data: {test_session_data}")
    
    try:
        # Try to record directly
        result = user_tracker.record_user_session(test_session_data)
        print(f"✅ UserTracker.record_user_session() returned: {result}")
        
        # Check if file was updated
        import os
        csv_path = '../public/user_behavior_tracking.csv'
        if os.path.exists(csv_path):
            import csv
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                rows = list(reader)
                print(f"📊 CSV now has {len(rows)} records")
                
                if len(rows) > 0:
                    latest = rows[-1]
                    print(f"📅 Latest record: {latest}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing UserTracker: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Direct UserTracker test...")
    success = test_user_tracker()
    
    if success:
        print("\n✅ UserTracker test completed!")
    else:
        print("\n❌ UserTracker test failed!") 