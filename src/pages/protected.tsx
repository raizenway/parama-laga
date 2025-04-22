import type { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'

interface Props {
  session: any
}

export default function ProtectedPage({ session }: Props) {
  return (
    <div>
      Konten protected untuk {session.user.email}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const session = await getSession(ctx)
  if (!session) {
    return {
      redirect: {
        destination: '/authentication',
        permanent: false
      }
    }
  }
  return { props: { session } }
}