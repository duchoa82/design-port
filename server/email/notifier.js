// Email Notification System with SendGrid
import sgMail from '@sendgrid/mail';

// SendGrid configuration
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key');

// Email templates
const templates = {
  tokenRequest: (data) => ({
    to: process.env.ADMIN_EMAIL || 'admin@example.com',
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    subject: '🚨 New Token Request - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc3545; margin: 0;">New Token Request</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
          <h3 style="color: #495057; margin-top: 0;">Request Details:</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Request ID:</td>
              <td style="padding: 8px 0; font-family: monospace; color: #6c757d;">${data.requestId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">User Email:</td>
              <td style="padding: 8px 0; color: #495057;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Fingerprint:</td>
              <td style="padding: 8px 0; font-family: monospace; color: #6c757d; word-break: break-all;">${data.fingerprint}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Reason:</td>
              <td style="padding: 8px 0; color: #495057;">${data.reason}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Requested At:</td>
              <td style="padding: 8px 0; color: #495057;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 5px;">
            <p style="margin: 0; color: #1976d2;">
              <strong>Action Required:</strong> Please review this request in the admin dashboard and approve or reject it.
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="${process.env.ADMIN_URL || 'http://localhost:3001/admin'}" 
               style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Admin Dashboard
            </a>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>This is an automated notification from your Token Management System.</p>
        </div>
      </div>
    `
  }),
  
  tokenApproval: (data) => ({
    to: process.env.ADMIN_EMAIL || 'admin@example.com',
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    subject: '✅ Token Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #155724; margin: 0;">Token Request Approved</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #c3e6cb; border-radius: 8px;">
          <h3 style="color: #495057; margin-top: 0;">Approval Details:</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Request ID:</td>
              <td style="padding: 8px 0; font-family: monospace; color: #6c757d;">${data.requestId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">User Fingerprint:</td>
              <td style="padding: 8px 0; font-family: monospace; color: #6c757d; word-break: break-all;">${data.fingerprint}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Approved By:</td>
              <td style="padding: 8px 0; color: #495057;">${data.approvedBy}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Approved At:</td>
              <td style="padding: 8px 0; color: #495057;">${new Date().toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Tokens Added:</td>
              <td style="padding: 8px 0; color: #28a745; font-weight: bold;">+4 tokens</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 5px;">
            <p style="margin: 0; color: #0c5460;">
              <strong>Note:</strong> The user has been granted 4 additional tokens and can now use the AI features again.
            </p>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>This is an automated notification from your Token Management System.</p>
        </div>
      </div>
    `
  })
};

// Send token request notification
export async function sendTokenRequestNotification(data) {
  try {
    const template = templates.tokenRequest(data);
    
    const result = await sgMail.send(template);
    console.log('✅ Token request notification sent:', result[0].statusCode);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to send token request notification:', error);
    throw error;
  }
}

// Send token approval notification
export async function sendTokenApprovalNotification(data) {
  try {
    const template = templates.tokenApproval(data);
    
    const result = await sgMail.send(template);
    console.log('✅ Token approval notification sent:', result[0].statusCode);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to send token approval notification:', error);
    throw error;
  }
}

// Test email configuration
export async function testEmailConfiguration() {
  try {
    // Test with a simple email
    const testEmail = {
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      subject: '🧪 Test Email - SendGrid Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1976d2; margin: 0;">SendGrid Test Successful!</h2>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <p style="color: #495057; margin: 0;">
              This is a test email from your Token Management System using SendGrid. 
              If you receive this, your email configuration is working correctly!
            </p>
            
            <div style="margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 5px;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ SendGrid Status:</strong> Ready for production
              </p>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
            <p>Sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };
    
    const result = await sgMail.send(testEmail);
    console.log('✅ SendGrid configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ SendGrid configuration is invalid:', error);
    return false;
  }
}

// Send test email
export async function sendTestEmail() {
  try {
    const testEmail = {
      to: process.env.ADMIN_EMAIL || 'admin@example.com',
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      subject: '🧪 Test Email - Token System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1976d2; margin: 0;">Test Email Successful!</h2>
          </div>
          
          <div style="background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <p style="color: #495057; margin: 0;">
              This is a test email from your Token Management System using SendGrid. 
              If you receive this, your email configuration is working correctly!
            </p>
            
            <div style="margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 5px;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ Email System Status:</strong> Ready for production
              </p>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
            <p>Sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };
    
    const result = await sgMail.send(testEmail);
    console.log('✅ Test email sent successfully:', result[0].statusCode);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
    throw error;
  }
}