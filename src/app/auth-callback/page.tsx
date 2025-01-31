'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'
import { useEffect, Suspense } from 'react'

const Page = () => {
  const router = useRouter()

  const searchParams = useSearchParams()

  const origin = searchParams.get('origin')
  const { data } = trpc.authCallback.useQuery(undefined, {
    retry: (failureCount, error) => {
      if (error.data?.code === 'UNAUTHORIZED') {
          console.log('error: ', error);
          // operations to perform on this errorCode
          router.push("/sign-in");
      }
      // return false at any point to exit out of retry loop
      return true;
    },
    retryDelay: 5000, // 500ms retry
  })

  useEffect(() => {
    if (data?.success) {
      router.push(origin ? `/${origin}` : "/dashboard");
    }
  }, [data, router, origin]);

  return (
    <Suspense>
      <div className='w-full mt-24 flex justify-center'>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className='h-8 w-8 animate-spin text-zinc-800'></Loader2>
          <h3>Setting up your count</h3>
        </div>
      </div>
    </Suspense>
    
  )
}


export default Page