/**
 * SWR PROVIDER
 * =====================================================
 * Global SWR provider untuk wrapping aplikasi
 * =====================================================
 */

'use client'

import { SWRConfig } from 'swr'
import { defaultSWRConfig } from './config'
import { ReactNode } from 'react'

interface SWRProviderProps {
  children: ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={defaultSWRConfig}>
      {children}
    </SWRConfig>
  )
}
