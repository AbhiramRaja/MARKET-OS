import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

const {
  VITE_AWS_REGION,
  VITE_APPSYNC_URL,
  VITE_API_BASE,
  VITE_COGNITO_USER_POOL_ID,
  VITE_COGNITO_USER_POOL_CLIENT_ID,
} = import.meta.env;

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: VITE_COGNITO_USER_POOL_CLIENT_ID,
      signUpVerificationMethod: 'code',
      loginWith: { username: true, email: true, phone: false },
    },
  },
  API: {
    GraphQL: {
      endpoint: VITE_APPSYNC_URL, // https://<id>.appsync-api.<region>.amazonaws.com/graphql
      region: VITE_AWS_REGION,
      defaultAuthMode: 'userPool',
    },
    REST: {
      SellerApi: {
        endpoint: VITE_API_BASE,
        region: VITE_AWS_REGION,
      },
    },
  },
});

export const gqlClient = generateClient();

export const getIdToken = async () => {
  const session = await fetchAuthSession();
  const idToken = session.tokens?.idToken?.toString();
  if (!idToken) throw new Error('No Cognito ID token found');
  return idToken;
};
