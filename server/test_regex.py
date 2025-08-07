#!/usr/bin/env python3
"""
Test regex patterns to see if they match correctly
"""

import re

def test_regex_patterns():
    """Test the regex patterns used in the backend"""
    
    # Test message formats
    test_messages = [
        "Target User: admin, Task Description: forgot password",
        "Team Member: 2 devs, Project Timeline: 2 weeks. Use the previously generated user stories: Sample stories",
        "Please generate user stories and epics. Target User: admin, Task Description: forgot password. Format the response as markdown with proper user stories, epics, and acceptance criteria.",
        "Create sprint plan for Team Member: 2 devs, Project Timeline: 2 weeks. Use the previously generated user stories: Sample stories"
    ]
    
    for i, message in enumerate(test_messages):
        print(f"\n🔍 Testing message {i+1}: {message}")
        
        # Test target user extraction
        target_user_match = re.search(r'Target User:\s*([^,]+)', message)
        if target_user_match:
            print(f"✅ Target User found: '{target_user_match.group(1).strip()}'")
        else:
            print("❌ Target User not found")
        
        # Test task description extraction
        task_desc_match = re.search(r'Task Description:\s*([^,]+)', message)
        if task_desc_match:
            print(f"✅ Task Description found: '{task_desc_match.group(1).strip()}'")
        else:
            print("❌ Task Description not found")
        
        # Test team member extraction
        team_member_match = re.search(r'Team Member:\s*([^,]+)', message)
        if team_member_match:
            print(f"✅ Team Member found: '{team_member_match.group(1).strip()}'")
        else:
            print("❌ Team Member not found")
        
        # Test project timeline extraction
        project_timeline_match = re.search(r'Project Timeline:\s*([^,]+)', message)
        if project_timeline_match:
            print(f"✅ Project Timeline found: '{project_timeline_match.group(1).strip()}'")
        else:
            print("❌ Project Timeline not found")
        
        # Test if it's a sprint planning request
        is_sprint = 'Team Member:' in message and 'Project Timeline:' in message
        print(f"📊 Is Sprint Planning: {is_sprint}")

if __name__ == "__main__":
    print("🚀 Testing regex patterns...")
    test_regex_patterns()
    print("\n✅ Regex tests completed!") 