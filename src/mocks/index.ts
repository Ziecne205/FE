export async function initMocks() {
  if (typeof window === 'undefined') {
    // Server-side: use node MSW
    const { setupServer } = await import('msw/node')
    const { handlers } = await import('./handlers')
    const server = setupServer(...handlers)
    server.listen()
  } else {
    // Client-side: use browser MSW
    const { worker } = await import('./browser')
    await worker.start({
      onUnhandledRequest: 'bypass',
    })
  }
}
