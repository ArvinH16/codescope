import { describe, it, expect } from 'vitest'
import { GithubService } from '@/lib/github/github-service'
import { createClient } from '@/utils/supabase/server'

describe('Example test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})