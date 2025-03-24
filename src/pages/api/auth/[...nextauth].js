import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Cari user berdasarkan email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { 
              roleAccess: true // CHANGE HERE: use roleAccess instead of role
            },
          });

          // Jika user tidak ditemukan
          if (!user) {
            console.log("User not found");
            return null;
          }

          // Bandingkan password
          const isPasswordValid = await compare(credentials.password, user.password);

          // Jika password salah
          if (!isPasswordValid) {
            console.log("Password invalid");
            return null;
          }

          // Jika berhasil, kembalikan data user (jangan sertakan password)
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.roleAccess.roleName, // CHANGE HERE: Assign role from roleAccess
            photoUrl: user.photoUrl
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role; // This is now correct since we set it in the return value above
        token.photoUrl = user.photoUrl;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.photoUrl = token.photoUrl;
      }
      return session;
    }
  },
  // Konfigurasi session menggunakan JWT
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/authentication',
  },  
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);