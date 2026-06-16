import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Eye, EyeOff, ShoppingBag, TrendingUp, CheckCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import BrandLogo from "@/components/shared/BrandLogo";
import VendorKYC from "@/pages/VendorKYC";

const ACCOUNT_TYPES = [
  {
    value: "vendor",
    icon: ShoppingBag,
    title: "Vendor Account",
    subtitle: "Sell products",
    perks: ["List & manage products", "Access vendor dashboard", "Tap into affiliate network"],
    color: "#001845",
    bg: "#001845",
  },
  {
    value: "affiliate",
    icon: TrendingUp,
    title: "Affiliate Account",
    subtitle: "Promote & earn",
    perks: ["Generate referral links", "Track commissions", "Earn up to 50% commission"],
    color: "#81C14B",
    bg: "#81C14B",
  },
];

function PasswordInput({ id, value, onChange, autoComplete, placeholder, required }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pl-10 pr-10 h-12"
        required={required}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function Register() {
  const [step, setStep] = useState("type"); // "type" | "form" | "kyc" | "otp"
  const [accountType, setAccountType] = useState("");
  const [kycData, setKycData] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleTypeSelect = (type) => {
    setAccountType(type);
    setStep("form");
  };

  const handleKycComplete = (data) => {
    setKycData(data);
    setStep("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    // Vendor must complete KYC first
    if (accountType === "vendor" && !kycData) {
      setStep("kyc");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
        await base44.auth.updateMe({ role: accountType });
        // Send welcome email (fire-and-forget)
        base44.functions.invoke('sendWelcomeEmail', { role: accountType }).catch(() => {});
      }
      window.location.href = accountType === "vendor" ? "/vendor" : "/affiliate";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/");
  };

  // ── OTP Step ──
  if (step === "otp") {
    return (
      <AuthLayout icon={Mail} title="Verify your email" subtitle={`We sent a code to ${email}`}>
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Verify & Continue"}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">Resend</button>
        </p>
      </AuthLayout>
    );
  }

  // ── Vendor KYC Step ──
  if (step === "kyc") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-full max-w-xl">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl shadow-md p-3">
              <BrandLogo size={36} linkTo="/" />
            </div>
          </div>
          <VendorKYC onComplete={handleKycComplete} />
          <p className="text-center text-sm text-muted-foreground mt-4">
            <button onClick={() => setStep("form")} className="font-medium hover:underline" style={{ color: '#001845' }}>
              ← Back to registration
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── Account Type Selection Step ──
  if (step === "type") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl shadow-md p-3">
              <BrandLogo size={40} linkTo="/" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#001845' }}>Create your account</h1>
            <p className="text-muted-foreground mt-2">Choose how you'd like to join Plenty Value</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeSelect(type.value)}
                className="group text-left bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-current p-7 transition-all duration-200 hover:shadow-xl"
                style={{ '--tw-border-opacity': 1 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = type.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ backgroundColor: type.bg + '18' }}>
                  <type.icon className="w-7 h-7" style={{ color: type.color }} />
                </div>
                <h3 className="font-bold text-xl mb-1" style={{ color: '#001845' }}>{type.title}</h3>
                <p className="text-sm text-muted-foreground mb-5">{type.subtitle}</p>
                <ul className="space-y-2">
                  {type.perks.map((perk, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: type.color }} />
                      {perk}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold" style={{ color: type.color }}>
                  Get started <span>→</span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-medium hover:underline" style={{ color: '#001845' }}>Log in</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Registration Form Step ──
  const selected = ACCOUNT_TYPES.find(t => t.value === accountType);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#f8fafc' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-2xl shadow-md p-3">
            <BrandLogo size={36} linkTo="/" />
          </div>
        </div>

        {/* Account type indicator */}
        {selected && (
          <div className="flex items-center gap-3 bg-white rounded-xl border p-3 mb-5 shadow-sm cursor-pointer" onClick={() => setStep("type")}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: selected.bg + '18' }}>
              <selected.icon className="w-5 h-5" style={{ color: selected.color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#001845' }}>{selected.title}</p>
              <p className="text-xs text-muted-foreground">Click to change account type</p>
            </div>
            <span className="text-xs text-muted-foreground">← Change</span>
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#001845' }}>Create your account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sign up to get started</p>
        </div>

        {/* KYC completed indicator for vendors */}
        {accountType === "vendor" && kycData && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
            <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#81C14B' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">KYC Completed</p>
              <p className="text-xs text-green-600">{kycData.businessName} · {kycData.country}</p>
            </div>
            <button onClick={() => setStep("kyc")} className="text-xs text-muted-foreground hover:underline">Edit</button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">or</span>
            </div>
          </div>
          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <PasswordInput id="confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full h-12 font-medium text-white" style={{ backgroundColor: selected?.color || '#001845' }} disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</>
              ) : accountType === "vendor" && !kycData ? (
                "Continue to KYC Verification →"
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-medium hover:underline" style={{ color: '#001845' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}