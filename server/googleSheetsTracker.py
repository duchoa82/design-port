import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime
import os

class GoogleSheetsTracker:
    def __init__(self):
        # Google Sheets API setup
        self.scope = [
            'https://spreadsheets.google.com/feeds',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
        
        # Path to your credentials file (you'll need to add this)
        self.credentials_path = 'credentials.json'
        
        # Initialize the tracker
        self.client = None
        self.sheet = None
        self.initialize_sheets()
    
    def initialize_sheets(self):
        """Initialize Google Sheets connection"""
        try:
            if os.path.exists(self.credentials_path):
                creds = Credentials.from_service_account_file(
                    self.credentials_path, 
                    scopes=self.scope
                )
                self.client = gspread.authorize(creds)
                
                # Open the spreadsheet using direct sheet ID
                sheet_id = '1d_0rWHNf5p7-63kmLqbFeFq5BiWOo3pTplmt5rX5dxU'
                self.sheet = self.client.open_by_key(sheet_id)
                
                # Get the first worksheet
                self.worksheet = self.sheet.get_worksheet(0)
                
                # Set up headers if sheet is empty
                if not self.worksheet.get_all_values():
                    self.setup_headers()
                
                print(f"✅ Google Sheets connected: {self.sheet.url}")
                
            else:
                print("⚠️  credentials.json not found. Using fallback CSV tracking.")
                self.client = None
                
        except Exception as e:
            print(f"❌ Error initializing Google Sheets: {e}")
            self.client = None
    
    def setup_headers(self):
        """Set up the headers for the tracking sheet"""
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
        
        self.worksheet.append_row(headers)
        print("📋 Headers set up in Google Sheet")
    
    def generate_user_id(self):
        """Generate a unique user ID"""
        timestamp = int(datetime.now().timestamp() * 1000)
        random_num = hash(str(timestamp)) % 1000
        return f"{timestamp}{random_num}"[-6:]
    
    def format_date_time(self, date):
        """Format datetime for display"""
        hours = date.strftime('%H:%M')
        day = date.strftime('%d')
        month_abbr = date.strftime('%b')
        year = date.strftime('%y')
        return f"{hours} - {day}{month_abbr}{year}"
    
    def escape_value(self, value):
        """Escape and format values for Google Sheets"""
        if value is None or value == '':
            return ''
        
        # Convert to string and handle special characters
        value_str = str(value)
        
        # Truncate very long values to avoid Google Sheets limits
        if len(value_str) > 50000:  # Google Sheets cell limit is ~50k characters
            value_str = value_str[:50000] + "... [truncated]"
        
        return value_str
    
    def record_user_session(self, session_data):
        """Record user session to Google Sheets"""
        try:
            if self.client is None:
                print("⚠️  Google Sheets not available, skipping recording")
                return None
            
            user_id = self.generate_user_id()
            start_time = datetime.now()
            end_time = datetime.now()
            
            start_time_formatted = self.format_date_time(start_time)
            end_time_formatted = self.format_date_time(end_time)
            
            # Prepare row data
            row = [
                user_id,
                start_time_formatted,
                end_time_formatted,
                self.escape_value(session_data.get('playground_convo_id')),
                self.escape_value(session_data.get('playground_mess_target')),
                self.escape_value(session_data.get('playground_mess_description')),
                self.escape_value(session_data.get('playground_step1')),
                self.escape_value(session_data.get('playground_mess_team')),
                self.escape_value(session_data.get('playground_mess_timeline')),
                self.escape_value(session_data.get('playground_step2')),
                self.escape_value(session_data.get('chat_bubble_1')),
                self.escape_value(session_data.get('chat_bubble_2')),
                self.escape_value(session_data.get('chat_bubble_3')),
                self.escape_value(session_data.get('chat_bubble_4')),
                self.escape_value(session_data.get('chat_bubble_free'))
            ]
            
            # Append to Google Sheet
            self.worksheet.append_row(row)
            
            print(f"📊 User session recorded to Google Sheets: {user_id}")
            return user_id
            
        except Exception as e:
            print(f"❌ Error recording to Google Sheets: {e}")
            return None
    
    def get_sheet_url(self):
        """Get the URL of the tracking sheet"""
        if self.sheet:
            return self.sheet.url
        return None
    
    def get_recent_data(self, limit=10):
        """Get recent data from the sheet"""
        try:
            if self.client is None:
                return []
            
            all_values = self.worksheet.get_all_values()
            if len(all_values) <= 1:  # Only headers
                return []
            
            # Get data rows (skip header)
            data_rows = all_values[1:]
            
            # Get the last 'limit' rows
            recent_rows = data_rows[-limit:] if len(data_rows) > limit else data_rows
            
            # Convert to list of dictionaries
            headers = all_values[0]
            recent_data = []
            
            for row in recent_rows:
                # Pad row if it's shorter than headers
                while len(row) < len(headers):
                    row.append('')
                
                # Create dictionary
                row_dict = dict(zip(headers, row))
                recent_data.append(row_dict)
            
            return recent_data
            
        except Exception as e:
            print(f"❌ Error getting recent data: {e}")
            return []
    
    def get_statistics(self):
        """Get statistics from the tracking data"""
        try:
            if self.client is None:
                return {
                    'total_sessions': 0,
                    'chat_interactions': 0,
                    'playground_interactions': 0
                }
            
            all_values = self.worksheet.get_all_values()
            if len(all_values) <= 1:  # Only headers
                return {
                    'total_sessions': 0,
                    'chat_interactions': 0,
                    'playground_interactions': 0
                }
            
            # Get data rows (skip header)
            data_rows = all_values[1:]
            total_sessions = len(data_rows)
            
            # Count interactions
            chat_interactions = 0
            playground_interactions = 0
            
            for row in data_rows:
                # Check for chat interactions
                if any(row[i] for i in range(10, 15) if i < len(row)):  # chat-bubble columns
                    chat_interactions += 1
                
                # Check for playground interactions
                if len(row) > 3 and row[3]:  # playground-convo-id
                    playground_interactions += 1
            
            return {
                'total_sessions': total_sessions,
                'chat_interactions': chat_interactions,
                'playground_interactions': playground_interactions
            }
            
        except Exception as e:
            print(f"❌ Error getting statistics: {e}")
            return {
                'total_sessions': 0,
                'chat_interactions': 0,
                'playground_interactions': 0
            }

# Create global instance
sheets_tracker = GoogleSheetsTracker() 