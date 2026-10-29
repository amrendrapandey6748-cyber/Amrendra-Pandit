"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"lend" | "borrow">("lend");

  const [step, setStep] = useState(1);

  // Form States
  const [category, setCategory] = useState("Shop Udhar / Vyapaar Credit");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [idProof, setIdProof] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [photo, setPhoto] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deedNumber, setDeedNumber] = useState("");
  const [pdfPublicUrl, setPdfPublicUrl] = useState("");

  // Ledger Lists
  const [givenParchas, setGivenParchas] = useState<any[]>([]);
  const [borrowedParchas, setBorrowedParchas] = useState<any[]>([]);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "settled">("all");

  // Top Metrics
  const [totalGivenOutstanding, setTotalGivenOutstanding] = useState(0);
  const [activeGivenCount, setActiveGivenCount] = useState(0);
  const [totalBorrowedOutstanding, setTotalBorrowedOutstanding] = useState(0);
  const [activeBorrowedCount, setActiveBorrowedCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/");

      const uid = session.user.id;
      const email = session.user.email?.trim().toLowerCase() || "";
      const phoneNum = session.user.phone || "";

      setUserId(uid);
      setUserEmail(email);

      await fetchAllData(uid, email, phoneNum);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const fetchAllData = async (uid: string, email: string, phoneNum: string) => {
    const { data: givenData } = await supabase
      .from("parchas")
      .select("*")
      .eq("owner_id", uid)
      .order("created_at", { ascending: false });

    if (givenData) {
      setGivenParchas(givenData);
      const activeGiven = givenData.filter(
        (p) => Number(p.amount) > 0 && !p.description?.includes("[SETTLED / CLOSED]")
      );
      setTotalGivenOutstanding(activeGiven.reduce((acc, curr) => acc + Number(curr.amount || 0), 0));
      setActiveGivenCount(activeGiven.length);
    }

    const queries = [];
    if (email) queries.push(`borrower_email.eq.${email}`);
    if (phoneNum) queries.push(`borrower_email.eq.${phoneNum}`);

    if (queries.length > 0) {
      const { data: borrowedData } = await supabase
        .from("parchas")
        .select("*")
        .or(queries.join(","))
        .order("created_at", { ascending: false });

      if (borrowedData) {
        setBorrowedParchas(borrowedData);
        const activeBorrowed = borrowedData.filter(
          (p) => Number(p.amount) > 0 && !p.description?.includes("[SETTLED / CLOSED]")
        );
        setTotalBorrowedOutstanding(activeBorrowed.reduce((acc, curr) => acc + Number(curr.amount || 0), 0));
        setActiveBorrowedCount(activeBorrowed.length);
      }
    }
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.6));
      };
    };
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 5) {
      alert("Pehle valid email ya mobile number daalein!");
      return;
    }
    setIsOtpSent(true);
    alert("💬 Demo OTP sent to " + phone + ": 1234");
  };

  const handleRecordPayment = async (parcha: any) => {
    const paidStr = prompt(
      `Customer: ${parcha.borrower_email}\nKul Bacha Udhar: ₹${parcha.amount}\nKitna payment jama hua (₹)?`
    );
    if (!paidStr) return;
    const paidAmount = parseFloat(paidStr);

    if (isNaN(paidAmount) || paidAmount <= 0) {
      alert("Sahi amount daalein!");
      return;
    }

    const currentAmount = Number(parcha.amount);
    const newAmount = Math.max(0, currentAmount - paidAmount);

    const { error: updateError } = await supabase
      .from("parchas")
      .update({ amount: newAmount })
      .eq("id", parcha.id);

    if (updateError) {
      alert("Update Failed: " + updateError.message);
      return;
    }

    await supabase.from("payment_history").insert([
      {
        parcha_id: parcha.id,
        paid_amount: paidAmount,
        remaining_amount: newAmount,
      },
    ]);

    if (userId && userEmail) fetchAllData(userId, userEmail, "");

    try {
      const receiptDeedNo = `REC-${Math.floor(1000 + Math.random() * 9000)}`;
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: "SignGuard Secure Enterprise",
          customerName: parcha.description || "Customer",
          customerPhone: parcha.borrower_email,
          itemDesc: `Payment Received: ₹${paidAmount} | New Balance`,
          amount: newAmount,
          dueDate: "Updated Ledger Receipt",
          otpVerified: true,
          deedNumber: receiptDeedNo,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${receiptDeedNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }

    alert(`✅ ₹${paidAmount} jama ho gaye! Naya Balance: ₹${newAmount}`);
  };

  const handleCloseAgreement = async (parcha: any) => {
    const confirmClose = window.confirm(
      `Kya aap ${parcha.borrower_email} ka agreement CLOSE karke No Objection Certificate (NOC) bhejna chahte hain?`
    );
    if (!confirmClose) return;

    const prevAmt = Number(parcha.amount);
    const newDesc = parcha.description.includes("[SETTLED / CLOSED]")
      ? parcha.description
      : `${parcha.description} [SETTLED / CLOSED]`;

    const { error } = await supabase
      .from("parchas")
      .update({ amount: 0, description: newDesc })
      .eq("id", parcha.id);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    await supabase.from("payment_history").insert([
      {
        parcha_id: parcha.id,
        paid_amount: prevAmt,
        remaining_amount: 0,
      },
    ]);

    if (userId && userEmail) fetchAllData(userId, userEmail, "");

    const nocDeedNo = `NOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const msg = `✅ *NO OBJECTION CERTIFICATE (NOC) / FULL SETTLEMENT NOTICE*\n\nNamaste!\nAapka SignGuard agreement (${parcha.description}) poori tarah se chukta (settled) kar diya gaya hai.\n\n*Kul Shesh Udhar:* ₹0 (NIL)\n*Status:* CLOSED & SETTLED\n*NOC Ref No:* ${nocDeedNo}\n*Kanooni Sthiti:* Dukandar dwara koi bhi bakaya rashi shesh nahi hai.\n\nDhanyawad!`;

    window.open(`https://wa.me/91${parcha.borrower_email}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationChecked) {
      alert("Legal declaration check karein!");
      return;
    }

    setIsSubmitting(true);
    const generatedDeedNo = `SG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setDeedNumber(generatedDeedNo);

    try {
      await supabase.from("parchas").insert([
        {
          owner_id: userId,
          borrower_email: phone.trim().toLowerCase(),
          amount: parseFloat(amount),
          description: `[${category}] - ${customerName}`,
        },
      ]);

      const signatureDataUrl = canvasRef.current?.toDataURL("image/png");
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: "SignGuard Secure Enterprise",
          customerName,
          customerPhone: phone,
          itemDesc: `${category} (ID: ${idProof})`,
          amount,
          dueDate: dueDate || "Tay nahi",
          photo1: photo,
          photo2: signatureDataUrl,
          customerSignature: customerName,
          otpVerified: true,
          deedNumber: generatedDeedNo,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const fileName = `${generatedDeedNo}.pdf`;

        const { data: uploadData } = await supabase.storage
          .from("agreements_media")
          .upload(fileName, blob, { contentType: "application/pdf", upsert: true });

        if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from("agreements_media")
            .getPublicUrl(fileName);

          if (publicUrlData) setPdfPublicUrl(publicUrlData.publicUrl);
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${generatedDeedNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }

      setStep(3);
      if (userId && userEmail) fetchAllData(userId, userEmail, "");
    } catch (err) {
      console.error(err);
      alert("Error occurred during lock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-800">Loading SignGuard...</div>;

  const netBalance = totalGivenOutstanding - totalBorrowedOutstanding;

  // Filter Helper for Given Parchas
  const filteredGivenParchas = givenParchas.filter((p) => {
    const isSettled = Number(p.amount) === 0 || p.description?.includes("[SETTLED / CLOSED]");
    const matchesSearch =
      p.borrower_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "pending") return !isSettled;
    if (statusFilter === "settled") return isSettled;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navbar */}
        <div className="bg-slate-950 p-5 rounded-2xl shadow-xl flex justify-between items-center text-white border border-slate-800">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="text-indigo-400">🛡️</span> SignGuard Secure Ledger
            </h1>
            <p className="text-xs text-slate-400">
              User: <span className="text-indigo-300 font-semibold">{userEmail}</span>
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 text-slate-200 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {/* HERO BANNER WITH SPEEDOMETER */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-9 shadow-sm border border-slate-200">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50 via-indigo-50/40 to-transparent rounded-full pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span className="text-xs font-extrabold text-[#002e6e] tracking-tight">SignGuard Score</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  FREE REPORT
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.15] tracking-tight">
                Check your SignGuard Score for{" "}
                <span className="text-emerald-600 underline decoration-emerald-300 decoration-4 underline-offset-4">
                  FREE
                </span>
              </h2>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-medium">
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                  <span>Instant market repayment credibility & default-risk audit</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                  <span>Soft behavioral lookup: checking score <strong className="text-slate-800 font-bold">never drops points</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                  <span>100% Indian Evidence Act Section 65B compliant audit</span>
                </li>
              </ul>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <Link
                  href="/score"
                  className="inline-flex items-center gap-2 bg-[#002e6e] hover:bg-[#002050] text-white font-extrabold text-xs sm:text-sm px-7 py-3.5 rounded-full transition shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Check SignGuard Report</span>
                  <span className="text-base">&rarr;</span>
                </Link>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span>Powered by</span>
                  <span className="font-extrabold text-slate-700 text-xs">CIBIL Logic</span>
                  <span>•</span>
                  <span className="font-extrabold text-slate-700 text-xs">Trust Engine</span>
                </div>
              </div>
            </div>

            {/* Right Gauge Meter (5 Cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white border border-slate-200/90 p-6 rounded-3xl w-full max-w-sm flex flex-col items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]">
                
                <div className="relative w-64 h-36 flex items-end justify-center">
                  <svg viewBox="0 0 240 140" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="speedoRainbow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="35%" stopColor="#fb923c" />
                        <stop offset="65%" stopColor="#facc15" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
                      </filter>
                    </defs>

                    <path
                      d="M 28 128 A 92 92 0 0 1 212 128"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />

                    <path
                      d="M 28 128 A 92 92 0 0 1 212 128"
                      fill="none"
                      stroke="url(#speedoRainbow)"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />

                    <circle cx="120" cy="128" r="30" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                    <circle cx="120" cy="128" r="14" fill="#002e6e" />

                    <line
                      x1="120"
                      y1="128"
                      x2="176"
                      y2="52"
                      stroke="#002e6e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      filter="url(#needleGlow)"
                    />
                    <circle cx="120" cy="128" r="5" fill="#ffffff" />
                  </svg>

                  <div className="absolute -bottom-2 flex flex-col items-center bg-white px-3 py-0.5 rounded-full border border-slate-200/80 shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      INDEX
                    </span>
                    <span className="text-xs font-black text-slate-900 tracking-wide">
                      300 - 900
                    </span>
                  </div>
                </div>

                <div className="w-full flex justify-between text-[11px] font-bold px-3 pt-4 border-t border-slate-100 mt-3">
                  <span className="text-rose-500 font-extrabold">300 Poor</span>
                  <span className="text-amber-500 font-extrabold">650 Fair</span>
                  <span className="text-emerald-600 font-extrabold">900 High</span>
                </div>

                <div className="mt-3.5 flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-800">
                    Live Score Engine Ready
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Maine Udhar Diya (Lent)</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹ {totalGivenOutstanding.toLocaleString("en-IN")}</div>
            <span className="text-xs text-slate-500">{activeGivenCount} Active Log (Lene baaki)</span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Maine Udhar Liya (Borrowed)</span>
            <div className="text-2xl font-black text-red-600 mt-1">₹ {totalBorrowedOutstanding.toLocaleString("en-IN")}</div>
            <span className="text-xs text-slate-500">{activeBorrowedCount} Dukanon par baaki (Dene hain)</span>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Net Ledger Position</span>
            <div className={`text-2xl font-black mt-1 ${netBalance >= 0 ? "text-indigo-600" : "text-amber-600"}`}>
              {netBalance >= 0 ? `+ ₹ ${netBalance.toLocaleString("en-IN")}` : `- ₹ ${Math.abs(netBalance).toLocaleString("en-IN")}`}
            </div>
            <span className="text-xs text-slate-500">
              {netBalance >= 0 ? "Aapka market me plus hai" : "Aap par udhar zyada hai"}
            </span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-200 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab("lend")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "lend" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📤</span> Maine Jo Udhar Diya Hai ({givenParchas.length})
          </button>
          <button
            onClick={() => setActiveTab("borrow")}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === "borrow" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>📥</span> Maine Jo Udhar Liya Hai ({borrowedParchas.length})
          </button>
        </div>

        {/* Tab 1: Lend */}
        {activeTab === "lend" && (
          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">Lender Portal</span>
                  <h2 className="text-xl font-bold text-slate-800">Naya Udhar / Agreement Banayein</h2>
                </div>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">
                  Step {step} / 3
                </span>
              </div>

              {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Agreement Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-300 rounded p-3 bg-white text-slate-900 outline-none focus:border-indigo-600">
                      <option value="Shop Udhar / Vyapaar Credit">Shop Udhar / Vyapaar Credit</option>
                      <option value="Personal Friendly Loan">Personal Friendly Loan</option>
                      <option value="Bike / Car Handover">Bike / Car Handover</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Customer ka Naam</label>
                    <input type="text" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border border-slate-300 rounded p-3 text-slate-900 outline-none focus:border-indigo-600" placeholder="e.g. Ramesh Kumar" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Customer Email / Mobile (Login Key)</label>
                      <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-slate-300 rounded p-3 text-slate-900 outline-none focus:border-indigo-600" placeholder="ramesh@gmail.com ya 9876543210" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">ID Proof (Last 4 Digit)</label>
                      <input type="text" maxLength={4} required value={idProof} onChange={(e) => setIdProof(e.target.value)} className="w-full border border-slate-300 rounded p-3 text-slate-900 outline-none focus:border-indigo-600" placeholder="XXXX" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Rashi (₹)</label>
                      <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-slate-300 rounded p-3 text-slate-900 outline-none focus:border-indigo-600" placeholder="e.g. 5000" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Wapsi Tarikh (Due)</label>
                      <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-slate-300 rounded p-3 text-slate-900 outline-none focus:border-indigo-600" />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-indigo-950 hover:bg-indigo-900 text-white font-bold py-3.5 rounded-xl transition shadow-lg mt-4">
                    Aage Badhein: Photo & Sign &rarr;
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">1. Customer ki Live Photo</label>
                    <input type="file" accept="image/*" capture="environment" id="livePhoto" className="hidden" onChange={handlePhotoCapture} />
                    <label htmlFor="livePhoto" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 bg-white overflow-hidden">
                      {photo ? <img src={photo} alt="Customer" className="w-full h-full object-cover" /> : (
                        <div className="text-center">
                          <span className="text-2xl">📷</span>
                          <p className="text-xs font-medium text-indigo-600 mt-1">Camera Open Karein</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">2. Customer ke Digital Sign</label>
                      <button type="button" onClick={clearSignature} className="text-xs text-indigo-600 hover:underline font-medium">Clear Sign</button>
                    </div>
                    <div className="border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                      <canvas 
                        ref={canvasRef} 
                        width={480} 
                        height={150} 
                        className="w-full touch-none bg-white cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-700">3. OTP Verification ({phone})</label>
                    <div className="flex gap-2">
                      <input type="text" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP (Demo: 1234)" className="flex-1 border border-slate-300 rounded-lg p-2.5 text-slate-900 bg-white outline-none" />
                      <button type="button" onClick={handleSendOtp} className="bg-slate-900 hover:bg-slate-800 text-white px-4 rounded-lg text-xs font-bold transition">
                        {isOtpSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-3">
                    <input type="checkbox" required checked={declarationChecked} onChange={(e) => setDeclarationChecked(e.target.checked)} className="mt-1 w-4 h-4 text-indigo-600 rounded" />
                    <p className="text-xs text-amber-900 leading-relaxed">
                      Main hosh-o-hawas me bina kisi dabav ke is dastavej ki sharton ko swikaar karta/karti hoon. Mera OTP, Live Photo aur Signature kanooni saboot ke taur par darj kiya ja raha hai.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3.5 rounded-xl transition">
                      &larr; Pichhe
                    </button>
                    <button type="submit" disabled={isSubmitting} className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex justify-center items-center gap-2">
                      {isSubmitting ? "Locking Agreement..." : "🔒 Verify & Lock Agreement"}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className="text-center py-6 space-y-5">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Agreement Locked!</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Deed Number: <span className="font-bold text-indigo-600">{deedNumber}</span> save ho gaya hai.
                    </p>
                  </div>

                  <a 
                    href={`https://wa.me/91${phone}?text=Namaste%20${encodeURIComponent(customerName)}!%20Aapka%20SignGuard%20Agreement%20(${deedNumber})%20lock%20ho%20chuka%20hai.%20Kul%20Bacha%20Udhar:%20₹${amount}.%20Link:%20${encodeURIComponent(pdfPublicUrl || 'https://sign-guard-5atd.vercel.app')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg flex justify-center items-center gap-2 block"
                  >
                    💬 Customer ke WhatsApp par Receipt Bhejein
                  </a>

                  <button onClick={() => { setStep(1); setCustomerName(""); setPhone(""); setAmount(""); setPhoto(null); }} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg">
                    Naya Agreement Banayein &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* List: Diya Hua Udhar with Live Search & Filter Bar */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 space-y-4">
              
              {/* Top Bar with Search & Filter Pills */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-800">📋 Log Jinko Maine Udhar Diya Hai</h2>
                  <p className="text-xs text-slate-500">Showing {filteredGivenParchas.length} of {givenParchas.length} records</p>
                </div>

                {/* Filter Pills */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    All ({givenParchas.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      statusFilter === "pending" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Pending ({givenParchas.filter(p => Number(p.amount) > 0 && !p.description?.includes("[SETTLED / CLOSED]")).length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("settled")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      statusFilter === "settled" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    NOC Settled ({givenParchas.filter(p => Number(p.amount) === 0 || p.description?.includes("[SETTLED / CLOSED]")).length})
                  </button>
                </div>
              </div>

              {/* Instant Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Customer ka naam ya mobile number search karein..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-600 focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filtered List */}
              <div className="space-y-3 pt-2">
                {filteredGivenParchas.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-500">Koi record match nahi hua.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Search term badal kar ya filter reset karke dekhein.</p>
                  </div>
                ) : (
                  filteredGivenParchas.map((p) => {
                    const isSettled = Number(p.amount) === 0 || p.description?.includes("[SETTLED / CLOSED]");
                    return (
                      <div key={p.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-50 border border-slate-200 rounded-xl gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">Borrower: {p.borrower_email}</span>
                            {isSettled && (
                              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                NOC ISSUED
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{p.description} | Date: {new Date(p.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                          <span className={`font-bold text-base ${isSettled ? "text-slate-400 line-through" : "text-emerald-600"}`}>
                            ₹ {p.amount}
                          </span>
                          
                          {!isSettled && (
                            <button 
                              onClick={() => handleRecordPayment(p)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                            >
                              💳 Record
                            </button>
                          )}

                          {!isSettled && (
                            <button 
                              onClick={() => handleCloseAgreement(p)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                            >
                              🔒 Close (NOC)
                            </button>
                          )}

                          <a 
                            href={`https://wa.me/91${p.borrower_email}?text=${encodeURIComponent(
                              isSettled
                                ? `Namaste! Aapka SignGuard ledger account chukta ho gaya hai.`
                                : `Namaste! Aapka bacha udhar ₹${p.amount} hai.`
                            )}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            💬 WhatsApp
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Borrow */}
        {activeTab === "borrow" && (
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span>📥</span> Mera Liya Hua Udhar (Borrower Khata)
              </h2>
              <p className="text-xs text-slate-500">
                Yeh agreements wo hain jahan kisi shopkeeper ya lendor ne aapki email ({userEmail}) par udhar register kiya hai.
              </p>
            </div>

            <div className="space-y-3">
              {borrowedParchas.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-600">Aap par koi udhar darj nahi hai! 🎉</p>
                  <p className="text-xs text-slate-400 mt-1">Jab koi aapki email/number par deed lock karega, wo yahan dikhega.</p>
                </div>
              ) : (
                borrowedParchas.map((bp) => {
                  const isSettled = Number(bp.amount) === 0 || bp.description?.includes("[SETTLED / CLOSED]");
                  return (
                    <div key={bp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{bp.description}</div>
                        <div className="text-xs text-slate-500">
                          Tarikh: {new Date(bp.created_at).toLocaleDateString()} | Agreement ID: #{bp.id.slice(0, 8)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-base font-black ${isSettled ? "text-emerald-600 line-through" : "text-red-600"}`}>
                          ₹ {bp.amount}
                        </span>
                        {isSettled ? (
                          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md">
                            Settled / NOC Issued
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md">
                            Dene Baaki Hain
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}