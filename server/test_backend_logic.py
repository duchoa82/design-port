#!/usr/bin/env python3
"""
Test the exact backend logic to see where tracking fails
"""

import re

def simulate_backend_logic(message):
    """Simulate the exact backend logic"""
    print(f"🔍 Simulating backend logic for: {message}")
    
    # Initialize session data
    session_data = {
        'playground_convo_id': 'test-conv',
        'playground_mess_target': None,
        'playground_mess_description': None,
        'playground_step1': None,
        'playground_mess_team': None,
        'playground_mess_timeline': None,
        'playground_step2': None,
        'chat_bubble_1': None,
        'chat_bubble_2': None,
        'chat_bubble_3': None,
        'chat_bubble_4': None,
        'chat_bubble_free': None
    }
    
    # Extract target user and task description from the message
    target_user_match = re.search(r'Target User:\s*([^,]+)', message)
    task_desc_match = re.search(r'Task Description:\s*([^,]+)', message)
    
    print(f"📊 Target User match: {target_user_match is not None}")
    print(f"📊 Task Description match: {task_desc_match is not None}")
    
    if target_user_match and task_desc_match:
        target_user = target_user_match.group(1).strip()
        task_description = task_desc_match.group(1).strip()
        feature = f"{target_user} - {task_description}"
        
        print(f"✅ Extracted - Target: '{target_user}', Description: '{task_description}'")
        
        # Update session data for user story generation
        session_data['playground_mess_target'] = target_user
        session_data['playground_mess_description'] = task_description
        session_data['playground_step1'] = 'Completed'
        
        print("✅ Would call tracking for user story generation")
        return True, session_data
    else:
        feature = message
        print("❌ Would NOT call tracking - missing Target User or Task Description")
        return False, session_data
    
    # Check if it's a sprint planning request
    if 'Team Member:' in message and 'Project Timeline:' in message:
        print("✅ Would call tracking for sprint planning")
        return True, session_data

# Test different message formats
test_messages = [
    "Target User: admin, Task Description: forgot password",
    "Team Member: 2 devs, Project Timeline: 2 weeks. Use the previously generated user stories: Sample stories",
    "Target User: test, Task Description: test",
    "Just a random message without proper format"
]

for i, message in enumerate(test_messages):
    print(f"\n{'='*60}")
    print(f"Test {i+1}: {message}")
    print('='*60)
    
    would_track, session_data = simulate_backend_logic(message)
    
    if would_track:
        print(f"✅ This message WOULD trigger tracking")
        print(f"📊 Session data: {session_data}")
    else:
        print(f"❌ This message would NOT trigger tracking")

print(f"\n{'='*60}")
print("Backend logic simulation completed!")
print('='*60) 