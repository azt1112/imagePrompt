export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}

declare global {
  interface CustomJwtSessionClaims {
    user?: User & {
      id: string;
      isAdmin: boolean;
    }
  }
}

export const authOptions = {
  pages: {
    signIn: "/login",
  },
}

export async function getCurrentUser() {
  const { getServerSession } = await import("next-auth");
  const { simpleAuthOptions } = await import("./simple-nextauth");
  const session = await getServerSession(simpleAuthOptions);
  return session?.user;
}
