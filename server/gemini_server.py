import os
import re
import json
import csv
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8080", "http://localhost:8081", "https://*.netlify.app", "https://*.vercel.app"]}}, supports_credentials=True)

# Set your Gemini API key (use an environment variable for security)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or "AIzaSyBqR5BV68Jq4Rwi1ZGu9B0u3H7S4y-PB84"
genai.configure(api_key=GEMINI_API_KEY)

class UserTracker:
    def __init__(self):
        self.csv_path = '../public/user_behavior_tracking.csv'
        self.initialize_csv()
    
    def initialize_csv(self):
        headers = [
            'user-id',
            'start-time',
            'end-time',
            'playground-convo-id',
            'playground-mess-target',
            'playground-mess-description',
            'playground-step1',
            'playground-mess-team',
            'playground-mess-timeline',
            'playground-step2',
            'chat-bubble-1',
            'chat-bubble-2',
            'chat-bubble-3',
            'chat-bubble-4',
            'chat-bubble-free'
        ]
        
        # Create directory if it doesn't exist
        csv_dir = os.path.dirname(self.csv_path)
        if csv_dir and not os.path.exists(csv_dir):
            os.makedirs(csv_dir)
        
        if not os.path.exists(self.csv_path):
            with open(self.csv_path, 'w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                writer.writerow(headers)
    
    def generate_user_id(self):
        timestamp = int(datetime.now().timestamp() * 1000)
        random_num = hash(str(timestamp)) % 1000
        return f"{timestamp}{random_num}"[-6:]
    
    def format_date_time(self, date):
        hours = date.strftime('%H:%M')
        day = date.strftime('%d')
        month_abbr = date.strftime('%b')
        year = date.strftime('%y')
        return f"{hours} - {day}{month_abbr}{year}"
    
    def escape_csv_value(self, value):
        if value is None or value == '':
            return 'null'
        value_str = str(value)
        if ',' in value_str or '\n' in value_str or '"' in value_str:
            return f'"{value_str.replace('"', '""')}"'
        return value_str
    
    def record_user_session(self, session_data):
        try:
            user_id = self.generate_user_id()
            start_time = datetime.now()
            end_time = datetime.now()
            
            start_time_formatted = self.format_date_time(start_time)
            end_time_formatted = self.format_date_time(end_time)
            
            row = [
                user_id,
                start_time_formatted,
                end_time_formatted,
                self.escape_csv_value(session_data.get('playground_convo_id')),
                self.escape_csv_value(session_data.get('playground_mess_target')),
                self.escape_csv_value(session_data.get('playground_mess_description')),
                self.escape_csv_value(session_data.get('playground_step1')),
                self.escape_csv_value(session_data.get('playground_mess_team')),
                self.escape_csv_value(session_data.get('playground_mess_timeline')),
                self.escape_csv_value(session_data.get('playground_step2')),
                self.escape_csv_value(session_data.get('chat_bubble_1')),
                self.escape_csv_value(session_data.get('chat_bubble_2')),
                self.escape_csv_value(session_data.get('chat_bubble_3')),
                self.escape_csv_value(session_data.get('chat_bubble_4')),
                self.escape_csv_value(session_data.get('chat_bubble_free'))
            ]
            
            with open(self.csv_path, 'a', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                writer.writerow(row)
            
            print(f"📊 User session recorded: {user_id}")
            return user_id
        except Exception as e:
            print(f"Error recording user session: {e}")
            return None

# Initialize user tracker
user_tracker = UserTracker()

@app.route('/api/user-story', methods=['POST'])
def user_story():
    data = request.get_json()
    feature = data.get('feature', '')
    result = generate_user_story(feature)
    return jsonify({'userStory': result})

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = app.response_class()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    data = request.get_json()
    message = data.get('message', '')
    conversation_id = data.get('conversationId', 'conv-1')
    
    # Track user session
    session_data = {
        'playground_convo_id': conversation_id,
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
    task_desc_match = re.search(r'Task Description:\s*([^.]+)', message)
    
    if target_user_match and task_desc_match:
        target_user = target_user_match.group(1).strip()
        task_description = task_desc_match.group(1).strip()
        feature = f"{target_user} - {task_description}"
        
        # Update session data for user story generation
        session_data['playground_mess_target'] = target_user
        session_data['playground_mess_description'] = task_description
        session_data['playground_step1'] = 'Completed'
    else:
        feature = message
    
    # Check if it's a sprint planning request
    if 'Create sprint plan' in message:
        # Extract team member and project timeline from the message
        team_member_match = re.search(r'Team Member:\s*([^,]+)', message)
        project_timeline_match = re.search(r'Project Timeline:\s*([^,]+)', message)
        
        if team_member_match and project_timeline_match:
            team_member = team_member_match.group(1).strip()
            project_timeline = project_timeline_match.group(1).strip()
            
            # Update session data for sprint planning
            session_data['playground_mess_team'] = team_member
            session_data['playground_mess_timeline'] = project_timeline
            session_data['playground_step2'] = 'Completed'
            
            # Extract user stories from the message (they should be included in the message)
            user_stories_match = re.search(r'Use the previously generated user stories:\s*(.+)', message, re.DOTALL)
            user_stories_content = user_stories_match.group(1).strip() if user_stories_match else "Sample user stories for planning"
            
            sprint_result = generate_sprint_plan(team_member, project_timeline, user_stories_content)
            response_data = {
                'conversationId': conversation_id,
                'lastMessage': {
                    'text': sprint_result
                }
            }
        else:
            response_data = {
                'conversationId': conversation_id,
                'lastMessage': {
                    'text': 'Please provide Team Member and Project Timeline for sprint planning.'
                }
            }
    else:
        # Generate user stories
        print(f"🔍 Generating user stories for feature: {feature}")
        user_story_result = generate_user_story(feature)
        response_data = {
            'conversationId': conversation_id,
            'lastMessage': {
                'text': user_story_result
            }
        }
    
    # Record user session
    user_tracker.record_user_session(session_data)
    
    response = jsonify(response_data)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

def generate_user_story(feature):
    prompt = f"""
## Your Role:
You are a **Product Owner and Agile Business Analyst** with a strong understanding of user story mapping and stakeholder value. Based on user input: {feature}

Your task is to analyze this message from a stakeholder or user and generate structured epics and user stories accordingly.

---

### Workflow

1. Analyze the user input: "{feature}" to get the insight, and be ready to turn into user stories.
2. Break it down into Epics. 
3. For each user story, include **acceptance criteria (A/C)** using the Given/When/Then format. Separate the A/C into happy cases and negative cases for this Task Description as one of the A/C.
4. Always print the introduction and closing sentences 
5. Print the content following the output format only, nothing else.
---

### Output Format (Markdown)

There are **[X] Epics**, **[Y] User Stories**, and acceptance criteria cases based on your input.

#### Epic Format
```markdown
## Epic 1: [Function or Feature Name]
```
#### User Story Format
```markdown
## **User Story 1:**
As a **[role of target user]**, I want to **[do something - a kind of task description]**, so that **[desired benefit]**
```
#### Acceptance Criteria Format
```markdown
#### Acceptance Criteria (Happy Cases)
- **A/C 1:** Given [context], when [event occurs], then [expected outcome].
- **A/C 2:** Given [another context], when [event occurs], then [expected outcome].

#### Acceptance Criteria (Negative Cases)
- **A/C 1:** Given [context], when [event occurs], then [expected outcome].
- **A/C 2:** Given [another context], when [event occurs], then [expected outcome].
```
Repeat for Epics 2,...n

This result is generated with AI based on system thinking and user story training by Hoà Trương.

**STRICT FORMATTING RULES:**
- Generate result following the output format only, and nothing else.
- Do not add any additional explanations, comments, or content outside the specified format.
- **CRITICAL**: User stories must use the format "## **User Story X:**" with bold formatting.
- **CRITICAL**: Acceptance criteria must be separated into "#### Acceptance Criteria (Happy Cases)" and "#### Acceptance Criteria (Negative Cases)".
- **CRITICAL**: Each acceptance criteria must be on a separate line with proper bullet points (- **A/C X:**).
- **CRITICAL**: Follow the exact markdown structure provided above.
"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        generation_config = {
            "temperature": 1.0,
            "top_p": 0.95,
        }
        response = model.generate_content(prompt, generation_config=generation_config)
        result = response.text
        return result
    except Exception as e:
        return f"Error generating user story: {str(e)}"

def generate_sprint_plan(team_member, project_timeline, user_stories_content):
    prompt = f"""
### Role Definition
You are a **Product Owner and Agile Business Analyst**, an expert in making the sprint planning based on user input for {{Team_Member}}, User Stories, and {{Project_Timeline}}

---
**Your task:**
Your task is to analyze the {{User_Stories}} and with the {{Team_Member}}. You create the sprint plan based on the knowledge of Scrum and Agile methodology.

---

### Workflow

#### Step 1: Analyze the scope of work
Analyze the {{User_Stories}} and {{Team_Member}}, and {{Time_Line}} to define the scope of work for each team. Some scope of work requires a specific role, but if user input is lacking, please assume that we have at least one team member in charge for this.

#### Step 2: Process as a sprint
Based on the analysis of the scope of work for the team, gen the Sprint plan to ensure that it meets the timeline of the projects following the rule:

1. One Sprint always follows at least 1-2 weeks for a sprint
2. A Sprint always includes: 4 days for developing, 4 days for QC, and 2 days for fixing bugs. For the scope of Design, it should run before the sprint starts.
3. Key functions should be run first, and functions that block the other functions should be run first.

### Other Rule:
1. Print the output exactly the format below, and nothing else.
2. Merge more than one user story into one sprint if possible
3. Don't duplicate the user stories in output.

### Output Format (Markdown)
```markdown
## Sprint 1 (number of weeks)
```

#### User Story Included
```markdown
- **User Story 1:** As a [role], I want to [do something], so that [desired benefit]
- **User Story 2:** As a [role], I want to [do something], so that [desired benefit]
...
```

#### Team Allocation:
```markdown
- **BE:** their scope of work
- **FE:** their scope of work
- **QC:** their scope of work

repeat for sprint 2,..n
```

#### Summary of work:
```markdown
- **Development (days needed):**
(bullet points of dev work)
- **QC (days needed):**
(bullet points of QC work)
```

**CRITICAL:** Generate a SPRINT PLAN, not user stories. Use the user stories from the previous conversation to create the sprint plan.

Team Member: {team_member}
Project Timeline: {project_timeline}

**USER STORIES FROM PREVIOUS CONVERSATION:**
{user_stories_content}

**CRITICAL:** Use ALL of the user stories content above to create your sprint plan.

**IMPORTANT:** 
1. Start your response with: "This result is generated with AI based on system thinking and user story training by Hoà Trương."
2. Include an introduction showing the count of epics and user stories from the provided content.

**STRICT FORMATTING RULES:**
- Generate result following the output format only, and nothing else.
- Do not add any additional explanations, comments, or content outside the specified format.
- **CRITICAL**: User stories must be bullet points: `- **User Story X:**`
- **CRITICAL**: Team allocation must be bullet points: `- **BE:**`, `- **FE:**`, `- **QC:**`
- **CRITICAL**: Summary of work must be bullet points with proper indentation.
- **CRITICAL**: Follow the exact markdown structure provided above.
"""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        generation_config = {
            "temperature": 1.0,
            "top_p": 0.95,
        }
        response = model.generate_content(prompt, generation_config=generation_config)
        result = response.text
        return result
    except Exception as e:
        return f"Error generating sprint plan: {str(e)}"

if __name__ == '__main__':
    app.run(port=3001, debug=True) 