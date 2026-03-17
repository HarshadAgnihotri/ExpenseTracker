import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    familyId?: string;
  }

  interface Session {
    user: User & {
      id: string;
      familyId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    familyId?: string;
  }
}
