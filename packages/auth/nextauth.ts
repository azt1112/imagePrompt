import { getServerSession, NextAuthOptions, User } from "next-auth";
// import { KyselyAdapter } from "@auth/kysely-adapter";
import GoogleProvider from "next-auth/providers/google";
// import EmailProvider from "next-auth/providers/email";

// import { MagicLinkEmail, resend, siteConfig } from "@saasfly/common";

import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

// import { db } from "./db";
import { env } from "./env.mjs";

type UserId = string;
type IsAdmin = boolean;

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      isAdmin: IsAdmin;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    isAdmin: IsAdmin;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  // 暂时禁用数据库适配器，使用JWT策略
  // adapter: KyselyAdapter(db),

  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            httpOptions: { timeout: 15000 },
          }),
        ]
      : []),
    // 暂时禁用EmailProvider，因为它依赖数据库
    // EmailProvider({
    //   sendVerificationRequest: async ({ identifier, url }) => {
    //     // ... email sending logic
    //   },
    // }),
  ],
  callbacks: {
    session({ token, session }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.name = token.name;
          session.user.email = token.email;
          session.user.image = token.picture;
          session.user.isAdmin = token.isAdmin as boolean;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // 暂时简化JWT回调，避免数据库查询
      if (user) {
        token.id = user.id;
      }
      
      let isAdmin = false;
      if (env.ADMIN_EMAIL && token.email) {
        const adminEmails = env.ADMIN_EMAIL.split(",");
        isAdmin = adminEmails.includes(token.email);
      }
      
      token.isAdmin = isAdmin;
      return token;
    },
  },
  debug: env.IS_DEBUG === "true",
};

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
