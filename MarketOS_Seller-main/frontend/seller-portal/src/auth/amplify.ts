import { Amplify } from 'aws-amplify'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-south-1_d0s99txNQ',
      userPoolClientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID || 'ae27uf3rk6k3pqrr04go6c7h4',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
      },
    },
  },
})

console.log('🔧 Amplify configured with:', {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  clientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
  region: import.meta.env.VITE_AWS_REGION
});
