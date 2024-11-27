import { defineAuth } from "@aws-amplify/backend";

// auth.ts
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userPool: {
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    id: process.env.NEXT_PUBLIC_USER_POOL_ID,
    clientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
  }
});
