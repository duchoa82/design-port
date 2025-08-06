import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserTracker {
  constructor() {
    this.csvPath = path.join(__dirname, '../public/user_behavior_tracking.csv');
    this.initializeCSV();
  }

  initializeCSV() {
    const headers = [
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
    ];

    if (!fs.existsSync(this.csvPath)) {
      const headerRow = headers.join(',') + '\n';
      fs.writeFileSync(this.csvPath, headerRow);
    }
  }

  generateUserId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}${random}`.slice(-6);
  }

  formatDateTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${hours}:${minutes} - ${day}${this.getMonthAbbr(month)}${year}`;
  }

  getMonthAbbr(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(month) - 1];
  }

  escapeCSVValue(value) {
    if (value === null || value === undefined || value === '') {
      return 'null';
    }
    // Escape quotes and wrap in quotes if contains comma or newline
    const escaped = value.toString().replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  }

  recordUserSession(sessionData) {
    const {
      startTime,
      endTime,
      playgroundConvoId,
      playgroundMessTarget,
      playgroundMessDescription,
      playgroundStep1,
      playgroundMessTeam,
      playgroundMessTimeline,
      playgroundStep2,
      chatBubble1,
      chatBubble2,
      chatBubble3,
      chatBubble4,
      chatBubbleFree
    } = sessionData;

    const userId = this.generateUserId();
    const startTimeFormatted = this.formatDateTime(startTime);
    const endTimeFormatted = this.formatDateTime(endTime);

    const row = [
      userId,
      startTimeFormatted,
      endTimeFormatted,
      this.escapeCSVValue(playgroundConvoId),
      this.escapeCSVValue(playgroundMessTarget),
      this.escapeCSVValue(playgroundMessDescription),
      this.escapeCSVValue(playgroundStep1),
      this.escapeCSVValue(playgroundMessTeam),
      this.escapeCSVValue(playgroundMessTimeline),
      this.escapeCSVValue(playgroundStep2),
      this.escapeCSVValue(chatBubble1),
      this.escapeCSVValue(chatBubble2),
      this.escapeCSVValue(chatBubble3),
      this.escapeCSVValue(chatBubble4),
      this.escapeCSVValue(chatBubbleFree)
    ];

    const csvRow = row.join(',') + '\n';
    
    try {
      fs.appendFileSync(this.csvPath, csvRow);
      console.log(`📊 User session recorded: ${userId}`);
      return userId;
    } catch (error) {
      console.error('Error recording user session:', error);
      return null;
    }
  }

  // Helper method to track individual interactions
  trackPlaygroundInteraction(conversationId, targetUser, taskDescription, teamMember, timeline) {
    return {
      playgroundConvoId: conversationId,
      playgroundMessTarget: targetUser,
      playgroundMessDescription: taskDescription,
      playgroundMessTeam: teamMember,
      playgroundMessTimeline: timeline
    };
  }

  trackChatBubbleInteraction(questionNumber, question) {
    return {
      [`chatBubble${questionNumber}`]: question
    };
  }
}

export default UserTracker; 