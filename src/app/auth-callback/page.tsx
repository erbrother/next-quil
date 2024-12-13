'use client'

import {useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'

const Page = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const origin = searchParams.get('origin')

  trpc.authCallback.useQuery([undefined], {
    onSuccess: (data: { success: any }) => {
      if (data?.success) {
        // user is synced to db
        router.push(origin ? `/${origin}` : '/dashboard')
      }
    }
  })

 

  return (
    <div className='w-full mt-24 flex justify-center'>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className='h-8 w-8 animate-spin text-zinc-800'></Loader2>
        <h3>Setting up your count</h3>
      </div>
    </div>
  )
}


export default Page