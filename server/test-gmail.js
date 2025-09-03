// Test Gmail SMTP Configuration
import dotenv from 'dotenv';
import { testEmailConfiguration, sendTestEmail } from './email/gmail-notifier.js';

// Load environment variables
dotenv.config();

async function testGmail() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n');
  
  // Check environment variables
  console.log('📧 Email Configuration:');
  console.log(`   Gmail Email: ${process.env.ADMIN_EMAIL || 'duchoa201093@gmail.com'}`);
  console.log(`   App Password: ${process.env.GMAIL_APP_PASSWORD ? '***SET***' : 'NOT SET'}\n`);
  
  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Missing Gmail App Password!');
    console.log('\n🔧 Setup Instructions:');
    console.log('1. Go to Google Account Settings');
    console.log('2. Security → 2-Step Verification (enable if not already)');
    console.log('3. Security → App passwords');
    console.log('4. Generate app password for "Mail"');
    console.log('5. Copy the 16-character password');
    console.log('6. Add to .env: GMAIL_APP_PASSWORD=your-16-char-password');
    return;
  }
  
  try {
    // Test connection
    console.log('🔗 Testing Gmail SMTP connection...');
    const isValid = await testEmailConfiguration();
    
    if (isValid) {
      console.log('✅ Gmail SMTP connection successful!\n');
      
      // Send test email
      console.log('📧 Sending test email...');
      await sendTestEmail();
      console.log('✅ Test email sent successfully!');
      console.log('\n🎉 Gmail email system is ready for production!');
    } else {
      console.error('❌ Gmail SMTP connection failed!');
    }
    
  } catch (error) {
    console.error('❌ Gmail test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your Gmail App Password');
      console.log('2. Make sure 2-Step Verification is enabled');
      console.log('3. Ensure the app password is 16 characters long');
    }
  }
}

testGmail();
