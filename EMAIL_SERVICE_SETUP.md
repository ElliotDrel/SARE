# Email Service Setup Guide

## Overview
The application needs an email service to send story invitations to storytellers. Currently, the code tries to invoke a Supabase Edge Function called `send-story-invite` that doesn't exist.

## Current Issue
When users try to send story invitations from the `/protected/onboarding/send_collect` page, they get an error because:
1. The Supabase Edge Function `send-story-invite` is not implemented
2. No email service is configured

## Solution Options

### Option 1: Supabase Edge Function (Recommended)
Create a Supabase Edge Function to handle email sending.

#### Step 1: Create the Edge Function
```bash
# In your project directory
supabase functions new send-story-invite
```

#### Step 2: Implement the Function
Create `supabase/functions/send-story-invite/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create story submission URL
    const inviteUrl = `${Deno.env.get('SITE_URL')}/story_submit?token=${invite_token}`

    // Email content
    const emailContent = {
      to: email,
      subject: 'Share Your Story - SARE Invitation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You've been invited to share your story</h2>
          <p>Hi ${storyteller_name},</p>
          <p>You've been invited to share a story about someone's strengths and positive impact.</p>
          <p>This is part of a meaningful self-reflection process that helps people understand their unique contributions.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${inviteUrl}" 
               style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Share Your Story
            </a>
          </div>
          
          <p>Your story will help someone better understand their strengths and impact on others.</p>
          <p>Thank you for taking the time to share your perspective!</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This invitation will expire in 30 days. If you have any questions, please contact us.
          </p>
        </div>
      `
    }

    // Send email using your preferred service
    // Option A: Resend (recommended)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SARE <noreply@yourdomain.com>',
          to: [email],
          subject: emailContent.subject,
          html: emailContent.html,
        }),
      })

      if (!response.ok) {
        throw new Error(`Resend API error: ${response.statusText}`)
      }
    }

    // Option B: SendGrid
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendgridApiKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: 'noreply@yourdomain.com', name: 'SARE' },
          subject: emailContent.subject,
          content: [{ type: 'text/html', value: emailContent.html }],
        }),
      })

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.statusText}`)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

#### Step 3: Set Environment Variables
In your Supabase dashboard, set these environment variables for your Edge Function:

```bash
# For Resend (recommended)
RESEND_API_KEY=your_resend_api_key_here

# OR for SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Site URL
SITE_URL=https://yourdomain.com
```

#### Step 4: Deploy the Function
```bash
supabase functions deploy send-story-invite
```

### Option 2: Alternative Email Services

#### Resend (Recommended)
1. Sign up at https://resend.com
2. Get your API key
3. Add to environment variables
4. Very simple API and good deliverability

#### SendGrid
1. Sign up at https://sendgrid.com
2. Get your API key
3. Add to environment variables
4. More features but more complex

#### Mailgun
1. Sign up at https://mailgun.com
2. Get your API key and domain
3. Add to environment variables

## Environment Variables Needed

Add these to your `.env.local` file and Supabase Edge Function environment:

```bash
# Choose one email service
RESEND_API_KEY=your_resend_api_key_here
# OR
SENDGRID_API_KEY=your_sendgrid_api_key_here
# OR
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=your_mailgun_domain_here

# Site URL for email links
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Testing the Email Service

Once set up, you can test the email service by:

1. Going to `/protected/onboarding/send_collect`
2. Adding storytellers
3. Clicking "Send Invite"
4. Checking that emails are sent and received

## Current Fallback Behavior

The application has been updated to:
1. Show a warning when the email service is not configured
2. Still mark invites as "sent" in the database (for tracking purposes)
3. Allow users to continue with the flow even without email service
4. Display helpful error messages to users

## Next Steps

1. Choose an email service (Resend recommended)
2. Get API keys
3. Implement the Supabase Edge Function
4. Set environment variables
5. Deploy and test

## Support

If you need help setting up the email service, please contact the development team with:
- Your preferred email service
- Your domain name
- Any specific requirements