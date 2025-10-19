import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function Gate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export default withAuthenticator(Gate);
