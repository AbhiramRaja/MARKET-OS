import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
      loginWith: { email: true },
      signUpVerificationMethod: 'code',
      userAttributes: { email: { required: true } }
    }
  },
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_APPSYNC_HTTP_URL,
      region: import.meta.env.VITE_AWS_REGION,
      defaultAuthMode: import.meta.env.VITE_APPSYNC_API_AUTH_MODE
    }
  }
});
