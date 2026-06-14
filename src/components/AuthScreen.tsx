import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  Key, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  Mail, 
  Smartphone, 
  Lock, 
  Phone, 
  ArrowRight, 
  UserPlus 
} from 'lucide-react';
import { signInWithGoogle, auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';

interface AuthScreenProps {
  onSuccess: (user: any) => void;
  onContinueAsGuest?: () => void;
}

type AuthMethod = 'google' | 'gmail' | 'phone';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, onContinueAsGuest }) => {
  const [activeMethod, setActiveMethod] = useState<AuthMethod>('google');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gmail (Email/Password) states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Phone states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any | null>(null);

  // Initialize invisible recaptcha for phone authentication
  useEffect(() => {
    return () => {
      // Cleanup recaptcha in case of unmounting
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
        } catch (e) {
          console.error("Error clearing recaptcha verifier:", e);
        }
      }
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onSuccess(user);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Authentication popup blocked or declined by user.");
    } finally {
      setLoading(false);
    }
  };

  const handleGmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both Email/Gmail address and password.");
      return;
    }
    if (!email.includes('@')) {
      setError("Please enter a valid Gmail or Email ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onSuccess(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(userCredential.user);
      }
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/user-not-found') {
        setError("Account not found. Select 'Sign Up' first if you are registering a new Gmail account.");
      } else if (err?.code === 'auth/wrong-password') {
        setError("Incorrect security password. Please re-type your credential.");
      } else if (err?.code === 'auth/email-already-in-use') {
        setError("This Gmail address is already registered. Please sign in instead.");
      } else if (err?.code === 'auth/configuration-not-found') {
        setError("Email/Password authentication provider is not enabled in Firebase Console. Go to Build > Authentication > Sign-in method and enable Email/Password.");
      } else {
        setError(err?.message || "Authentication failed. Please verify credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const initRecaptcha = () => {
    try {
      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'phone-signin-recaptcha-container', {
          size: 'invisible',
          callback: () => {
            addLogs("reCAPTCHA validation solved.");
          }
        });
      }
    } catch (error) {
      console.error("Recaptcha initialization failed:", error);
    }
  };

  const addLogs = (text: string) => {
    console.log(`[AuthScreen] ${text}`);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError("Please provide a valid phone number (including country code, e.g. +11234567890).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      initRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      if (!appVerifier) {
        throw new Error("reCAPTCHA verifier could not be initialized.");
      }

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/invalid-phone-number') {
        setError("Invalid phone format. Please specify absolute standard E.164 form (e.g. +14155552671).");
      } else if (err?.code === 'auth/configuration-not-found') {
        setError("Phone authentication provider is not enabled in Firebase Console. Go to Build > Authentication > Sign-in method and enable Phone.");
      } else {
        setError(err?.message || "System failed to transmit SMS Verification wave.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setError("Please key in the 6-digit confirmation code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!confirmationResult) {
        throw new Error("SMS verification session expired. Please request another OTP.");
      }
      const userCredential = await confirmationResult.confirm(otpCode);
      onSuccess(userCredential.user);
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/invalid-verification-code') {
        setError("Incorrect SMS passcode. Please re-enter or request another wave.");
      } else {
        setError(err?.message || "OTP signature authorization failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPhoneForm = () => {
    setOtpSent(false);
    setConfirmationResult(null);
    setOtpCode('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-[#04000f] flex flex-col items-center justify-center z-50 overflow-hidden select-none px-4">
      
      {/* Invisible container requested by recaptcha verifier */}
      <div id="phone-signin-recaptcha-container"></div>
      
      {/* High-visibility background celestial nebula */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-cyan-700/15 blur-[120px] animate-pulse" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-purple-700/15 blur-[110px]" />

      {/* Frame panel */}
      <div id="auth-portal-card" className="w-full max-w-sm rounded-2xl glass-panel-heavy p-6 border border-purple-500/15 relative overflow-hidden flex flex-col items-center text-center space-y-5">
        
        {/* Animated Orbits */}
        <div className="absolute w-60 h-60 border border-purple-500/10 rounded-full animate-[spin_30s_linear_infinite]" />
        <div className="absolute w-44 h-44 border-2 border-dashed border-cyan-500/5 rounded-full animate-[spin_12s_linear_infinite_reverse]" />

        {/* Title branding */}
        <div className="relative">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#0b0021] flex items-center justify-center border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <LogIn className="h-6 w-6 text-cyan-400" />
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-purple-300 animate-bounce" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-indigo-400 uppercase">
            SECURE ACCESS
          </h2>
          <p className="text-[10px] text-purple-400/70 font-mono tracking-widest uppercase mt-1">
            Superintelligence Mainframe Login
          </p>
        </div>

        {/* Method selection tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#0d0720]/90 p-1 rounded-xl w-full border border-purple-500/10 relative z-10">
          <button
            onClick={() => { setActiveMethod('google'); setError(null); }}
            className={`py-2 px-1 rounded-lg text-[10px] uppercase font-bold font-mono tracking-wider transition-all cursor-pointer ${
              activeMethod === 'google' 
                ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-200 border border-cyan-500/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Google
          </button>
          <button
            onClick={() => { setActiveMethod('gmail'); setError(null); }}
            className={`py-2 px-1 rounded-lg text-[10px] uppercase font-bold font-mono tracking-wider transition-all cursor-pointer ${
              activeMethod === 'gmail' 
                ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-200 border border-cyan-500/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Gmail ID
          </button>
          <button
            onClick={() => { setActiveMethod('phone'); setError(null); }}
            className={`py-2 px-1 rounded-lg text-[10px] uppercase font-bold font-mono tracking-wider transition-all cursor-pointer ${
              activeMethod === 'phone' 
                ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-200 border border-cyan-500/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {/* Display Alert error */}
        {error && (
          <div className="flex items-start space-x-2 bg-rose-950/30 text-rose-400 text-left p-3 rounded-xl border border-rose-500/20 w-full animate-shake relative z-10">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-[10px] font-mono leading-relaxed break-words flex-1">
              {error}
            </p>
          </div>
        )}

        {/* Auth Body rendering */}
        <div className="w-full relative z-10">
          {activeMethod === 'google' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-white/5 space-y-1.5 text-left w-full">
                <div className="flex items-center space-x-1.5 text-cyan-400 text-[11px] font-mono font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>CLOUD SYNCHRONIZATION</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Fast single-tap secure sign-in via your Google account credentials. Keeps notes, canvas boards, and dialogue records synced to the cloud.
                </p>
              </div>

              <button
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-bold font-mono tracking-wider text-xs uppercase cursor-pointer active:scale-98 transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/35 hover:to-purple-500/35 text-cyan-200 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-4 w-4 text-cyan-400" />
                    <span>Sign In With Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeMethod === 'gmail' && (
            <form onSubmit={handleGmailSignIn} className="space-y-3">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-500/50" />
                  <input
                    type="email"
                    placeholder="Enter Gmail (e.g. user@gmail.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0b051e] border border-cyan-500/20 focus:border-cyan-400 rounded-xl text-xs font-mono text-cyan-200 focus:outline-none placeholder-slate-600 transition-all text-left"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-500/50" />
                  <input
                    type="password"
                    placeholder="Enter Secure Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0b051e] border border-cyan-500/20 focus:border-cyan-400 rounded-xl text-xs font-mono text-cyan-200 focus:outline-none placeholder-slate-600 transition-all text-left"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono select-none px-1">
                <span className="text-slate-500">
                  {isSignUp ? "Already registered?" : "New to AI Universe?"}
                </span>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="text-cyan-400 hover:text-cyan-300 underline uppercase tracking-wider cursor-pointer font-bold"
                >
                  {isSignUp ? "Sign In Instead" : "Create Account / Register"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-bold font-mono tracking-wider text-xs uppercase cursor-pointer active:scale-98 transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/35 hover:to-purple-500/35 text-cyan-200 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? <UserPlus className="h-4 w-4 text-cyan-400" /> : <LogIn className="h-4 w-4 text-cyan-400" />}
                    <span>{isSignUp ? "Register Mainframe Account" : "Access with Gmail ID"}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {activeMethod === 'phone' && (
            <div className="space-y-3">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <p className="text-[10px] text-slate-400 text-left leading-relaxed">
                    Verify connection via mobile telecommunications carrier. Provide national carrier prefix code (e.g. <span className="text-cyan-400">+1</span>4155552671).
                  </p>
                  
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-500/50" />
                    <input
                      type="tel"
                      placeholder="e.g. +14155552671"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0b051e] border border-cyan-500/20 focus:border-cyan-400 rounded-xl text-xs font-mono text-cyan-200 focus:outline-none placeholder-slate-600 transition-all text-left"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl font-bold font-mono tracking-wider text-xs uppercase cursor-pointer active:scale-98 transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/35 hover:to-purple-500/35 text-cyan-200 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Transmit SMS OTP Pass</span>
                        <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <p className="text-[10px] text-slate-400 text-left leading-relaxed">
                    Uplink broadcast success. Enter the 6-digit decryption passkey dispatched to <span className="text-cyan-400">{phoneNumber}</span>.
                  </p>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-500/50" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit Code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0b051e] border border-cyan-500/20 focus:border-cyan-400 rounded-xl text-xs font-mono text-center tracking-[0.5em] text-cyan-300 focus:outline-none placeholder-slate-700 transition-all font-bold"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono select-none px-1">
                    <button
                      type="button"
                      onClick={resetPhoneForm}
                      className="text-slate-500 hover:text-slate-300 hover:underline uppercase tracking-wider cursor-pointer"
                    >
                      Change Number
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { resetPhoneForm(); handleSendOtp(e); }}
                      className="text-cyan-400 hover:text-cyan-300 underline uppercase tracking-wider cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-xl font-bold font-mono tracking-wider text-xs uppercase cursor-pointer active:scale-98 transition-all flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/35 hover:to-purple-500/35 text-cyan-200 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 text-cyan-400" />
                        <span>Authorize SMS Key</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {onContinueAsGuest && (
            <button
              onClick={onContinueAsGuest}
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-transparent hover:bg-white/5 rounded-xl text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-all cursor-pointer block"
            >
              Continue as Explorer
            </button>
          )}
        </div>
      </div>

      <span className="absolute bottom-6 font-mono text-[9px] text-purple-500/30 uppercase tracking-widest text-center max-w-xs px-4">
        SECURE PROTOCOL CLOUD-V1 // PLANAR-SURFER-PLKQP
        <br />
        <span className="text-[8px] opacity-60">Enable Email/Password & Phone providers in your Firebase console</span>
      </span>
    </div>
  );
};

