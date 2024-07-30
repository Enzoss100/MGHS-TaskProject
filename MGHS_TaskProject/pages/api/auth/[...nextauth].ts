import { auth } from "@/app/firebase";
import { fetchUserDetails } from "@/app/services/UserService";
import { signInWithEmailAndPassword } from "firebase/auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  // Configure one or more authentication providers
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize(credentials): Promise<any> {
        const user = await signInWithEmailAndPassword(
          auth,
          (credentials as any).email || "",
          (credentials as any).password || ""
        )
          .then((userCredential) => {
            if (userCredential.user) {
              return userCredential.user;
            }
            return null;
          })
          .catch((error) => console.log(error))
          // .catch((error) => {
          //   const errorCode = error.code;
          //   const errorMessage = error.message;
          //   console.log(error);
          // });

        return user;
      },
    }),
  ],
  callbacks: {
    session: async (session: any) => {
      const db_user = await fetchUserDetails(session.session.user.email)
      session.session.snapshot = db_user[0];
      return Promise.resolve(session.session);
    }
  }
};
export default NextAuth(authOptions);
