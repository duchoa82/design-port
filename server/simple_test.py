#!/usr/bin/env python3
"""
Simple test to see if tracking works at all
"""

import requests
import json

def simple_test():
    """Simple test with basic message"""
    print("🔍 Simple tracking test...")
    
    # Very simple test message
    test_data = {
        "message": "Target User: test, Task Description: test",
        "conversationId": "simple-test"
    }
    
    print(f"📤 Sending: {test_data['message']}")
    
    try:
        response = requests.post(
            'https://portfolio-ai-production-2766.up.railway.app/api/chat',
            headers={'Content-Type': 'application/json'},
            json=test_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API call successful")
            print(f"📊 Response: {data.get('lastMessage', {}).get('text', '')[:100]}...")
            return True
        else:
            print(f"❌ API call failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Simple tracking test...")
    success = simple_test()
    
    if success:
        print("\n✅ Simple test completed!")
        print("Now check if any new records were created...")
    else:
        print("\n❌ Simple test failed!") 