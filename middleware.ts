import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (!token) return false
      const path = req.nextUrl.pathname
      if (
        path.startsWith('/manage') ||
        path.startsWith('/api/users')
      ) {
        return token.role === 'super-admin'
      }
      if (path.startsWith('/event-edit')) {
        return token.role === 'super-admin' || token.role === 'admin'
      }
      return true
    }
  }
})

export const config = {
  matcher: ['/myclub', '/profile', '/manage', '/event-edit', '/api/profile', '/api/myclubs', '/api/users/:path*', '/api/clubs/:path*', '/api/events/:path*']
}
