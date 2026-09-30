import { useState, useEffect } from "react";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function SignInForm() {
  const { login, verify2FA, resendWhatsApp2FA } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 2-Step Verification State
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorMethods, setTwoFactorMethods] = useState<string[]>(["whatsapp", "authenticator"]);
  const [active2FAMethod, setActive2FAMethod] = useState<"whatsapp" | "authenticator">("whatsapp");
  const [phoneMasked, setPhoneMasked] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendingOtp, setResendingOtp] = useState(false);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const getFrontendUrl = () => {
    if (window.location.hostname === "localhost") {
      return window.location.port === "5173" ? "http://localhost:5174" : "http://localhost:5173";
    }
    return "/";
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const challenge = await login(email, password);
      if (challenge.require2FA && challenge.twoFactorToken) {
        setTwoFactorToken(challenge.twoFactorToken);
        setTwoFactorMethods(challenge.methods || ["whatsapp", "authenticator"]);
        setPhoneMasked(challenge.phoneMasked || "+91 ******3648");
        if (challenge.methods?.includes("whatsapp")) {
          setActive2FAMethod("whatsapp");
          setResendCooldown(30);
          toast.success("Security OTP sent to your WhatsApp number!");
        } else {
          setActive2FAMethod("authenticator");
        }
        setStep("2fa");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await verify2FA(twoFactorToken, twoFactorCode.trim(), active2FAMethod);
      toast.success("Verification successful! Welcome back.");
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendWhatsApp = async () => {
    if (resendCooldown > 0 || resendingOtp) return;
    try {
      setResendingOtp(true);
      setError("");
      const msg = await resendWhatsApp2FA(twoFactorToken);
      setResendCooldown(30);
      toast.success(msg || "New OTP dispatched to your WhatsApp number!");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
      toast.error(err.message || "Failed to resend OTP");
    } finally {
      setResendingOtp(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("credentials");
    setTwoFactorCode("");
    setError("");
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <a
          href={getFrontendUrl()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
        >
          <ChevronLeftIcon className="size-5" />
          Back to Home
        </a>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          {/* STEP 1: Email & Password Form */}
          {step === "credentials" ? (
            <>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-black text-gray-900 text-title-sm dark:text-white sm:text-title-md tracking-tight">
                  Sign In to Selectt Admin
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email and password to access the portal.
                </p>
              </div>

              <form onSubmit={handleCredentialsSubmit}>
                <div className="space-y-6">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl font-medium">
                      {error}
                    </div>
                  )}
                  <div>
                    <Label>
                      Email <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="admin@selectt.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>
                      Password <span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <div>
                    <Button className="w-full" size="sm" disabled={loading} type="submit">
                      {loading ? "Verifying credentials..." : "Sign in"}
                    </Button>
                  </div>
                </div>
              </form>
            </>
          ) : (
            /* STEP 2: Two-Step Verification Form */
            <div className="animate-fadeIn">
              <div className="mb-6 text-center">
                <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20 text-2xl">
                  🛡️
                </div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Two-Step Verification
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  Enter the 6-digit security code to verify your identity.
                </p>
              </div>

              {/* Method Switcher Tabs */}
              {twoFactorMethods.length > 1 && (
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setActive2FAMethod("whatsapp");
                      setError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      active2FAMethod === "whatsapp"
                        ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                    }`}
                  >
                    <span>💬 WhatsApp OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActive2FAMethod("authenticator");
                      setError("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      active2FAMethod === "authenticator"
                        ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                    }`}
                  >
                    <span>🔐 Authenticator App</span>
                  </button>
                </div>
              )}

              {/* Active Method Context Banner */}
              <div className="p-3.5 mb-5 rounded-xl border text-xs leading-relaxed font-medium bg-slate-50 dark:bg-gray-800/60 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-300">
                {active2FAMethod === "whatsapp" ? (
                  <div className="flex items-center gap-2">
                    <span className="text-base">📲</span>
                    <span>
                      6-digit OTP sent to WhatsApp number:{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{phoneMasked}</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🔑</span>
                    <span>
                      Open <strong>Google Authenticator</strong> or your 2FA app on your phone and enter the active 6-digit code.
                    </span>
                  </div>
                )}
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-5">
                {error && (
                  <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl font-semibold">
                    {error}
                  </div>
                )}

                <div>
                  <Label>
                    6-Digit Security Code <span className="text-error-500">*</span>
                  </Label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    maxLength={6}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.6em] font-mono text-2xl font-black rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:border-brand-500 focus:outline-none shadow-2xs"
                    value={twoFactorCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                      setTwoFactorCode(val);
                    }}
                  />
                </div>

                <div>
                  <Button className="w-full" size="sm" disabled={loading || twoFactorCode.length !== 6} type="submit">
                    {loading ? "Verifying code..." : "Verify & Sign In"}
                  </Button>
                </div>

                {/* WhatsApp Resend Link */}
                {active2FAMethod === "whatsapp" && (
                  <div className="text-center pt-1">
                    {resendCooldown > 0 ? (
                      <p className="text-xs text-gray-400">
                        Resend WhatsApp code in <strong className="text-gray-600 dark:text-gray-300">{resendCooldown}s</strong>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendWhatsApp}
                        disabled={resendingOtp}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer underline transition-colors"
                      >
                        {resendingOtp ? "Sending new OTP..." : "Resend OTP via WhatsApp"}
                      </button>
                    )}
                  </div>
                )}

                {/* Back to credentials link */}
                <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer transition-colors"
                  >
                    ← Back to Email Sign In
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <div className="w-full max-w-md pb-6 mx-auto text-center mt-auto">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Selectt Developed & Maintained by{" "}
          <a
            href="https://www.wepnex.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-500 hover:text-brand-600 font-semibold transition-colors"
          >
            Wepnex
          </a>
        </p>
      </div>
    </div>
  );
}
