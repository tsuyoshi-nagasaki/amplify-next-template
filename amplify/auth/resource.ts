import { defineAuth } from "@aws-amplify/backend"

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      saml: {
        name: "MicrosoftEntraIDSAML",
        metadata: {
          metadataType: "URL",
          metadataContent: "https://login.microsoftonline.com/35a993f8-8c1b-4df4-add0-c451a12d0755/federationmetadata/2007-06/federationmetadata.xml?appid=5059e4b3-d142-47b3-8246-4a0cc090e456",
        },
        attributeMapping: {
          email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
        },
      },
      logoutUrls: [process.env.AMPLIFY_AUTH_LOGOUT_URL || "http://localhost:3000"],
      callbackUrls: [process.env.AMPLIFY_AUTH_CALLBACK_URL || "http://localhost:3000"],
    },
  },
})