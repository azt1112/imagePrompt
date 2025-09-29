/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import NextAuth from "next-auth";

// 暂时使用简化的配置来测试Google OAuth
import { simpleAuthOptions } from "@saasfly/auth/simple-nextauth";

const handler = NextAuth(simpleAuthOptions);

export { handler as GET, handler as POST };
