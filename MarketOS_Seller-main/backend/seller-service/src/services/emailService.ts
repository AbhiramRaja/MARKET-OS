import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'market.os.123@gmail.com',
    pass: (process.env.GMAIL_APP_PASSWORD || 'xuekjrgvhcqwrnmt').replace(/\s/g, '') // Remove spaces
  }
})

export async function sendAdminVerificationEmail(sellerData: any) {
  const approveUrl = `http://localhost:5173/admin/verify-seller/${sellerData.sellerId}?action=approve`
  const rejectUrl = `http://localhost:5173/admin/verify-seller/${sellerData.sellerId}?action=reject`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">🔔 New Seller Verification Request</h2>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #1f2937;">Seller Details:</h3>
        <p><strong>Business Name:</strong> ${sellerData.businessName}</p>
        <p><strong>Seller ID:</strong> ${sellerData.sellerId}</p>
        <p><strong>Email:</strong> ${sellerData.email}</p>
      </div>

      <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #92400e;">📄 Documents Submitted:</h3>
        <ul>
          ${sellerData.documents.map((d: any) => 
            `<li>${d.name}: ${d.uploaded ? '✅ Uploaded' : '❌ Missing'}</li>`
          ).join('')}
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${approveUrl}" 
           style="background: #10b981; color: white; padding: 15px 30px; text-decoration: none; 
                  border-radius: 8px; margin: 10px; display: inline-block; font-weight: bold;">
          ✅ APPROVE SELLER
        </a>
        
        <a href="${rejectUrl}" 
           style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; 
                  border-radius: 8px; margin: 10px; display: inline-block; font-weight: bold;">
          ❌ REJECT SELLER
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        Or review in admin portal: 
        <a href="http://localhost:5173/admin/pending-verifications" style="color: #7c3aed; font-weight: bold;">View All Pending Requests</a>
      </p>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: '"MarketOS Admin" <market.os.123@gmail.com>',
      to: 'market.os.123@gmail.com',
      subject: `🔔 New Seller: ${sellerData.businessName} - Verification Required`,
      html: emailContent
    })
    console.log('✅ Email sent successfully to market.os.123@gmail.com')
    console.log('📧 Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error response:', error.response)
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('\n🔧 FIX: Gmail authentication failed!')
      console.error('1. Go to: https://myaccount.google.com/apppasswords')
      console.error('2. Sign in with market.os.123@gmail.com')
      console.error('3. Generate new app password for "Mail"')
      console.error('4. Update .env file with new password\n')
    }
    
    return { success: false, error: error.message }
  }
}

export async function sendSellerApprovalEmail(sellerData: any) {
  const loginUrl = `http://localhost:5176/`
  const dashboardUrl = `http://localhost:5176/dashboard`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 15px;">
      <div style="background: white; padding: 40px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; font-size: 36px; margin: 0;">🎉 Congratulations!</h1>
          <h2 style="color: #1f2937; margin-top: 10px;">Your Seller Account is Approved!</h2>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
          <p style="color: #166534; margin: 0; font-size: 16px;">
            <strong>Great news, ${sellerData.ownerFirstName || 'Seller'}!</strong> 
            Your seller account for <strong>${sellerData.businessName}</strong> has been approved by our admin team.
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📋 Account Details:</h3>
          <p><strong>Business Name:</strong> ${sellerData.businessName}</p>
          <p><strong>Seller ID:</strong> ${sellerData.sellerId}</p>
          <p><strong>Email:</strong> ${sellerData.email}</p>
          <p><strong>Phone:</strong> ${sellerData.phone || 'N/A'}</p>
          <p><strong>Category:</strong> ${sellerData.category || 'N/A'}</p>
        </div>

        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">🚀 Next Steps:</h3>
          <ol style="color: #1f2937; line-height: 1.8;">
            <li>Login to your seller dashboard</li>
            <li>Complete your profile information</li>
            <li>Add your first products</li>
            <li>Start receiving orders!</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                    color: white; padding: 18px 40px; text-decoration: none; 
                    border-radius: 10px; display: inline-block; font-weight: bold; 
                    font-size: 16px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
            🎯 Access Your Dashboard
          </a>
        </div>

        <div style="border-top: 2px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            <strong>Need help getting started?</strong><br>
            Visit our <a href="${loginUrl}" style="color: #7c3aed;">Seller Guide</a> or 
            contact support at market.os.123@gmail.com
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated email from MarketOS Seller Portal.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: '"MarketOS - Seller Success Team" <market.os.123@gmail.com>',
      to: sellerData.email,
      subject: `🎉 Congratulations! Your ${sellerData.businessName} account is approved!`,
      html: emailContent
    })
    console.log(`✅ Approval email sent successfully to ${sellerData.email}`)
    console.log('📧 Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Approval email failed:', error.message)
    return { success: false, error: error.message }
  }
}

