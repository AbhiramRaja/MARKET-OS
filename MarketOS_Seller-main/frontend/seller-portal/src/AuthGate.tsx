import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <Authenticator variation="modal">
      {() => <>{children}</>}
    </Authenticator>
  );
}
