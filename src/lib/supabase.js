import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const READ_ONLY_STORAGE_KEY = 'sfsc-read-only'

export const setReadOnlyFlag = (enabled) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(READ_ONLY_STORAGE_KEY, enabled ? '1' : '0')
}

export const getReadOnlyFlag = () => {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(READ_ONLY_STORAGE_KEY) === '1'
}

const guardedFetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url || ''
  const method = String(init?.method || 'GET').toUpperCase()
  const isDbRestCall = url.includes('/rest/v1/')
  const isWriteMethod = method === 'POST' || method === 'PATCH' || method === 'DELETE' || method === 'PUT'

  if (isDbRestCall && isWriteMethod && getReadOnlyFlag()) {
    throw new Error('Acesso somente leitura: alterações estão bloqueadas para este perfil.')
  }

  return fetch(input, init)
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: guardedFetch,
  },
})