export async function sendSellerRejectionEmail(sellerData: any, reason?: string) {
  const contactUrl = `http://localhost:5176/contact`
  const reapplyUrl = `http://localhost:5176/signup`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f87171 0%, #dc2626 100%); padding: 40px; border-radius: 15px;">
      <div style="background: white; padding: 40px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; font-size: 32px; margin: 0;">⚠️ Application Update</h1>
          <h2 style="color: #1f2937; margin-top: 10px;">Seller Account Application Status</h2>
        </div>
        
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0; font-size: 16px;">
            Dear ${sellerData.ownerFirstName || 'Applicant'},
          </p>
          <p style="color: #991b1b; margin-top: 10px;">
            Thank you for your interest in joining MarketOS as a seller. Unfortunately, we are unable to approve your application for <strong>${sellerData.businessName}</strong> at this time.
          </p>
        </div>

        ${reason ? `
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">📋 Reason:</h3>
          <p style="color: #78350f; margin: 0;">${reason}</p>
        </div>
        ` : ''}

        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📋 Application Details:</h3>
          <p><strong>Business Name:</strong> ${sellerData.businessName}</p>
          <p><strong>Email:</strong> ${sellerData.email}</p>
          <p><strong>Application Date:</strong> ${new Date(sellerData.joinedDate).toLocaleDateString()}</p>
        </div>

        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">💡 What's Next?</h3>
          <ul style="color: #1f2937; line-height: 1.8;">
            <li>Review the reason for rejection above</li>
            <li>Ensure all required documents are valid and complete</li>
            <li>Verify your business information is accurate</li>
            <li>You may reapply once the issues are resolved</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${contactUrl}" 
             style="background: #3b82f6; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 8px; margin: 10px; 
                    display: inline-block; font-weight: bold;">
            📧 Contact Support
          </a>
          
          <a href="${reapplyUrl}" 
             style="background: #10b981; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 8px; margin: 10px; 
                    display: inline-block; font-weight: bold;">
            🔄 Reapply Now
          </a>
        </div>

        <div style="border-top: 2px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            <strong>Need assistance?</strong><br>
            Contact us at market.os.123@gmail.com or visit our support center.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated email from MarketOS Seller Portal.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: '"MarketOS - Verification Team" <market.os.123@gmail.com>',
      to: sellerData.email,
      subject: `Application Update: ${sellerData.businessName} - Action Required`,
      html: emailContent
    })
    console.log(`✅ Rejection email sent successfully to ${sellerData.email}`)
    console.log('📧 Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Rejection email failed:', error.message)
    return { success: false, error: error.message }
  }
}

export async function sendWelcomeEmail(sellerData: any) {
  const dashboardUrl = `http://localhost:5176/`
  
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 15px;">
      <div style="background: white; padding: 40px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; font-size: 36px; margin: 0;">🎉 Welcome to MarketOS!</h1>
          <h2 style="color: #1f2937; margin-top: 10px;">Your Seller Journey Begins Here</h2>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
          <p style="color: #166534; margin: 0; font-size: 16px;">
            <strong>Hi ${sellerData.ownerFirstName || 'there'}!</strong> 
            Thank you for registering <strong>${sellerData.businessName}</strong> on MarketOS. 
            We're excited to have you join our seller community!
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">📋 Your Application Details:</h3>
          <p><strong>Business Name:</strong> ${sellerData.businessName}</p>
          <p><strong>Seller ID:</strong> ${sellerData.sellerId}</p>
          <p><strong>Email:</strong> ${sellerData.email}</p>
          <p><strong>Phone:</strong> ${sellerData.phone || 'N/A'}</p>
          <p><strong>Category:</strong> ${sellerData.category || 'N/A'}</p>
          <p><strong>Locations:</strong> ${sellerData.locations?.length || 0} store(s)</p>
        </div>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">⏳ What Happens Next?</h3>
          <ol style="color: #78350f; line-height: 1.8;">
            <li><strong>Document Review</strong> - Our team is reviewing your submitted documents</li>
            <li><strong>Verification</strong> - We'll verify your business information</li>
            <li><strong>Approval</strong> - You'll receive an email once approved (usually within 24-48 hours)</li>
            <li><strong>Start Selling</strong> - Add products and start receiving orders!</li>
          </ol>
        </div>

        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">📚 While You Wait:</h3>
          <ul style="color: #1e3a8a; line-height: 1.8;">
            <li>Check your email regularly for updates</li>
            <li>Prepare product images and descriptions</li>
            <li>Review our seller guidelines</li>
            <li>Set up your business bank account details</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); 
                    color: white; padding: 18px 40px; text-decoration: none; 
                    border-radius: 10px; display: inline-block; font-weight: bold; 
                    font-size: 16px; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);">
            🏠 Visit Seller Portal
          </a>
        </div>

        <div style="border-top: 2px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            <strong>Questions?</strong><br>
            Contact our support team at market.os.123@gmail.com<br>
            We're here to help you succeed!
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated welcome email from MarketOS.<br>
            Your application ID: ${sellerData.sellerId}
          </p>
        </div>
      </div>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: '"MarketOS - Onboarding Team" <market.os.123@gmail.com>',
      to: sellerData.email,
      subject: `🎉 Welcome to MarketOS, ${sellerData.ownerFirstName || 'Seller'}! Application Received`,
      html: emailContent
    })
    console.log(`✅ Welcome email sent successfully to ${sellerData.email}`)
    console.log('📧 Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('❌ Welcome email failed:', error.message)
    return { success: false, error: error.message }
  }
}
