import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebAnalyzerStorage {
  constructor() {
    this.storagePath = path.join(__dirname, '../public/web-analyzer-history.json');
    this.rateLimitPath = path.join(__dirname, '../public/web-analyzer-rate-limit.json');
    this.initializeStorage();
  }

  initializeStorage() {
    // Initialize history storage
    if (!fs.existsSync(this.storagePath)) {
      fs.writeFileSync(this.storagePath, JSON.stringify([]));
    }

    // Initialize rate limit storage
    if (!fs.existsSync(this.rateLimitPath)) {
      fs.writeFileSync(this.rateLimitPath, JSON.stringify({}));
    }
  }

  // Rate limiting: 1 analyze per user per day
  canAnalyze(userId) {
    try {
      const rateLimitData = JSON.parse(fs.readFileSync(this.rateLimitPath, 'utf8'));
      const today = new Date().toDateString();
      
      if (rateLimitData[userId] === today) {
        return false; // Already used today
      }
      
      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error
    }
  }

  recordAnalysis(userId) {
    try {
      const rateLimitData = JSON.parse(fs.readFileSync(this.rateLimitPath, 'utf8'));
      const today = new Date().toDateString();
      
      rateLimitData[userId] = today;
      fs.writeFileSync(this.rateLimitPath, JSON.stringify(rateLimitData));
    } catch (error) {
      console.error('Rate limit record error:', error);
    }
  }

  saveAnalysis(userId, url, analysis, crawlData) {
    try {
      const history = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
      
      const newEntry = {
        id: Date.now().toString(),
        userId,
        url,
        analysis,
        metaData: crawlData.metaData,
        timestamp: new Date().toISOString()
      };

      history.unshift(newEntry); // Add to beginning
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history.splice(100);
      }

      fs.writeFileSync(this.storagePath, JSON.stringify(history, null, 2));
      return newEntry;
    } catch (error) {
      console.error('Save analysis error:', error);
      throw new Error('Failed to save analysis');
    }
  }

  getHistory(userId, limit = 10) {
    try {
      const history = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
      return history
        .filter(entry => entry.userId === userId)
        .slice(0, limit);
    } catch (error) {
      console.error('Get history error:', error);
      return [];
    }
  }
}

export default WebAnalyzerStorage;
