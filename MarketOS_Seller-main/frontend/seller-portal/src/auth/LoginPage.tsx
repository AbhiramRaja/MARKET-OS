import { useEffect, useState } from "react";
import { signIn, resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { API_BASE_URL } from "../config/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');
  const [resetMessage, setResetMessage] = useState("");

  useEffect(() => { setError(null) }, [email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Sign in with AWS Cognito
      await signIn({
        username: email,
        password
      });
      
      // Fetch seller data from backend
      try {
        const response = await fetch(`${API_BASE_URL}/sellers/email/${encodeURIComponent(email)}`);
        if (response.ok) {
          const sellerData = await response.json();
          
          // Store seller data in localStorage
          localStorage.setItem('sellerLoggedIn', 'true');
          localStorage.setItem('sellerEmail', email);
          localStorage.setItem('currentSeller', JSON.stringify(sellerData));
          localStorage.setItem('verificationStatus', sellerData.verificationStatus || 'pending');
          localStorage.setItem('documentsSubmitted', sellerData.documentsSubmitted ? 'true' : 'false');
          
          // Redirect to home page
          window.location.href = '/';
        } else {
          // If seller not found in database, this is a first login
          // Create a minimal seller profile
          const newSeller = {
            email,
            sellerId: `seller_${Date.now()}`,
            businessName: email.split('@')[0],
            verified: false,
            verificationStatus: 'pending',
            documentsSubmitted: false,
            joinedDate: new Date().toISOString()
          };
          
          localStorage.setItem('sellerLoggedIn', 'true');
          localStorage.setItem('sellerEmail', email);
          localStorage.setItem('currentSeller', JSON.stringify(newSeller));
          localStorage.setItem('verificationStatus', 'pending');
          localStorage.setItem('documentsSubmitted', 'false');
          
          window.location.href = '/';
        }
      } catch (fetchError) {
        console.error('Failed to fetch seller data:', fetchError);
        // Continue with login anyway
        localStorage.setItem('sellerLoggedIn', 'true');
        localStorage.setItem('sellerEmail', email);
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err.name === 'UserNotFoundException' || err.name === 'NotAuthorizedException') {
        setError("❌ Invalid email or password. Please check your credentials.");
      } else if (err.name === 'UserNotConfirmedException') {
        setError("❌ Please verify your email address first. Check your inbox for a verification code.");
      } else {
        setError(`❌ ${err.message || "Sign-in failed. Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    try {
      await resetPassword({ username: resetEmail });
      setResetStep('code');
      setResetMessage('✅ Check your email for the verification code!');
    } catch (error: any) {
      setResetMessage('❌ ' + error.message);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      await confirmResetPassword({ username: resetEmail, confirmationCode: resetCode, newPassword });
      setResetMessage('✅ Password reset successful! You can now sign in.');
      setTimeout(() => {
        setShowReset(false);
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
        setResetStep('email');
        setResetMessage('');
      }, 2000);
    } catch (error: any) {
      setResetMessage('❌ ' + error.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 p-6 rounded-xl bg-neutral-800">
        <h1 className="text-2xl font-semibold">🔐 Seller Sign In</h1>
        {error && <div className="text-sm bg-red-600/20 border border-red-500 rounded p-3">{error}</div>}
        <div className="space-y-2">
          <label className="block text-sm">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full px-3 py-2 rounded bg-neutral-700 outline-none" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full px-3 py-2 rounded bg-neutral-700 outline-none" />
        </div>
        <button disabled={loading} className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 font-semibold">
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <button type="button" onClick={() => setShowReset(true)} className="w-full text-sm text-emerald-400 hover:text-emerald-300 underline">
          🔒 Forgot your password?
        </button>
        <div className="text-center pt-2 border-t border-neutral-700">
          <p className="text-sm text-gray-400 mb-2">Don't have an account?</p>
          <a href="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold underline">
            🚀 Create Seller Account
          </a>
        </div>
      </form>

      {showReset && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div className="w-full max-w-md p-6 rounded-xl bg-neutral-800 space-y-4">
            <h2 className="text-2xl font-semibold">🔐 Reset Password</h2>
            {resetMessage && <div className={`text-sm rounded p-2 ${resetMessage.startsWith('✅') ? 'bg-green-600/20 border border-green-500' : 'bg-red-600/20 border border-red-500'}`}>{resetMessage}</div>}
            {resetStep === 'email' ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm">Email Address</label>
                  <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Enter your email" className="w-full px-3 py-2 rounded bg-neutral-700 outline-none" />
                </div>
                <button type="submit" className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500">Send Code</button>
                <button type="button" onClick={() => setShowReset(false)} className="w-full py-2 rounded bg-neutral-700 hover:bg-neutral-600">Cancel</button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm">Verification Code</label>
                  <input type="text" required value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="Enter code from email" className="w-full px-3 py-2 rounded bg-neutral-700 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm">New Password</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full px-3 py-2 rounded bg-neutral-700 outline-none" />
                </div>
                <button type="submit" className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500">Reset Password</button>
                <button type="button" onClick={() => { setShowReset(false); setResetStep('email'); setResetMessage('') }} className="w-full py-2 rounded bg-neutral-700 hover:bg-neutral-600">Cancel</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
