const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { CognitoIdentityProviderClient, AdminDeleteUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

const dynamoClient = new DynamoDBClient({ region: 'ap-south-1' });
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

const cognitoClient = new CognitoIdentityProviderClient({ region: 'ap-south-1' });

const USER_POOL_ID = 'ap-south-1_d0s99txNQ';
const SELLERS_TABLE = 'marketos_sellers';

const emailsToDelete = [
  'hanishka270606@gmail.com',
  'hanishkaappl@gmail.com',
  'hanishkainbox@gmail.com'
];

async function deleteFromCognito(email) {
  try {
    await cognitoClient.send(new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email
    }));
    console.log(`✅ Deleted from Cognito: ${email}`);
    return true;
  } catch (error) {
    if (error.name === 'UserNotFoundException') {
      console.log(`⚠️  User not found in Cognito: ${email}`);
      return true;
    }
    console.error(`❌ Failed to delete from Cognito (${email}):`, error.message);
    return false;
  }
}

async function deleteFromDynamoDB(email) {
  try {
    await dynamoDB.send(new DeleteCommand({
      TableName: SELLERS_TABLE,
      Key: { email }
    }));
    console.log(`✅ Deleted from DynamoDB: ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete from DynamoDB (${email}):`, error.message);
    return false;
  }
}

async function deleteAccounts() {
  console.log('🗑️  Starting account deletion process...\n');
  
  for (const email of emailsToDelete) {
    console.log(`\n📧 Processing: ${email}`);
    console.log('─'.repeat(50));
    
    // Delete from Cognito
    await deleteFromCognito(email);
    
    // Delete from DynamoDB
    await deleteFromDynamoDB(email);
    
    console.log('─'.repeat(50));
  }
  
  console.log('\n✅ Account deletion process completed!');
  console.log('\n📝 Summary:');
  console.log(`   - Processed ${emailsToDelete.length} accounts`);
  console.log('   - Users can now sign up again with these emails');
}

deleteAccounts().catch(console.error);
