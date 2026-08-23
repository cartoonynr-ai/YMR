import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
})

function RootComponent() {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
    if (!link) return

    let isOriginal = true
    const interval = setInterval(() => {
      if (isOriginal) {
        link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      } else {
        link.href = '/logo.png'
      }
      isOriginal = !isOriginal
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  )
}
