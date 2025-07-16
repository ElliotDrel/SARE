import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, invite_token, storyteller_name } = await req.json()

    // Validate input
    if (!email || !invite_token || !storyteller_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, invite_token, and storyteller_name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get site URL from environment
    const siteUrl = Deno.env.get('SITE_URL') || Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000'
    
    // Create story submission URL
    const inviteUrl = `${siteUrl}/story_submit?token=${invite_token}`

    // Email content
    const emailContent = {
      to: email,
      subject: 'Share Your Story - SARE Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0D7377; margin: 0;">SARE</h1>
            <p style="color: #666; margin: 5px 0;">Strengths and Reflection Exercise</p>
          </div>
          
          <h2 style="color: #0D7377; margin-bottom: 20px;">You've been invited to share your story</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Hi ${storyteller_name},</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            You've been invited to share a story about someone's strengths and positive impact. 
            This is part of a meaningful self-reflection process that helps people understand their unique contributions.
          </p>
          
          <div style="margin: 40px 0; text-align: center;">
            <a href="${inviteUrl}" 
               style="background-color: #0D7377; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
              Share Your Story
            </a>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Your story will help someone better understand their strengths and impact on others. 
            It's a valuable gift that contributes to their personal growth and self-awareness.
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thank you for taking the time to share your perspective!
          </p>
          
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
          
          <div style="font-size: 14px; color: #666; text-align: center;">
            <p>This invitation will expire in 30 days.</p>
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
            <p style="margin-top: 20px;">
              <a href="${siteUrl}" style="color: #0D7377; text-decoration: none;">Visit SARE</a>
            </p>
          </div>
        </div>
      `
    }

    // Try different email services in order of preference
    let emailSent = false
    let lastError = null

    // Option 1: Resend (recommended)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey && !emailSent) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'SARE <noreply@yourdomain.com>', // Update with your domain
            to: [email],
            subject: emailContent.subject,
            html: emailContent.html,
          }),
        })

        if (response.ok) {
          emailSent = true
          console.log('Email sent successfully via Resend')
        } else {
          const errorData = await response.text()
          lastError = `Resend API error: ${response.status} ${response.statusText} - ${errorData}`
          console.error(lastError)
        }
      } catch (error) {
        lastError = `Resend error: ${error.message}`
        console.error(lastError)
      }
    }

    // Option 2: SendGrid
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendgridApiKey && !emailSent) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: 'noreply@yourdomain.com', name: 'SARE' }, // Update with your domain
            subject: emailContent.subject,
            content: [{ type: 'text/html', value: emailContent.html }],
          }),
        })

        if (response.ok) {
          emailSent = true
          console.log('Email sent successfully via SendGrid')
        } else {
          const errorData = await response.text()
          lastError = `SendGrid API error: ${response.status} ${response.statusText} - ${errorData}`
          console.error(lastError)
        }
      } catch (error) {
        lastError = `SendGrid error: ${error.message}`
        console.error(lastError)
      }
    }

    // Option 3: Mailgun
    const mailgunApiKey = Deno.env.get('MAILGUN_API_KEY')
    const mailgunDomain = Deno.env.get('MAILGUN_DOMAIN')
    if (mailgunApiKey && mailgunDomain && !emailSent) {
      try {
        const formData = new FormData()
        formData.append('from', 'SARE <noreply@yourdomain.com>') // Update with your domain
        formData.append('to', email)
        formData.append('subject', emailContent.subject)
        formData.append('html', emailContent.html)

        const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`api:${mailgunApiKey}`)}`,
          },
          body: formData,
        })

        if (response.ok) {
          emailSent = true
          console.log('Email sent successfully via Mailgun')
        } else {
          const errorData = await response.text()
          lastError = `Mailgun API error: ${response.status} ${response.statusText} - ${errorData}`
          console.error(lastError)
        }
      } catch (error) {
        lastError = `Mailgun error: ${error.message}`
        console.error(lastError)
      }
    }

    // Check if email was sent
    if (!emailSent) {
      const errorMessage = lastError || 'No email service configured. Please set up RESEND_API_KEY, SENDGRID_API_KEY, or MAILGUN_API_KEY environment variables.'
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: 'Email service not configured properly'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Story invitation sent successfully',
        recipient: email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Internal server error while sending email'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})