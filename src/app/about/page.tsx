"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function AboutPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("en");

  // Subtle Corporate Background Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.5 + 1.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 186, 242, 0.22)";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // SMOOTH SCROLL OBSERVER (UPAR / NEECHE SCROLL ANIMATION)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-12");
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll(".scroll-anim");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [lang]);

  // Bilingual Content
  const text = {
    en: {
      tag: "THE SIGNGUARD PROMISE",
      hero1: "Building India's Most Transparent",
      hero2: "Digital Credit Infrastructure.",
      subText:
        "Replacing informal paper registers with court-admissible covenants under Section 65B of the Indian Evidence Act. Protecting small businesses, honoring punctual borrowers, and establishing zero-repudiation commerce.",
      toggleBtn: "हिंदी में पढ़ें >",

      stats1: "100%",
      stats1Label: "Admissible Legal Standard (Sec 65B)",
      stats2: "< 60s",
      stats2Label: "Agreement Finalization Time",
      stats3: "300-900",
      stats3Label: "Transparent Trust Index",
      stats4: "Zero",
      stats4Label: "Paperwork & Dispute Risk",

      missionTitle: "The Problem We Are Solving for Bharat",
      missionP1:
        "Every single day, millions of neighborhood retailers, distributors, and entrepreneurs extend credit on simple verbal trust. But when memories fade or disputes arise, traditional paper diaries offer zero standing in a court of law.",
      missionP2:
        "SignGuard empowers regular store owners with institutional legal strength: live customer identity verification, tamper-evident digital signatures, and immediate verified WhatsApp settlement slips.",

      flowTitle: "How SignGuard Secures Every Transaction",
      f1Title: "1. Identity & Record Finalization",
      f1Desc: "The shopkeeper inputs the agreement details. The borrower provides a real-time photo confirmation along with a digital touch signature.",
      f2Title: "2. Section 65B Cryptographic Lock",
      f2Desc: "A one-time passcode (OTP) verifies customer consent, binding the transaction into a tamper-evident digital PDF certificate.",
      f3Title: "3. Automated Discharge & WhatsApp NOC",
      f3Desc: "Once settled, the system records payment in real time and automatically dispatches a verified No Objection Certificate (NOC) directly to WhatsApp.",

      quoteText:
        "“Credit is the fuel of local retail trade. When credit is backed by unquestionable digital proof, commerce thrives without fear.”",
      quoteAuthor: "SignGuard Engineering Group • Bharat Commerce Initiative",
    },
    hi: {
      tag: "साइनगार्ड का संकल्प",
      hero1: "भारत की सबसे पारदर्शी",
      hero2: "डिजिटल उधारी प्रणाली का निर्माण।",
      subText:
        "भारतीय साक्ष्य अधिनियम की धारा 65B के तहत पुरानी कागज़ी डायरियों को अदालत में मान्य कानूनी समझौतों में बदलना। हर छोटे व्यापारी की मेहनत की कमाई को सुरक्षित करना और ईमानदार ग्राहकों को पहचान देना।",
      toggleBtn: "Read in English >",

      stats1: "100%",
      stats1Label: "अदालत में मान्य कानूनी मानक (धारा 65B)",
      stats2: "< 60s",
      stats2Label: "डिजिटल अनुबंध तैयार होने का समय",
      stats3: "300-900",
      stats3Label: "पारदर्शी वित्तीय विश्वास पैमाना",
      stats4: "शून्य",
      stats4Label: "कागज़ी झंझट और विवाद का जोखिम",

      missionTitle: "भारतीय व्यापार की सबसे बड़ी चुनौती का समाधान",
      missionP1:
        "हर दिन भारत के करोड़ों दुकानदार और व्यापारी सिर्फ ज़बानी भरोसे पर सामान और पैसा उधार देते हैं। लेकिन कागज़ खो जाने या ग्राहक के मुकर जाने पर अदालत में इनका कोई कानूनी वजूद नहीं रहता।",
      missionP2:
        "साइनगार्ड हर छोटे दुकानदार को वही कानूनी ताकत देता है जो बड़े बैंकों को हासिल है: लाइव फोटो वेरिफिकेशन, डिजिटल हस्ताक्षर और चुकता होते ही वॉट्सऐप पर आधिकारिक अनापत्ति प्रमाण पत्र (NOC)।",

      flowTitle: "साइनगार्ड हर समझौते को कैसे सुरक्षित करता है",
      f1Title: "1. विवरण और ग्राहक की सहमति",
      f1Desc: "व्यापारी उधारी का विवरण दर्ज करता है। ग्राहक की लाइव फोटो और स्क्रीन पर डिजिटल हस्ताक्षर दर्ज किए जाते हैं।",
      f2Title: "2. धारा 65B कानूनी सील",
      f2Desc: "ग्राहक के मोबाइल पर आए OTP सत्यापन के साथ दस्तावेज़ को अदालत-मान्य डिजिटल सर्टिफ़िकेट में लॉक कर दिया जाता है।",
      f3Title: "3. पूर्ण भुगतान एवं वॉट्सऐप एनओसी",
      f3Desc: "रकम चुकता होते ही लेज़र अपडेट होता है और ग्राहक के वॉट्सऐप पर आधिकारिक नो ऑब्जेक्शन सर्टिफ़िकेट (NOC) स्वतः पहुंच जाता है।",

      quoteText:
        "“उधार भारत के खुदरा व्यापार की रीढ़ है। जब हर लेनदेन के पीछे पक्का कानूनी सबूत होता है, तो व्यापार बिना किसी डर के फलता-फूलता है।”",
      quoteAuthor: "साइनगार्ड इंजीनियरिंग टीम • भारतीय व्यापार सुरक्षा पहल",
    },
  };

  const c = text[lang];

  return (
    <div className="relative min-h-screen bg-[#f5f8fc] text-slate-900 font-sans selection:bg-[#00baf2] selection:text-white overflow-x-hidden scroll-smooth">
      
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />

      {/* Top Banner */}
      <div className="relative z-10 bg-[#002e6e] text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-[#00baf2] text-[#002e6e] font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
          Evidence Act
        </span>
        <span>Section 65B Compliant Digital Ledger Architecture</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#002e6e] flex items-center justify-center text-white text-xl shadow-md">
              🛡️
            </div>
            <div>
              <span className="text-xl font-black text-[#002e6e] tracking-tight">
                Sign<span className="text-[#00baf2]">Guard</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                Secure Commerce
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <Link href="/" className="hover:text-[#002e6e] transition">Home</Link>
            <Link href="/about" className="text-[#002e6e] font-extrabold border-b-2 border-[#00baf2] pb-1">About Us</Link>
            <Link href="/score" className="hover:text-[#002e6e] transition">SignGuard Score</Link>
            <Link href="/dashboard" className="hover:text-[#002e6e] transition">Dashboard</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-[#002e6e] hover:bg-[#002050] text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-full transition shadow-md"
            >
              Access Dashboard &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO TITLE */}
      <section className="relative z-10 pt-16 pb-12 sm:pt-20 sm:pb-14 text-center px-4 scroll-anim opacity-0 translate-y-12 transition-all duration-700 ease-out">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-[#002e6e] tracking-wider uppercase">
              {c.tag}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.14]">
            {c.hero1} <br />
            <span className="text-[#002e6e] underline decoration-[#00baf2] decoration-8 underline-offset-8">
              {c.hero2}
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed">
            {c.subText}
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="bg-white hover:bg-slate-50 border-2 border-[#00baf2] text-[#002e6e] font-black text-xs sm:text-sm px-6 py-2.5 rounded-full transition shadow-sm hover:shadow-md flex items-center gap-2 active:scale-95"
            >
              <span>🌐</span>
              <span>{c.toggleBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-anim opacity-0 translate-y-12 transition-all duration-700 ease-out delay-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-[#002e6e]">{c.stats1}</div>
            <div className="text-xs font-bold text-slate-500">{c.stats1Label}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-cyan-600">{c.stats2}</div>
            <div className="text-xs font-bold text-slate-500">{c.stats2Label}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600">{c.stats3}</div>
            <div className="text-xs font-bold text-slate-500">{c.stats3Label}</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-amber-500">{c.stats4}</div>
            <div className="text-xs font-bold text-slate-500">{c.stats4Label}</div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM & SOLUTION + INDIAN MERCHANT HOLDING PHONE WITH SIGNGUARD AGREEMENT */}
      <section className="relative z-10 py-16 bg-white border-y border-slate-200 scroll-anim opacity-0 translate-y-12 transition-all duration-700 ease-out delay-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-black text-[#00baf2] uppercase tracking-wider block">
                CORE PURPOSE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                {c.missionTitle}
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {c.missionP1}
              </p>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {c.missionP2}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="bg-[#002e6e] hover:bg-[#002050] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition shadow-md"
                >
                  Create Protected Deed &rarr;
                </Link>
                <Link
                  href="/score"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition"
                >
                  Check Trust Score
                </Link>
              </div>
            </div>

            {/* Right: Character Illustration (Merchant holding phone showing SignGuard Agreement) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg bg-gradient-to-br from-blue-50/80 via-white to-cyan-50/50 p-6 sm:p-8 rounded-[36px] border border-blue-200/80 shadow-[0_20px_50px_rgba(0,46,110,0.08)] relative flex flex-col items-center">
                
                {/* Floating Top Pill */}
                <div className="w-full flex justify-between items-center mb-2 px-2">
                  <span className="text-xs font-extrabold text-[#002e6e] flex items-center gap-1.5">
                    <span>🛡️</span> SignGuard Mobile Protocol
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    Sec 65B Certified
                  </span>
                </div>

                {/* SVG Character with Agreement Phone */}
                <div className="relative w-full max-w-[340px] h-[360px] flex items-center justify-center">
                  <svg viewBox="0 0 340 360" className="w-full h-full overflow-visible">
                    
                    {/* Background Radial Glow */}
                    <circle cx="150" cy="180" r="130" fill="#00baf2" opacity="0.08" />

                    {/* Merchant Body (Traditional Blue Kurta/Vest) */}
                    <path d="M 60 360 C 60 260, 85 235, 145 235 C 205 235, 230 260, 230 360 Z" fill="#002e6e" />
                    <path d="M 95 240 L 195 240 L 205 360 L 85 360 Z" fill="#0284c7" />
                    
                    {/* Kurta Collar & Placket */}
                    <path d="M 130 200 L 145 235 L 160 200" fill="#ffffff" />
                    <line x1="145" y1="235" x2="145" y2="300" stroke="#002e6e" strokeWidth="3" />

                    {/* Merchant Neck & Face */}
                    <rect x="133" y="175" width="24" height="30" fill="#fbcfe8" rx="4" />
                    <ellipse cx="145" cy="138" rx="40" ry="46" fill="#fed7aa" />

                    {/* Ears */}
                    <circle cx="105" cy="140" r="8" fill="#fdba74" />
                    <circle cx="185" cy="140" r="8" fill="#fdba74" />

                    {/* Stylized Hair */}
                    <path d="M 105 130 C 100 88, 138 75, 162 80 C 186 86, 192 108, 190 130 C 182 98, 120 98, 105 130 Z" fill="#0f172a" />

                    {/* Beard & Friendly Smile */}
                    <path d="M 116 145 C 116 174, 174 174, 174 145 C 166 168, 124 168, 116 145 Z" fill="#1e293b" />
                    <path d="M 132 152 Q 145 165 158 152" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />

                    {/* Eyes & Eyebrows */}
                    <ellipse cx="132" cy="130" rx="4" ry="5" fill="#1e293b" />
                    <ellipse cx="158" cy="130" rx="4" ry="5" fill="#1e293b" />
                    <circle cx="133.5" cy="128.5" r="1.5" fill="#ffffff" />
                    <circle cx="159.5" cy="128.5" r="1.5" fill="#ffffff" />
                    <path d="M 125 122 Q 132 118 139 122" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M 151 122 Q 158 118 165 122" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                    {/* SMARTPHONE DISPLAYING SIGNGUARD AGREEMENT */}
                    <g transform="translate(165, 140)">
                      {/* Phone Chassis */}
                      <rect x="0" y="0" width="125" height="195" rx="18" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                      {/* Screen */}
                      <rect x="4" y="4" width="117" height="187" rx="15" fill="#ffffff" />
                      
                      {/* Top Bar on Phone */}
                      <rect x="40" y="7" width="37" height="4" rx="2" fill="#0f172a" />
                      
                      {/* SignGuard Header on Phone Screen */}
                      <rect x="10" y="16" width="105" height="28" rx="6" fill="#002e6e" />
                      <text x="18" y="30" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">SignGuard Deed</text>
                      <text x="18" y="39" fill="#38bdf8" fontSize="6" fontFamily="sans-serif">#SG-2026-8942</text>

                      {/* Borrower Info Row */}
                      <rect x="10" y="48" width="105" height="20" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                      <text x="14" y="58" fill="#64748b" fontSize="6" fontFamily="sans-serif">Borrower:</text>
                      <text x="44" y="58" fill="#0f172a" fontSize="6" fontWeight="bold" fontFamily="sans-serif">Ramesh K.</text>
                      <text x="14" y="65" fill="#64748b" fontSize="5" fontFamily="sans-serif">Mob: 98765-XXXXX</text>

                      {/* Amount Due Card */}
                      <rect x="10" y="72" width="105" height="26" rx="5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
                      <text x="15" y="83" fill="#1e3a8a" fontSize="6" fontWeight="bold" fontFamily="sans-serif">Kul Bacha Udhar</text>
                      <text x="15" y="94" fill="#dc2626" fontSize="10" fontWeight="900" fontFamily="sans-serif">₹ 15,000</text>
                      
                      {/* Verified Evidence Badges */}
                      <g transform="translate(10, 102)">
                        <rect x="0" y="0" width="105" height="34" rx="4" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="1" />
                        <circle cx="10" cy="11" r="5" fill="#10b981" />
                        <path d="M 8 11 L 10 13 L 13 9" stroke="#ffffff" strokeWidth="1.2" fill="none" />
                        <text x="19" y="13" fill="#15803d" fontSize="6" fontWeight="bold" fontFamily="sans-serif">Face & Sign Locked</text>
                        <text x="10" y="27" fill="#166534" fontSize="5.5" fontFamily="sans-serif">Section 65B Telemetry Valid</text>
                      </g>

                      {/* Customer Signature Vector Preview */}
                      <path d="M 20 148 Q 45 140 70 150 T 105 144" stroke="#002e6e" strokeWidth="1.8" fill="none" />
                      <text x="20" y="157" fill="#94a3b8" fontSize="5" fontFamily="sans-serif">Digital Sign Stroke Verified</text>

                      {/* WhatsApp NOC Ready Button */}
                      <rect x="10" y="162" width="105" height="18" rx="6" fill="#10b981" />
                      <text x="25" y="174" fill="#ffffff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">💬 Send WhatsApp NOC</text>

                      {/* Merchant Fingers Holding Phone (Top & Side) */}
                      <ellipse cx="-4" cy="50" rx="6" ry="10" fill="#fed7aa" />
                      <ellipse cx="-6" cy="72" rx="6" ry="10" fill="#fed7aa" />
                      <ellipse cx="-4" cy="94" rx="6" ry="10" fill="#fed7aa" />
                    </g>
                  </svg>
                </div>

                <p className="text-[11px] text-slate-500 font-medium text-center mt-3">
                  Har transaction par live digital deed lock hoti hai jise adalat aur dono paksh maante hain.
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. WORKFLOW SECTION */}
      <section className="relative z-10 py-16 bg-[#f5f8fc] scroll-anim opacity-0 translate-y-12 transition-all duration-700 ease-out delay-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#002e6e] uppercase tracking-wider">
              OPERATIONAL WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              {c.flowTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#002e6e] flex items-center justify-center font-black text-xl">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">{c.f1Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{c.f1Desc}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#00baf2] flex items-center justify-center font-black text-xl">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">{c.f2Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{c.f2Desc}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">{c.f3Title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{c.f3Desc}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FOUNDER STATEMENT */}
      <section className="relative z-10 py-20 bg-[#001d4a] text-white scroll-anim opacity-0 translate-y-12 transition-all duration-700 ease-out delay-250">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <div className="text-3xl">⚖️</div>
          <blockquote className="text-lg sm:text-2xl font-bold leading-relaxed text-slate-200">
            {c.quoteText}
          </blockquote>
          <div className="text-xs text-cyan-300 font-mono font-bold tracking-wider">
            {c.quoteAuthor}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="relative z-10 bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#002e6e] flex items-center justify-center text-white text-base">
              🛡️
            </div>
            <span className="font-black text-white text-base">SignGuard Secure</span>
          </div>

          <div className="flex gap-6 font-medium">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/about" className="text-cyan-400 font-bold">About Us</Link>
            <Link href="/score" className="hover:text-white transition">SignGuard Score</Link>
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          </div>

          <div>
            © 2026 SignGuard Secure Enterprise. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}