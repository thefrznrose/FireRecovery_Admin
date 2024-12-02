import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.NEXTAUTH_SECRET!,
      authorization: {
        params: {
          scope: `
            https://www.googleapis.com/auth/drive
            https://www.googleapis.com/auth/spreadsheets
            openid
            profile
            email
          `.replace(/\s+/g, " ").trim(),
        },
      },      
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        // Attach the access token to the JWT
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach the access token to the session
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
