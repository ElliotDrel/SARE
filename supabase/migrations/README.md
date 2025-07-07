# SARE Platform Database Schema

## Overview

This migration sets up the complete database schema for the SARE platform, including tables for managing storytellers, collecting stories, self-reflections, and lead generation.

## Tables

### 1. storytellers
Stores information about people invited to submit stories about a user.
- **user_id**: Links to the user who invited this storyteller
- **invite_token**: Unique token used in invitation links
- **invite_sent_at**: Tracks when invitation was sent
- **story_submitted_at**: Automatically updated when story is submitted

### 2. stories
Stores the actual stories submitted by storytellers.
- **storyteller_id**: Links to the storyteller who submitted
- **user_id**: Links to the user the story is about
- **story_part_1**: Required first part of the story
- **story_part_2**, **story_part_3**: Optional additional parts

### 3. self_reflections
Stores user's self-reflection responses (one per user).
- **user_id**: Links to the user
- **reflection_1**, **reflection_2**, **reflection_3**: Three reflection prompts
- **updated_at**: Automatically updated on changes

### 4. certification_leads
Stores inquiries about SARE certification.
- Public form submissions
- No authentication required

### 5. contact_messages
Stores general contact form submissions.
- Public form submissions
- No authentication required

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **storytellers**: Users can only manage their own storytellers
- **stories**: Users can view stories about them; storytellers can submit via email match
- **self_reflections**: Users can only manage their own reflections
- **certification_leads**: Anyone can submit, admin access required to view
- **contact_messages**: Anyone can submit, admin access required to view

## Applying the Migration

### Local Development

1. Make sure your local Supabase is running:
   ```bash
   npx supabase start
   ```

2. Apply the migration:
   ```bash
   npx supabase db push
   ```

### Production

1. Link to your production project:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```

2. Apply the migration:
   ```bash
   npx supabase db push --linked
   ```

## Triggers

- **update_self_reflections_updated_at**: Updates the `updated_at` timestamp on self_reflections
- **update_storyteller_on_story_submit**: Updates `story_submitted_at` when a story is submitted 