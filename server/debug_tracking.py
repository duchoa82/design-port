#!/usr/bin/env python3
"""
Debug tracking to see why it's not working
"""

import requests
import json

def test_exact_message_format():
    """Test with exact message format from frontend"""
    print("🔍 Testing exact message format...")
    
    # Test 1: User story generation (exact frontend format)
    test_data_1 = {
        "message": "Target User: admin, Task Description: forgot password",
        "conversationId": "debug-conv-001"
    }
    
    print(f"📤 Sending: {test_data_1['message']}")
    
    try:
        response = requests.post(
            'https://portfolio-ai-production-2766.up.railway.app/api/chat',
            headers={'Content-Type': 'application/json'},
            json=test_data_1
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ User story test successful")
            print(f"📊 Response length: {len(data.get('lastMessage', {}).get('text', ''))}")
        else:
            print(f"❌ User story test failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Sprint planning (exact frontend format)
    test_data_2 = {
        "message": "Team Member: 2 devs, Project Timeline: 2 weeks. Use the previously generated user stories: Sample stories",
        "conversationId": "debug-conv-002"
    }
    
    print(f"📤 Sending: {test_data_2['message']}")
    
    try:
        response = requests.post(
            'https://portfolio-ai-production-2766.up.railway.app/api/chat',
            headers={'Content-Type': 'application/json'},
            json=test_data_2
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Sprint planning test successful")
            print(f"📊 Response length: {len(data.get('lastMessage', {}).get('text', ''))}")
        else:
            print(f"❌ Sprint planning test failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Debugging tracking issues...")
    test_exact_message_format()
    print("\n✅ Debug tests completed!") 