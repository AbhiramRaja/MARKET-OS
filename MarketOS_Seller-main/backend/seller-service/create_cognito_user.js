const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({ region: 'ap-south-1' });

(async () => {
  try {
    // Create user
    await cognitoClient.send(new AdminCreateUserCommand({
      UserPoolId: 'ap-south-1_d0s99txNQ',
      Username: 'video@demo.com',
      UserAttributes: [
        { Name: 'email', Value: 'video@demo.com' },
        { Name: 'email_verified', Value: 'true' }
      ],
      MessageAction: 'SUPPRESS',
      TemporaryPassword: 'TempPass123!'
    }));

    // Set permanent password
    await cognitoClient.send(new AdminSetUserPasswordCommand({
      UserPoolId: 'ap-south-1_d0s99txNQ', 
      Username: 'video@demo.com',
      Password: 'Video123!',
      Permanent: true
    }));

    console.log('✅ COGNITO USER CREATED!');
    console.log('🎬 Ready to login with:');
    console.log('📧 Email: video@demo.com');
    console.log('🔑 Password: Video123!');
    
  } catch (error) {
    if (error.name === 'UsernameExistsException') {
      console.log('👍 User already exists, updating password...');
      
      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: 'ap-south-1_d0s99txNQ',
        Username: 'video@demo.com', 
        Password: 'Video123!',
        Permanent: true
      }));
      
      console.log('✅ PASSWORD UPDATED!');
      console.log('🎬 Ready to login with:');
      console.log('📧 Email: video@demo.com');
      console.log('🔑 Password: Video123!');
    } else {
      console.error('Error:', error);
    }
  }
})();
