import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const simpleAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 20000, // 增加超时时间到20秒
      },
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login", // 退出后跳转到登录页
  },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // 添加访问令牌到会话中（如果需要）
        // session.accessToken = token.accessToken as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // 确保登录成功
      console.log("SignIn callback:", { user: user?.email, account: account?.provider });
      return true;
    },
    async redirect({ url, baseUrl }) {
      // 处理退出登录的重定向
      if (url.includes('/api/auth/signout')) {
        return `${baseUrl}/zh/login`;
      }
      // 登录成功后重定向到dashboard，考虑i18n locale
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/zh/dashboard`;
    },
  },
  events: {
    async signOut(message) {
      // 退出登录时的事件处理
      console.log("User signed out:", message);
    },
  },
};