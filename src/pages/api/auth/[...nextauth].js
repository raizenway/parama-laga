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
              role: true // Include role untuk mendapatkan info role
            },
          });

          // Jika user tidak ditemukan
          if (!user) {
            console.log("User not found");
            return null;
          }

          // Bandingkan password
          // Catatan: Ini mengasumsikan password di database sudah di-hash
          // Jika password belum di-hash, perlu disesuaikan
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
            role: user.role.roleName,
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
        token.role = user.role;
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


// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: "Email", type: "email", placeholder: "test@example.com" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         // Lakukan validasi email dan password di sini
//         if (credentials?.email === "user@example.com" && credentials?.password === "password") {
//           return { id: "1", name: "User", email: credentials.email };
//         } else {
//           return null; // Jika gagal, kembalikan null
//         }
//       }
//     })
//   ],
//   callbacks: {
//     jwt: async ({ token, user }) => {
//       if (user) token.id = user.id;
//       return token;
//     },
//     session: async ({ session, token }) => {
//       if (token) session.user.id = token.id;
//       return session;
//     }
//   },
//   pages: {
//     signIn: '/authentication', // Sesuaikan dengan path halaman login Anda
//   },  
//   secret: process.env.NEXTAUTH_SECRET,
// };

// export default NextAuth(authOptions);