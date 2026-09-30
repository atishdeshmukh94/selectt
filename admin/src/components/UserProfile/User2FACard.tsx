import { useState } from "react";
import { API_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

interface Props {
  profile: any;
  onSave: () => void;
}

export default function User2FACard({ profile, onSave }: Props) {
  const { token, user: currentUser } = useAuth();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; otpauthUrl: string; qrCodeUrl: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const isSelf = !profile || profile.id === currentUser?.id;
  const is2FAActive = profile?.two_factor_enabled === 1 || Boolean(profile?.totp_secret);

  const handleStartSetup = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/2fa/generate-secret`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: profile?.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSetupData(data);
        setIsSettingUp(true);
        setVerificationCode("");
      } else {
        toast.error(data.message || "Failed to generate Authenticator setup key");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit code from your app");
      return;
    }
    if (!setupData?.secret) return;

    try {
      setVerifying(true);
      const res = await fetch(`${API_URL}/api/user/2fa/enable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: profile?.id,
          secret: setupData.secret,
          code: verificationCode.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Google Authenticator enabled successfully!");
        setIsSettingUp(false);
        setSetupData(null);
        setVerificationCode("");
        onSave();
      } else {
        toast.error(data.message || "Invalid 6-digit code. Please try again.");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable Google Authenticator 2-Step Verification for this account?")) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/2fa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: profile?.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "Google Authenticator disabled");
        setIsSettingUp(false);
        onSave();
      } else {
        toast.error(data.message || "Failed to disable 2FA");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-brand-500 text-white flex items-center justify-center text-xl shadow-xs shrink-0">
            🔐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Two-Step Verification (Google Authenticator App)
              </h4>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  is2FAActive
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300"
                }`}
              >
                {is2FAActive ? "Active" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Secure {isSelf ? "your" : "this"} account using standard 6-digit TOTP codes generated by Google Authenticator, Microsoft Authenticator, or Authy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {is2FAActive ? (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={handleStartSetup}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                📱 Reconfigure App
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDisable2FA}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Disable 2FA
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleStartSetup}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>➕</span> Setup Google Authenticator
            </button>
          )}
        </div>
      </div>

      {/* Setup Wizard Modal */}
      {isSettingUp && setupData && (
        <div className="mt-5 p-5 bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-gray-800/60 dark:to-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/50 pb-3">
            <h5 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📲</span> Connect Google Authenticator
            </h5>
            <button
              type="button"
              onClick={() => setIsSettingUp(false)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-center md:text-left space-y-3">
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                1. Open <strong>Google Authenticator</strong> (or Microsoft Authenticator / Authy) on your smartphone.
                <br />
                2. Tap the <strong>"+"</strong> button and choose <strong>"Scan a QR code"</strong>.
              </p>

              <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Secret Key (Manual Entry):</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 break-all select-all">
                    {setupData.secret}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(setupData.secret);
                      toast.success("Secret key copied!");
                    }}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold cursor-pointer shrink-0"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm inline-block">
                <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="w-40 h-40 rounded-lg" />
              </div>
            </div>
          </div>

          <form onSubmit={handleVerifyAndEnable} className="pt-3 border-t border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Enter 6-Digit Code from App to Confirm & Activate:
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                placeholder="• • • • • •"
                className="w-full h-11 text-center tracking-[0.4em] font-mono text-lg font-black rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-900 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2 pt-5 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsSettingUp(false)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={verifying || verificationCode.length !== 6}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
              >
                {verifying ? "Verifying..." : "Verify & Activate 2FA"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
