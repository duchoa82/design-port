#!/usr/bin/env python3
"""
Test tracking with correct template format
"""

import requests
import json

def test_user_story_tracking():
    """Test user story generation tracking"""
    print("🔍 Testing user story tracking...")
    
    # Test data following the template
    test_data = {
        "message": "Target User: admin, Task Description: forgot password",
        "conversationId": "test-conv-001"
    }
    
    try:
        response = requests.post(
            'https://portfolio-ai-production-2766.up.railway.app/api/chat',
            headers={'Content-Type': 'application/json'},
            json=test_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ User story tracking test successful")
            print(f"📊 Response: {data.get('lastMessage', {}).get('text', '')[:100]}...")
            return True
        else:
            print(f"❌ User story tracking test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing user story tracking: {e}")
        return False

def test_sprint_planning_tracking():
    """Test sprint planning tracking"""
    print("\n🔍 Testing sprint planning tracking...")
    
    # Test data following the template
    test_data = {
        "message": "Team Member: 2 devs, Project Timeline: 2 weeks. Use the previously generated user stories: Sample user stories",
        "conversationId": "test-conv-002"
    }
    
    try:
        response = requests.post(
            'https://portfolio-ai-production-2766.up.railway.app/api/chat',
            headers={'Content-Type': 'application/json'},
            json=test_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Sprint planning tracking test successful")
            print(f"📊 Response: {data.get('lastMessage', {}).get('text', '')[:100]}...")
            return True
        else:
            print(f"❌ Sprint planning tracking test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing sprint planning tracking: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing tracking with correct template format...")
    
    success1 = test_user_story_tracking()
    success2 = test_sprint_planning_tracking()
    
    if success1 and success2:
        print("\n🎉 All tracking tests passed!")
        print("✅ Your live site now follows the correct template format")
    else:
        print("\n⚠️  Some tracking tests failed. Check the errors above.") 