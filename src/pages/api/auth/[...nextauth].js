import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Lakukan validasi email dan password di sini
        if (credentials?.email === "user@example.com" && credentials?.password === "password") {
          return { id: "1", name: "User", email: credentials.email };
        } else {
          return null; // Jika gagal, kembalikan null
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (token) session.user.id = token.id;
      return session;
    }
  },
  pages: {
    signIn: '/authentication', // Sesuaikan dengan path halaman login Anda
  },  
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);