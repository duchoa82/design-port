// Test Email Configuration
import dotenv from 'dotenv';
import { testEmailConfiguration, sendTestEmail } from './email/notifier.js';

// Load environment variables
dotenv.config();

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📧 Email Configuration:');
  console.log(`   SendGrid API Key: ${process.env.SENDGRID_API_KEY ? '***SET***' : 'NOT SET'}`);
  console.log(`   Admin Email: ${process.env.ADMIN_EMAIL || 'NOT SET'}`);
  console.log(`   From Email: ${process.env.EMAIL_FROM || 'NOT SET'}\n`);
  
  if (!process.env.SENDGRID_API_KEY || !process.env.ADMIN_EMAIL) {
    console.error('❌ Missing email configuration!');
    console.log('\n🔧 Setup Instructions:');
    console.log('1. Copy env.example to .env');
    console.log('2. Get SendGrid API key from https://sendgrid.com/');
    console.log('3. Update SENDGRID_API_KEY with your API key');
    console.log('4. Update ADMIN_EMAIL with your email address');
    console.log('5. Update EMAIL_FROM with your sender email');
    return;
  }
  
  try {
    // Test connection
    console.log('🔗 Testing SendGrid connection...');
    const isValid = await testEmailConfiguration();
    
    if (isValid) {
      console.log('✅ SendGrid connection successful!\n');
      
      // Send test email
      console.log('📧 Sending test email...');
      await sendTestEmail();
      console.log('✅ Test email sent successfully!');
      console.log('\n🎉 Email system is ready for production!');
    } else {
      console.error('❌ SendGrid connection failed!');
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Unauthorized')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your SendGrid API key');
      console.log('2. Make sure the API key has "Full Access" permissions');
      console.log('3. Verify your SendGrid account is active');
    }
  }
}

testEmail();