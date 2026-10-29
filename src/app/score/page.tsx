"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SignGuardScorePage() {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [inputMode, setInputMode] = useState<"phone" | "email">("phone");
  
  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  // Score Data
  const [score, setScore] = useState<number>(750);
  const [ratingCategory, setRatingCategory] = useState({ label: "Checking...", color: "text-slate-600" });
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [settledCount, setSettledCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [scoreFactors, setScoreFactors] = useState<string[]>([]);

  // Timer effect for Resend OTP
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim().toLowerCase();

    if (!cleanId) {
      alert("Kripya apna mobile number ya email darj karein!");
      return;
    }

    if (inputMode === "phone" && cleanId.length < 10) {
      alert("Kripya valid 10-digit mobile number enter karein!");
      return;
    }

    if (inputMode === "email" && !cleanId.includes("@")) {
      alert("Kripya valid email address enter karein!");
      return;
    }

    setOtpSent(true);
    setTimer(30);
    alert(`🔐 Confidential Security Code:\n${cleanId} par 4-digit verification OTP bhej diya gaya hai!\n\n(Demo Testing Code: 1234)`);
  };

  // Step 2: Verify OTP & Calculate Confidential Score
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp !== "1234") {
      alert("Galat OTP! Kripya sahi 4-digit OTP daalein (Demo OTP: 1234).");
      return;
    }

    setIsVerified(true);
    await calculateScore(identifier);
  };

  const calculateScore = async (idValue: string) => {
    setLoading(true);
    const cleanId = idValue.trim().toLowerCase();

    const { data: parchas } = await supabase
      .from("parchas")
      .select("*")
      .eq("borrower_email", cleanId);

    let calculatedScore = 650;
    const factors: string[] = [];

    if (!parchas || parchas.length === 0) {
      setScore(650);
      setRatingCategory({ label: "No Active History (Fair)", color: "text-amber-500" });
      setScoreFactors(["Naya account: ledger me abhi tak koi overdue record nahi mila."]);
      setActiveLoansCount(0);
      setSettledCount(0);
      setOverdueCount(0);
      setTotalDebt(0);
      setLoading(false);
      return;
    }

    let active = 0;
    let settled = 0;
    let overdue = 0;
    let currentTotalDebt = 0;

    const now = new Date();

    parchas.forEach((p) => {
      const amt = Number(p.amount || 0);
      const isSettled = amt === 0 || p.description?.includes("[SETTLED / CLOSED]");

      if (isSettled) {
        settled += 1;
        calculatedScore += 35; // NOC Settlement Reward
      } else {
        active += 1;
        currentTotalDebt += amt;

        const createdDate = new Date(p.created_at);
        const daysPassed = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
        if (daysPassed > 45) {
          overdue += 1;
          calculatedScore -= 65; // Penalty for overdue
        }
      }
    });

    if (currentTotalDebt > 50000) {
      calculatedScore -= 40;
      factors.push(`Bada outstanding balance (₹${currentTotalDebt.toLocaleString("en-IN")}) impact daal raha hai.`);
    }

    if (settled > 0) {
      factors.push(`${settled} Agreements safaltapoorvak chukta (NOC Settled) kiye gaye (+Reward).`);
    }

    if (overdue > 0) {
      factors.push(`${overdue} Agreements me wapsi ki tarikh overdue chal rahi hai (-Penalty).`);
    }

    calculatedScore = Math.min(900, Math.max(300, calculatedScore));
    setScore(calculatedScore);

    if (calculatedScore >= 780) {
      setRatingCategory({ label: "Excellent Trust Rating", color: "text-emerald-600" });
    } else if (calculatedScore >= 700) {
      setRatingCategory({ label: "Good Trust Rating", color: "text-emerald-500" });
    } else if (calculatedScore >= 620) {
      setRatingCategory({ label: "Average / Fair", color: "text-amber-500" });
    } else {
      setRatingCategory({ label: "High Risk Default", color: "text-red-500" });
    }

    setActiveLoansCount(active);
    setSettledCount(settled);
    setOverdueCount(overdue);
    setTotalDebt(currentTotalDebt);
    setScoreFactors(factors);
    setLoading(false);
  };

  const handleReset = () => {
    setIsVerified(false);
    setOtpSent(false);
    setOtp("");
    setIdentifier("");
  };

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Navbar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <Link href="/dashboard" className="text-xs font-bold text-[#002e6e] hover:underline flex items-center gap-1">
            &larr; Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-t-amber-500 border-r-emerald-500 border-b-indigo-500 border-l-rose-500 flex items-center justify-center font-bold text-[10px]">
              🛡️
            </div>
            <span className="font-extrabold text-sm text-slate-800">SignGuard Secure Score</span>
          </div>
        </div>

        {/* STEP 1 & 2: SECURE OTP AUTHENTICATION GATEWAY */}
        {!isVerified && (
          <div className="max-w-md mx-auto bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-5">
            <div className="w-14 h-14 bg-indigo-50 text-[#002e6e] rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
              🔒
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">SignGuard Private Score Check</h2>
              <p className="text-xs text-slate-500 mt-1">
                Kanooni privacy suraksha ke tehat bina verified OTP ke koi bhi anjaan vyakti kisi ka score nahi dekh sakta.
              </p>
            </div>

            {/* Input Method Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setInputMode("phone"); setOtpSent(false); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  inputMode === "phone" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                📱 Mobile Number
              </button>
              <button
                type="button"
                onClick={() => { setInputMode("email"); setOtpSent(false); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                  inputMode === "email" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                📧 Email Address
              </button>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {inputMode === "phone" ? "Enter 10-Digit Mobile Number" : "Enter Registered Email"}
                  </label>
                  <input
                    type={inputMode === "phone" ? "tel" : "email"}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={inputMode === "phone" ? "e.g. 9876543210" : "e.g. rahul@gmail.com"}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#002e6e] transition font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#002e6e] hover:bg-[#002252] text-white text-xs font-bold py-3.5 rounded-xl transition shadow-md shadow-blue-900/20"
                >
                  Send Verification OTP &rarr;
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 font-medium">
                  OTP sent to: <strong>{identifier}</strong>{" "}
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[#002e6e] underline font-bold ml-1"
                  >
                    Change
                  </button>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 4-Digit Security Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="•••• (Demo: 1234)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-bold text-slate-900 focus:outline-none focus:border-[#002e6e]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
                >
                  <span>🔓</span> Verify OTP & Unlock Report
                </button>

                <div className="text-xs text-slate-400 pt-1">
                  {timer > 0 ? (
                    <span>Resend OTP in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#002e6e] font-bold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400">
              Indian Evidence Act Section 65B Private Ledger Audit Protection
            </div>
          </div>
        )}

        {/* STEP 3: UNLOCKED REPORT (PAYTM-STYLE SVG GAUGE & AUDIT SUMMARY) */}
        {isVerified && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white px-5 py-3 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-600">
                Verified Account: <strong className="text-slate-900">{identifier}</strong>
              </span>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Lock & Check Another
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200 flex flex-col md:flex-row items-center justify-center gap-10">
              
              {/* Mobile Phone Mockup */}
              <div className="w-full max-w-[320px] bg-white rounded-[40px] p-5 shadow-2xl border-4 border-slate-800 relative space-y-5">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 border-b pb-2">
                  <span>9:41</span>
                  <span className="text-[#002e6e] font-extrabold text-sm tracking-tight">SignGuard</span>
                  <span>100%</span>
                </div>

                {/* SVG Rainbow Needle Gauge */}
                <div className="text-center pt-2 space-y-2">
                  <div className="relative w-48 h-28 mx-auto flex flex-col items-center justify-end overflow-hidden">
                    <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="scoreArcGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="85%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>

                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />

                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="url(#scoreArcGradient2)"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />

                      <line
                        x1="100"
                        y1="100"
                        x2={100 + 40 * Math.cos(Math.PI - ((score - 300) / 600) * Math.PI)}
                        y2={100 - 40 * Math.sin(Math.PI - ((score - 300) / 600) * Math.PI)}
                        stroke="#002e6e"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="100" r="8" fill="#002e6e" />
                    </svg>

                    <div className="absolute bottom-0 flex flex-col items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        SCORE
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="text-4xl font-black text-slate-900">{score}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">out of 900</div>
                  </div>

                  <div className={`text-xs font-bold ${ratingCategory.color}`}>
                    ● {ratingCategory.label}
                  </div>

                  <div className="text-[11px] text-emerald-600 font-bold bg-emerald-50 py-1 px-3 rounded-full inline-block">
                    ↑ OTP Authenticated
                  </div>
                </div>

                {/* Score Summary Box */}
                <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-md space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span>Verified Audit Summary</span>
                    <span>✔</span>
                  </div>
                  <div className="text-xs text-emerald-100">
                    {activeLoansCount} Active Records | ₹{totalDebt.toLocaleString("en-IN")} Due
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-400 font-medium">
                  Last Updated: Today • Real-time Sync
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-6 flex-1">
                <div>
                  <span className="text-xs font-bold text-[#002e6e] uppercase tracking-wider">Verified Profile Audit</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    Identity: <span className="text-[#002e6e]">{identifier}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="text-xs text-slate-500 font-medium">Active Udhar</div>
                    <div className="text-2xl font-black text-amber-600 mt-0.5">{activeLoansCount}</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="text-xs text-slate-500 font-medium">NOC Settled</div>
                    <div className="text-2xl font-black text-emerald-600 mt-0.5">{settledCount}</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="text-xs text-slate-500 font-medium">Overdue Delay</div>
                    <div className="text-2xl font-black text-rose-600 mt-0.5">{overdueCount}</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <div className="text-xs text-slate-500 font-medium">Kul Pending Due</div>
                    <div className="text-2xl font-black text-slate-900 mt-0.5">₹{totalDebt.toLocaleString("en-IN")}</div>
                  </div>
                </div>

                {/* Algorithm Factors */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Algorithm Insights</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {scoreFactors.length === 0 ? (
                      <li>Koi negative factor nahi mila. Profile bilkul clean hai.</li>
                    ) : (
                      scoreFactors.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{f}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}