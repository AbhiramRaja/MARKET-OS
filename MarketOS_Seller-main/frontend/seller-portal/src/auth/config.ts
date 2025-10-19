export const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_BtZLqz4Ob',
      userPoolClientId: '2crjnpnl5oj30uc4pnvlvfuikv', // Update this with correct Client ID from AWS Console
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
      },
    },
  },
}
