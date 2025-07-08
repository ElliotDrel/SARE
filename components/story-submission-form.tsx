'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Storyteller } from '@/lib/supabase/types'
import { submitStory } from '@/app/story_submit/actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const formSchema = z.object({
  story_part_1: z.string().min(10, {
    message: 'Story must be at least 10 characters.',
  }),
  story_part_2: z.string().optional(),
  story_part_3: z.string().optional(),
})

type StorySubmissionFormValues = z.infer<typeof formSchema>

export default function StorySubmissionForm({
  storyteller,
}: {
  storyteller: Storyteller
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<StorySubmissionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      story_part_1: '',
      story_part_2: '',
      story_part_3: '',
    },
  })

  async function onSubmit(values: StorySubmissionFormValues) {
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('story_part_1', values.story_part_1)
    formData.append('story_part_2', values.story_part_2 || '')
    formData.append('story_part_3', values.story_part_3 || '')
    formData.append('storyteller_id', storyteller.id)
    formData.append('user_id', storyteller.user_id)

    const result = await submitStory(formData)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push('/story_thank_you')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Story</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="story_part_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Think of a time you were at your best. What was the situation? What did you do? (Required)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us your story..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="story_part_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    What were the results of your actions? (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the outcome..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="story_part_3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    What did you learn from this experience? (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your reflections..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-red-500">{error}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Story'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 