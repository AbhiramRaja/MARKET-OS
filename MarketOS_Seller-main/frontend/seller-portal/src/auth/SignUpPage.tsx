import { useState } from "react";
import { signUp, confirmSignUp, autoSignIn } from "aws-amplify/auth";
import { API_BASE_URL } from "../config/api";

interface SignUpPageProps {
  onSwitchToSignIn: () => void;
}

interface StoreLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  addressProof: File | null;
  addressProofPreview: string;
}

export default function SignUpPage({ onSwitchToSignIn }: SignUpPageProps) {
  // Step control
  const [currentStep, setCurrentStep] = useState(1);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  
  // Step 1: Owner & Business Details
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [category, setCategory] = useState("Electronics");
  
  // Step 2: Store Locations
  const [locations, setLocations] = useState<StoreLocation[]>([
    { address: "", city: "", state: "", pincode: "", addressProof: null, addressProofPreview: "" }
  ]);
  
  // Step 3: Document Verification
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  // @ts-expect-error - Reserved for future S3 upload implementation
  const [gstDocument, setGstDocument] = useState<File | null>(null);
  // @ts-expect-error - Reserved for future S3 upload implementation
  const [panDocument, setPanDocument] = useState<File | null>(null);
  const [businessLicense, setBusinessLicense] = useState<File | null>(null);
  const [gstPreview, setGstPreview] = useState("");
  const [panPreview, setPanPreview] = useState("");
  const [licensePreview, setLicensePreview] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper functions
  const addLocation = () => {
    setLocations([...locations, { address: "", city: "", state: "", pincode: "", addressProof: null, addressProofPreview: "" }]);
  };

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      setLocations(locations.filter((_, i) => i !== index));
    }
  };

  const updateLocation = (index: number, field: keyof StoreLocation, value: any) => {
    const newLocations = [...locations];
    newLocations[index] = { ...newLocations[index], [field]: value };
    setLocations(newLocations);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void, previewSetter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
        // Clear error when file is uploaded
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressProofChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update locations state with BOTH file and preview at the same time
        setLocations(prevLocations => {
          const newLocations = [...prevLocations];
          newLocations[index] = {
            ...newLocations[index],
            addressProof: file,
            addressProofPreview: reader.result as string
          };
          console.log('File uploaded for location', index, ':', file.name);
          console.log('Updated locations:', newLocations);
          return newLocations;
        });
        // Clear error when file is uploaded
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step validation
  const validateStep1 = () => {
    if (!ownerFirstName.trim()) {
      setError("❌ Please enter your first name");
      return false;
    }
    if (!ownerLastName.trim()) {
      setError("❌ Please enter your last name");
      return false;
    }
    if (!businessName.trim()) {
      setError("❌ Please enter your business name");
      return false;
    }
    if (!phone.trim() || phone.length < 10) {
      setError("❌ Please enter a valid phone number");
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError("❌ Please enter a valid email address");
      return false;
    }
    if (password.length < 8) {
      setError("❌ Password must be at least 8 characters long");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError("❌ Password must include at least one uppercase letter");
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setError("❌ Password must include at least one lowercase letter");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError("❌ Password must include at least one number");
      return false;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError("❌ Password must include at least one special character (!@#$%^&* etc)");
      return false;
    }
    if (password !== confirmPassword) {
      setError("❌ Passwords do not match");
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    console.log('Validating Step 2, locations:', locations);
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      console.log(`Location ${i}:`, loc);
      console.log(`Location ${i} addressProof:`, loc.addressProof);
      if (!loc.address.trim()) {
        setError(`❌ Please enter address for location ${i + 1}`);
        return false;
      }
      if (!loc.city.trim()) {
        setError(`❌ Please enter city for location ${i + 1}`);
        return false;
      }
      if (!loc.state.trim()) {
        setError(`❌ Please enter state for location ${i + 1}`);
        return false;
      }
      if (!loc.pincode.trim() || loc.pincode.length !== 6) {
        setError(`❌ Please enter valid 6-digit pincode for location ${i + 1}`);
        return false;
      }
      if (!loc.addressProof) {
        console.log(`No address proof found for location ${i + 1}`);
        setError(`❌ Please upload address proof for location ${i + 1}`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const validateStep3 = () => {
    if (!gstNumber.trim() && !panNumber.trim() && !businessLicense) {
      setError("❌ Please provide at least one business document (GST/PAN/License)");
      return false;
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    console.log('=== Starting Signup ===');
    console.log('Environment Config:', {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      clientId: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION
    });
    
    // Simple validation
    if (password.length < 8) {
      setError("❌ Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("❌ Password must include at least one uppercase letter.");
      setLoading(false);
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("❌ Password must include at least one lowercase letter.");
      setLoading(false);
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("❌ Password must include at least one number.");
      setLoading(false);
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError("❌ Password must include at least one special character (!@#$%^&* etc).");
      setLoading(false);
      return;
    }
    
    try {
      // Create account with AWS Cognito
      console.log('Calling signUp with email:', email);
      console.log('Password length:', password.length);
      console.log('Password has uppercase:', /[A-Z]/.test(password));
      console.log('Password has lowercase:', /[a-z]/.test(password));
      console.log('Password has number:', /[0-9]/.test(password));
      
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: businessName,
          },
        },
      });
      
      setNeedsConfirmation(true);
      setSuccess("✅ Account created! Please check your email for verification code.");
    } catch (err: any) {
      console.error('❌ Signup Error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      
      if (err.name === 'UsernameExistsException') {
        setError("❌ An account with this email already exists. Please sign in instead.");
      } else if (err.name === 'InvalidPasswordException') {
        setError("❌ Password must be at least 8 characters with uppercase, lowercase, and numbers.");
      } else if (err.name === 'InvalidParameterException') {
        setError(`❌ Invalid parameter: ${err.message}`);
      } else {
        setError(`❌ ${err.message || "Sign-up failed. Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });
      
      console.log('✅ Email confirmed successfully');
      
      // Try auto sign-in (may fail, but we'll handle it)
      try {
        await autoSignIn();
        console.log('✅ Auto sign-in successful');
      } catch (autoSignInErr: any) {
        console.log('⚠️ Auto sign-in skipped:', autoSignInErr.message);
        // This is OK, user can manually sign in later
      }
      
      // Create seller record in DynamoDB
      try {
        const sellerData = {
          email,
          sellerId: `seller_${Date.now()}`,
          ownerFirstName,
          ownerLastName,
          businessName,
          phone,
          category,
          locations: locations.map(loc => ({
            address: loc.address,
            city: loc.city,
            state: loc.state,
            pincode: loc.pincode,
            addressProofUrl: loc.addressProofPreview // In production, upload to S3
          })),
          gstNumber,
          panNumber,
          documents: {
            gstUrl: gstPreview, // In production, upload to S3
            panUrl: panPreview,
            licenseUrl: licensePreview
          },
          verified: false,
          verificationStatus: 'pending',
          documentsSubmitted: true,
          joinedDate: new Date().toISOString(),
          rating: 0
        };
        
        // Store in localStorage for quick access
        localStorage.setItem('currentSeller', JSON.stringify(sellerData));
        localStorage.setItem('sellerEmail', email);
        localStorage.setItem('sellerLoggedIn', 'true');
        localStorage.setItem('verificationStatus', 'pending');
        localStorage.setItem('documentsSubmitted', 'false');
        
        // Create seller in backend (DynamoDB)
        await fetch(`${API_BASE_URL}/sellers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sellerData)
        });
      } catch (error) {
        console.error('Failed to create seller record:', error);
      }
      
      setSuccess("✅ Email verified! Redirecting to document verification...");
      // Redirect to home page (which will show document upload for new users)
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      if (err.name === 'CodeMismatchException') {
        setError("❌ Invalid verification code. Please check and try again.");
      } else if (err.name === 'ExpiredCodeException') {
        setError("❌ Verification code expired. Please request a new one.");
      } else {
        setError(`❌ ${err.message || "Verification failed."}`);
      }
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white">
        <form onSubmit={handleConfirmSignUp} className="w-full max-w-sm space-y-4 p-6 rounded-xl bg-neutral-800">
          <h1 className="text-2xl font-semibold">📧 Verify Your Email</h1>
          
          {success && (
            <div className="text-sm bg-green-600/20 border border-green-500 rounded p-2">
              {success}
            </div>
          )}
          
          {error && (
            <div className="text-sm bg-red-600/20 border border-red-500 rounded p-2">
              {error}
            </div>
          )}
          
          <p className="text-sm text-gray-400">
            We sent a verification code to <strong>{email}</strong>
          </p>
          
          <div className="space-y-2">
            <label className="block text-sm">Verification Code</label>
            <input
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              type="text"
              required
              placeholder="Enter 6-digit code"
              className="w-full px-3 py-2 rounded bg-neutral-700 outline-none"
            />
          </div>
          
          <button
            disabled={loading}
            className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify Email"}
          </button>
          
          <button
            type="button"
            onClick={() => setNeedsConfirmation(false)}
            className="w-full text-sm text-gray-400 hover:text-white"
          >
            ← Back to sign up
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white py-8">
      <form onSubmit={(e) => { e.preventDefault(); if (currentStep === 3 && validateStep3()) handleSignUp(e); }} className="w-full max-w-3xl space-y-6 p-8 rounded-xl bg-neutral-800 my-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">🚀 Create Seller Account</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-emerald-600' : 'bg-gray-700'}`}>1</div>
              <span className="text-sm font-semibold hidden md:inline">Owner & Business</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-700"></div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-emerald-600' : 'bg-gray-700'}`}>2</div>
              <span className="text-sm font-semibold hidden md:inline">Store Locations</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-700"></div>
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-emerald-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-emerald-600' : 'bg-gray-700'}`}>3</div>
              <span className="text-sm font-semibold hidden md:inline">Documents</span>
            </div>
          </div>
        </div>
        
        {success && (
          <div className="text-sm bg-green-600/20 border border-green-500 rounded p-3">
            {success}
          </div>
        )}
        
        {error && (
          <div className="text-sm bg-red-600/20 border border-red-500 rounded p-3">
            {error}
          </div>
        )}
        
        {/* STEP 1: Owner & Business Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-emerald-400">� Owner & Business Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">First Name *</label>
                <input
                  value={ownerFirstName}
                  onChange={(e) => setOwnerFirstName(e.target.value)}
                  type="text"
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Last Name *</label>
                <input
                  value={ownerLastName}
                  onChange={(e) => setOwnerLastName(e.target.value)}
                  type="text"
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Business Name *</label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                type="text"
                placeholder="Tech Galaxy Store"
                className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Phone Number *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Electronics">💻 Electronics</option>
                  <option value="Fashion">👕 Fashion</option>
                  <option value="Home & Kitchen">🏠 Home & Kitchen</option>
                  <option value="Sports">⚽ Sports</option>
                  <option value="Books">📚 Books</option>
                  <option value="Beauty">💄 Beauty</option>
                  <option value="Toys">🧸 Toys</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email Address *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="seller@example.com"
                className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Password *</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Min 8 chars with special char"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-400">Must include uppercase, lowercase, number, and special character (!@#$%^&*)</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Confirm Password *</label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* STEP 2: Store Locations */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-emerald-400">📍 Store Locations</h2>
              <button
                type="button"
                onClick={addLocation}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-colors"
              >
                <span className="text-xl">+</span> Add Location
              </button>
            </div>
            
            {locations.map((location, index) => (
              <div key={index} className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-700 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">Location {index + 1}</h3>
                  {locations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLocation(index)}
                      className="text-red-400 hover:text-red-300 font-semibold"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Street Address *</label>
                  <input
                    value={location.address}
                    onChange={(e) => updateLocation(index, 'address', e.target.value)}
                    type="text"
                    placeholder="Shop no., Building, Street"
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">City *</label>
                    <input
                      value={location.city}
                      onChange={(e) => updateLocation(index, 'city', e.target.value)}
                      type="text"
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">State *</label>
                    <input
                      value={location.state}
                      onChange={(e) => updateLocation(index, 'state', e.target.value)}
                      type="text"
                      placeholder="Maharashtra"
                      className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Pincode *</label>
                    <input
                      value={location.pincode}
                      onChange={(e) => updateLocation(index, 'pincode', e.target.value)}
                      type="text"
                      placeholder="400001"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Address Proof (Image/PDF) *</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleAddressProofChange(index, e)}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer hover:file:bg-emerald-500"
                  />
                  {location.addressProofPreview && (
                    <div className="mt-2 p-2 bg-emerald-900/20 border border-emerald-500 rounded text-sm text-emerald-400">
                      ✓ Document uploaded successfully
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* STEP 3: Document Verification */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-emerald-400">� Document Verification</h2>
            <p className="text-gray-400 text-sm">Upload at least one business document to verify your business legitimacy</p>
            
            <div className="space-y-4">
              <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-700 space-y-3">
                <h3 className="text-lg font-semibold text-white">GST Certificate</h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">GST Number</label>
                  <input
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    type="text"
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Upload GST Certificate</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, setGstDocument, setGstPreview)}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer hover:file:bg-emerald-500"
                  />
                  {gstPreview && (
                    <div className="mt-2 p-2 bg-emerald-900/20 border border-emerald-500 rounded text-sm text-emerald-400">
                      ✓ GST certificate uploaded
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-700 space-y-3">
                <h3 className="text-lg font-semibold text-white">PAN Card</h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">PAN Number</label>
                  <input
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    type="text"
                    placeholder="ABCDE1234F"
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Upload PAN Card</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, setPanDocument, setPanPreview)}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer hover:file:bg-emerald-500"
                  />
                  {panPreview && (
                    <div className="mt-2 p-2 bg-emerald-900/20 border border-emerald-500 rounded text-sm text-emerald-400">
                      ✓ PAN card uploaded
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-700 space-y-3">
                <h3 className="text-lg font-semibold text-white">Business License</h3>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Upload Business License/Registration</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFileChange(e, setBusinessLicense, setLicensePreview)}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-700 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:text-white file:cursor-pointer hover:file:bg-emerald-500"
                  />
                  {licensePreview && (
                    <div className="mt-2 p-2 bg-emerald-900/20 border border-emerald-500 rounded text-sm text-emerald-400">
                      ✓ Business license uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 rounded-lg bg-neutral-700 hover:bg-neutral-600 font-semibold transition-colors"
            >
              ← Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-sm text-emerald-400 hover:text-emerald-300 underline"
            >
              Already have an account? Sign in
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold transition-colors ml-auto"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 font-semibold transition-colors ml-auto"
            >
              {loading ? "Creating Account…" : "Create Account 🚀"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
