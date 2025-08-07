import os
import re
import json
import csv
from datetime import datetime
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import google.generativeai as genai
from googleSheetsTracker import sheets_tracker

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
            escaped_value = value_str.replace('"', '""')
            return f'"{escaped_value}"'
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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Server is running with tracking fixes v2'})

@app.route('/test-simple', methods=['GET'])
def test_simple():
    """Simple test to verify Railway can write files"""
    try:
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Try to write a simple test
        with open('simple_test.log', 'a') as f:
            f.write(f"Simple test at: {timestamp}\n")
        
        return jsonify({
            'status': 'success',
            'message': f'Simple test successful at {timestamp}',
            'railway_working': True
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Simple test failed: {str(e)}',
            'railway_working': False
        })

@app.route('/check-log', methods=['GET'])
def check_log():
    """Check the user interactions log"""
    try:
        if os.path.exists('user_interactions.log'):
            with open('user_interactions.log', 'r') as f:
                content = f.read()
            return jsonify({
                'status': 'success',
                'log_exists': True,
                'content': content,
                'lines': len(content.split('\n')) if content else 0
            })
        else:
            return jsonify({
                'status': 'success',
                'log_exists': False,
                'content': '',
                'lines': 0
            })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Check log failed: {str(e)}'
        })

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """Get visitor analytics from the log"""
    try:
        if not os.path.exists('user_interactions.log'):
            return jsonify({
                'status': 'success',
                'total_interactions': 0,
                'unique_visitors': 0,
                'visitor_details': [],
                'interaction_types': {'user_stories': 0, 'sprint_planning': 0}
            })
        
        with open('user_interactions.log', 'r') as f:
            lines = f.readlines()
        
        # Parse log entries
        visitors = set()
        user_stories = 0
        sprint_planning = 0
        visitor_details = []
        
        for line in lines:
            if line.strip():
                parts = line.strip().split(' | ')
                if len(parts) >= 3:
                    timestamp = parts[0]
                    visitor_info = parts[1]
                    action_info = parts[2]
                    
                    # Extract visitor ID
                    if 'Visitor:' in visitor_info:
                        visitor_id = visitor_info.split('Visitor:')[1].strip()
                        visitors.add(visitor_id)
                        
                        # Count interaction types
                        if 'User Story:' in action_info:
                            user_stories += 1
                        elif 'Sprint:' in action_info:
                            sprint_planning += 1
                        
                        # Add to visitor details
                        visitor_details.append({
                            'timestamp': timestamp,
                            'visitor_id': visitor_id,
                            'action': 'User Story' if 'User Story:' in action_info else 'Sprint Planning'
                        })
        
        return jsonify({
            'status': 'success',
            'total_interactions': len(lines),
            'unique_visitors': len(visitors),
            'visitor_details': visitor_details,
            'interaction_types': {
                'user_stories': user_stories,
                'sprint_planning': sprint_planning
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Analytics failed: {str(e)}'
        })

@app.route('/api/tracking-data', methods=['GET'])
def get_tracking_data():
    """Private endpoint to view user tracking data"""
    try:
        if os.path.exists(user_tracker.csv_path):
            with open(user_tracker.csv_path, 'r', encoding='utf-8') as file:
                data = file.read()
            return Response(data, mimetype='text/csv', headers={'Content-Disposition': 'attachment; filename=user_behavior_tracking.csv'})
        else:
            return jsonify({'error': 'Tracking file not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    """Admin dashboard to view and export data"""
    try:
        # Try to get data from Google Sheets first
        stats = sheets_tracker.get_statistics()
        recent_activity = sheets_tracker.get_recent_data(10)
        sheet_url = sheets_tracker.get_sheet_url()
        
        # Fallback to CSV if Google Sheets is not available
        if stats['total_sessions'] == 0:
            tracking_data = []
            if os.path.exists(user_tracker.csv_path):
                with open(user_tracker.csv_path, 'r', encoding='utf-8') as file:
                    import csv
                    reader = csv.DictReader(file)
                    tracking_data = list(reader)
            
            total_sessions = len(tracking_data)
            chat_interactions = sum(1 for row in tracking_data if any(row.get(f'chat-bubble-{i}') for i in range(1, 5)) or row.get('chat-bubble-free'))
            playground_interactions = sum(1 for row in tracking_data if row.get('playground-convo-id'))
            
            stats = {
                'total_sessions': total_sessions,
                'chat_interactions': chat_interactions,
                'playground_interactions': playground_interactions
            }
            recent_activity = tracking_data[-10:] if tracking_data else []
        
        return jsonify({
            'stats': stats,
            'recent_activity': recent_activity,
            'download_url': '/api/tracking-data',
            'sheet_url': sheet_url
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/export/<format>', methods=['GET'])
def export_data(format):
    """Export data in different formats"""
    try:
        if not os.path.exists(user_tracker.csv_path):
            return jsonify({'error': 'No data available'}), 404
        
        if format == 'csv':
            with open(user_tracker.csv_path, 'r', encoding='utf-8') as file:
                data = file.read()
            return Response(data, mimetype='text/csv', 
                          headers={'Content-Disposition': 'attachment; filename=user_behavior_tracking.csv'})
        
        elif format == 'json':
            import csv
            import json
            data = []
            with open(user_tracker.csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                data = list(reader)
            return jsonify(data)
        
        else:
            return jsonify({'error': 'Unsupported format. Use csv or json'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
    task_desc_match = re.search(r'Task Description:\s*([^,]+)', message)
    
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
    if 'Team Member:' in message and 'Project Timeline:' in message:
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
            
            # Enhanced tracking with visitor analytics
            try:
                from datetime import datetime
                import hashlib
                
                # Get visitor IP (with fallback for Railway)
                visitor_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
                if visitor_ip and ',' in visitor_ip:
                    visitor_ip = visitor_ip.split(',')[0].strip()
                
                # Create visitor ID from IP (hashed for privacy)
                visitor_id = hashlib.md5(visitor_ip.encode()).hexdigest()[:8] if visitor_ip else 'unknown'
                
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                log_entry = f"{timestamp} | Visitor:{visitor_id} | IP:{visitor_ip} | Sprint: {session_data.get('playground_mess_team', 'unknown')} - {session_data.get('playground_mess_timeline', 'unknown')}\n"
                
                with open('user_interactions.log', 'a') as f:
                    f.write(log_entry)
                print(f"✅ Enhanced tracking: {log_entry.strip()}")
            except Exception as e:
                print(f"❌ Enhanced tracking failed: {e}")
        else:
            response_data = {
                'conversationId': conversation_id,
                'lastMessage': {
                    'text': 'Please provide Team Member and Project Timeline for sprint planning.'
                }
            }
    elif target_user_match and task_desc_match:
        # Generate user stories
        print(f"🔍 Generating user stories for feature: {feature}")
        user_story_result = generate_user_story(feature)
        response_data = {
            'conversationId': conversation_id,
            'lastMessage': {
                'text': user_story_result
            }
        }
    
        # Enhanced tracking with visitor analytics
        try:
            from datetime import datetime
            import hashlib
            
            # Get visitor IP (with fallback for Railway)
            visitor_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
            if visitor_ip and ',' in visitor_ip:
                visitor_ip = visitor_ip.split(',')[0].strip()
            
            # Create visitor ID from IP (hashed for privacy)
            visitor_id = hashlib.md5(visitor_ip.encode()).hexdigest()[:8] if visitor_ip else 'unknown'
            
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            log_entry = f"{timestamp} | Visitor:{visitor_id} | IP:{visitor_ip} | User Story: {session_data.get('playground_mess_target', 'unknown')} - {session_data.get('playground_mess_description', 'unknown')}\n"
            
            with open('user_interactions.log', 'a') as f:
                f.write(log_entry)
            print(f"✅ Enhanced tracking: {log_entry.strip()}")
        except Exception as e:
            print(f"❌ Enhanced tracking failed: {e}")
    else:
        # Fallback for other messages
        response_data = {
            'conversationId': conversation_id,
            'lastMessage': {
                'text': 'Please provide Target User and Task Description for user story generation, or Team Member and Project Timeline for sprint planning.'
            }
        }
    
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
    port = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=False) 