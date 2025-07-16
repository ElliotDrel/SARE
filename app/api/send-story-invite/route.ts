import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, invite_token, storyteller_name } = await request.json();

    // Validate required fields
    if (!email || !invite_token || !storyteller_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, invite_token, storyteller_name' },
        { status: 400 }
      );
    }

    // TODO: Replace this with actual email service when API keys are provided
    // For now, we'll just log the email details and return success
    console.log('Email Service Not Configured - Would send email to:', {
      to: email,
      subject: 'You\'ve been invited to share a story',
      storyteller_name,
      invite_link: `${process.env.NEXT_PUBLIC_SITE_URL}/story_invite?token=${invite_token}`,
    });

    // When email service is configured, replace the above with:
    /*
    // Example with SendGrid:
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'You\'ve been invited to share a story',
      html: `
        <h1>Hello ${storyteller_name},</h1>
        <p>You've been invited to share a story about someone's strengths.</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/story_invite?token=${invite_token}">Click here to share your story</a></p>
      `,
    };
    
    await sgMail.send(msg);
    */

    // For now, return success to indicate the invite was "sent"
    return NextResponse.json({ 
      success: true, 
      message: 'Email service not configured, but invite marked as sent' 
    });

  } catch (error) {
    console.error('Error sending story invite:', error);
    return NextResponse.json(
      { error: 'Failed to send story invite' },
      { status: 500 }
    );
  }
}