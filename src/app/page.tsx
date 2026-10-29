"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as THREE from "three";

export default function HomePage() {
  const router = useRouter();
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auth & Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Navbar Company Dropdown State
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // 3D Hero Fan Tilt & Card Selection States
  const fanContainerRef = useRef<HTMLDivElement | null>(null);
  const [fanTilt, setFanTilt] = useState({ x: 0, y: 0 });
  const [activeFanCard, setActiveFanCard] = useState<number>(1); // 0 = Left, 1 = Center, 2 = Right

  // Slider 1: Industry Use-Cases Carousel
  const [industrySlide, setIndustrySlide] = useState(0);

  // Slider 2: Merchant Stories Carousel
  const [storySlide, setStorySlide] = useState(0);

  // Interactive ROI Calculator State
  const [monthlyUdhar, setMonthlyUdhar] = useState(85000);
  const [recoveryTarget, setRecoveryTarget] = useState(98);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // ==========================================
  // 1. THREE.JS 3D FLOATING GEOMETRY ENGINE
  // ==========================================
  useEffect(() => {
    const canvas = threeCanvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 28;

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00baf2, 3.5);
    dirLight1.position.set(12, 18, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x002e6e, 2.8);
    dirLight2.position.set(-14, -12, 10);
    scene.add(dirLight2);

    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // 3D Shape 1: Metallic Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(1.8, 0.42, 100, 16);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0x00baf2,
      roughness: 0.15,
      metalness: 0.25,
      clearcoat: 1,
      transparent: true,
      opacity: 0.22,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    knotMesh.position.set(12, 5, -4);
    objectsGroup.add(knotMesh);

    // 3D Shape 2: Gyroscope Double Ring + Core
    const gyroGroup = new THREE.Group();
    const coreGeo = new THREE.OctahedronGeometry(1.7, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x002e6e,
      roughness: 0.2,
      metalness: 0.3,
      clearcoat: 0.8,
      transparent: true,
      opacity: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    gyroGroup.add(coreMesh);

    const ringGeo = new THREE.TorusGeometry(2.7, 0.1, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00baf2,
      transparent: true,
      opacity: 0.32,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    gyroGroup.add(ringMesh);

    gyroGroup.position.set(-12.5, -2, -3);
    objectsGroup.add(gyroGroup);

    // 3D Shape 3: Icosahedron Crystal + Wireframe
    const icoGeo = new THREE.IcosahedronGeometry(2.0, 0);
    const icoMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.18,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    const icoWireGeo = new THREE.IcosahedronGeometry(2.3, 1);
    const icoWireMat = new THREE.MeshBasicMaterial({
      color: 0x002e6e,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const icoWire = new THREE.Mesh(icoWireGeo, icoWireMat);
    icoMesh.add(icoWire);
    icoMesh.position.set(10, -7, -2);
    objectsGroup.add(icoMesh);

    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const sFactor = scrollY * 0.0025;

      knotMesh.rotation.x = t * 0.35 + sFactor;
      knotMesh.rotation.y = t * 0.25 + sFactor;
      knotMesh.position.y = 5 + Math.sin(t * 1.2) * 0.8;

      gyroGroup.rotation.y = t * 0.4 + sFactor;
      gyroGroup.rotation.x = t * 0.2;
      ringMesh.rotation.z = -t * 0.6;

      icoMesh.rotation.x = -t * 0.3 + sFactor;
      icoMesh.rotation.z = t * 0.25;

      objectsGroup.position.x += (mouseX * 1.6 - objectsGroup.position.x) * 0.05;
      objectsGroup.position.y += (mouseY * 1.2 - objectsGroup.position.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      knotGeo.dispose();
      knotMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      icoWireGeo.dispose();
      icoWireMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Scroll Reveal Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0", "scale-100");
            entry.target.classList.remove("opacity-0", "translate-y-12", "scale-95");
          }
        });
      },
      { threshold: 0.08 }
    );

    const elements = document.querySelectorAll(".scroll-layer");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Dropdown Outside Click Listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCompanyMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3D Hero Fan Tilt Physics
  const handleFanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!fanContainerRef.current) return;
    const rect = fanContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    setFanTilt({
      x: -((y - cy) / cy) * 10,
      y: ((x - cx) / cx) * 12,
    });
  };

  const handleFanMouseLeave = () => setFanTilt({ x: 0, y: 0 });

  // Session Check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.push("/dashboard");
    };
    checkSession();
  }, [router]);

  // Auth Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      if (authMode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        alert("Account safalta-purvak ban gaya! Dashboard ke liye login karein.");
        setAuthMode("login");
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication me samasya aayi.");
    } finally {
      setAuthLoading(false);
    }
  };

  // TREK-STYLE 3-CARD FANNED DECK DATA
  const fanDeedCards = [
    {
      id: "MANDI-01",
      title: "GUPTA TRADERS",
      subtitle: "Wholesale Mandi Covenant",
      badge: "VERIFIED DEED",
      amount: "₹ 1,45,000",
      topPill: "Minted in Lucknow",
      bottomPill: "12 Deals Streak +35 Score",
      gradient: "from-[#0284c7] via-[#0369a1] to-[#0c4a6e]",
      border: "border-sky-300",
      accent: "text-sky-300",
      icon: "🌾",
      stats: [
        { label: "Trust Score", val: "825" },
        { label: "Sec 65B", val: "100%" },
        { label: "Speed", val: "42s" },
        { label: "Recovery", val: "99%" },
      ],
    },
    {
      id: "SOVEREIGN-02",
      title: "RAMESH VERMA",
      subtitle: "Section 65B Primary Deed",
      badge: "COURT CERTIFIED",
      amount: "₹ 65,000",
      topPill: "Biometric Locked in UP",
      bottomPill: "Zero Default Record • +50 XP",
      gradient: "from-[#002e6e] via-[#001d47] to-[#090d16]",
      border: "border-[#00baf2]",
      accent: "text-[#00baf2]",
      icon: "🛡️",
      stats: [
        { label: "Trust Score", val: "860" },
        { label: "Sec 65B", val: "VALID" },
        { label: "Biometric", val: "99.8%" },
        { label: "Safety", val: "100%" },
      ],
    },
    {
      id: "NOC-03",
      title: "SHARMA HARDWARE",
      subtitle: "Auto WhatsApp NOC Slip",
      badge: "INSTANT NOC",
      amount: "₹ 38,500",
      topPill: "Settled on WhatsApp",
      bottomPill: "Instant Discharge • Verified",
      gradient: "from-emerald-700 via-teal-800 to-slate-900",
      border: "border-emerald-300",
      accent: "text-emerald-300",
      icon: "💬",
      stats: [
        { label: "Trust Score", val: "795" },
        { label: "NOC Time", val: "1-Click" },
        { label: "Dispute", val: "0%" },
        { label: "Status", val: "CLEAR" },
      ],
    },
  ];

  // Industry Use-Cases Data
  const industrySlides = [
    {
      badge: "WHOLESALE & MANDI",
      title: "Thok Vyapaari aur Distributor Supply Deed",
      desc: "Retailers ko 15-30 din ke credit par maal dete waqt pukka Section 65B invoice bond banayein. Payment rukne ka darr 0%.",
      amount: "₹ 1,45,000",
      party: "Gupta Agro Traders",
      score: "825 / 900",
      icon: "🌾",
    },
    {
      badge: "ELECTRONICS & MOBILE EMI",
      title: "Shop Credit & Consumer Appliance Deed",
      desc: "Mobile, AC ya fridge dukan ke udhar par dete samay customer ki live selfie, IMEI/Serial No aur touch sign lock karein.",
      amount: "₹ 42,500",
      party: "Vikram Singh",
      score: "760 / 900",
      icon: "📱",
    },
    {
      badge: "JEWELLERY & BULLION",
      title: "Sarafa & High-Value Gold Credit Covenant",
      desc: "Bina kagazi kachehri ke high-value jewellery udhar ko biometric face presence aur 2FA OTP token ke sath surakshit karein.",
      amount: "₹ 2,80,000",
      party: "Mehta Jewellers",
      score: "880 / 900",
      icon: "💎",
    },
    {
      badge: "KIRANA & HARDWARE",
      title: "Monthly Dukan Khata & Contractor Ledger",
      desc: "Building material ya mahine ke kirana hisaab ko kanooni saboot me badlein aur payment aane par WhatsApp NOC bhejein.",
      amount: "₹ 28,900",
      party: "Ramesh Contractor",
      score: "740 / 900",
      icon: "🏗️",
    },
  ];

  // Merchant Stories
  const merchantStories = [
    {
      quote: "Pehle har saal 2-3 lakh ka udhar log mukar jaate the. Jab se SignGuard par live photo aur digital sign lena shuru kiya hai, 98% payment time se pehle aa jata hai.",
      name: "Rajesh Agrawal",
      business: "Agrawal Wholesale Mandi, Lucknow",
      saved: "₹ 4.2 Lakh Saved",
      rating: "5.0 ★",
    },
    {
      quote: "SignGuard Score dekh kar hi ab hum naye grahak ko udhar dete hain. Jiska score 750+ hota hai usse deal karne me bilkul chinta nahi rehti.",
      name: "Sandeep Verma",
      business: "Verma Electronics & Mobile Hub, Kanpur",
      saved: "Zero Defaults in 2026",
      rating: "5.0 ★",
    },
    {
      quote: "Sabse best feature WhatsApp NOC hai! Customer jaise hi paisa deta hai, 1-click me unke phone par official receipt aur NOC pahunch jati hai.",
      name: "Ankit Sharma",
      business: "Sharma Building Materials, Varanasi",
      saved: "₹ 3.1 Lakh Recovered",
      rating: "4.9 ★",
    },
  ];

  const faqList = [
    {
      q: "Kya SignGuard agreement court ya adalat me kanooni taur par manya (valid) hai?",
      a: "Haan, bilkul! SignGuard Indian Evidence Act ke Section 65B ke kanooni parameters ke anuroop digital audit certificate generate karta hai. Isme customer ki live biometric photo, device IP/timestamp, touch signature aur verified OTP trail shamil hota hai jo ise adalat me pukka kanooni saboot banata hai.",
    },
    {
      q: "SignGuard Score (300-900) kaise calculate hota hai aur iska kya fayda hai?",
      a: "SignGuard Score CIBIL algorithm ki tarah 300 se 900 ke beech chalta hai. Agar koi customer samay par udhar chukata hai aur NOC generate hoti hai, toh uska score boost hota hai. Agar koi delay ya default karta hai, toh score drop hota hai taaki dusre vyapaari alert ho sakein.",
    },
    {
      q: "Kya customer ka score koi bhi unknown vyakti check kar sakta hai?",
      a: "Nahi. Privacy protection ke liye score tabhi unlock hota hai jab registered mobile number ya email par bheja gaya 4-digit OTP sahi verify kiya jaye. Bina customer ki anumati ke koi score nahi dekh sakta.",
    },
    {
      q: "Agar customer ne aadha udhar (partial payment) chukaya toh kya hoga?",
      a: "Dukandar apne dashboard par 'Record Payment' button daba kar jama hui rashi daal sakta hai. System turant naya bacha balance update karega aur updated legal PDF receipt generate karke WhatsApp par bhej dega.",
    },
    {
      q: "Poora karz chukta hone par WhatsApp NOC kaise milti hai?",
      a: "Jab customer pura payment kar deta hai, dukandar 'Close (NOC)' par click karta hai. Isse agreement permanently closed mark ho jata hai aur customer ke WhatsApp par official No Objection Certificate (NOC) send ho jata hai.",
    },
  ];

  const annualSaved = Math.round((monthlyUdhar * 12 * (recoveryTarget - 72)) / 100);

  return (
    <div className="relative min-h-screen bg-[#f4f8fc] text-slate-900 font-sans selection:bg-[#00baf2] selection:text-white overflow-x-hidden scroll-smooth">
      
      {/* 3D FLOATING BACKGROUND CANVAS */}
      <canvas
        ref={threeCanvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="relative z-20 bg-[#002e6e] text-white text-xs py-2.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-[#00baf2] text-[#002e6e] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          3D Legal Tech OS
        </span>
        <span>Section 65B Indian Evidence Act Compliant Digital Credit & Recovery Platform</span>
      </div>

      {/* STICKY NAVBAR WITH COMPANY DROPDOWN */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#002e6e] to-[#0077b6] flex items-center justify-center text-white text-xl shadow-lg shadow-blue-950/20 group-hover:scale-105 transition-transform">
              🛡️
            </div>
            <div>
              <span className="text-2xl font-black text-[#002e6e] tracking-tight">
                Sign<span className="text-[#00baf2]">Guard</span>
              </span>
              <span className="block text-[9px] font-extrabold text-slate-400 tracking-widest uppercase">
                Secure Commerce
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-slate-600">
            <a href="#deed-story-deck" className="hover:text-[#002e6e] transition">3D Card Deck</a>
            <a href="#comparison" className="hover:text-[#002e6e] transition">Forensic Vault</a>
            <a href="#industry-slider" className="hover:text-[#002e6e] transition">Use Cases</a>
            <a href="#bento-layers" className="hover:text-[#002e6e] transition">6-Pillars</a>
            <a href="#roi-simulator" className="hover:text-[#002e6e] transition">ROI Calculator</a>

            {/* Company Dropdown */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => setShowCompanyMenu(true)}
              onMouseLeave={() => setShowCompanyMenu(false)}
            >
              <button
                onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                className="flex items-center gap-1.5 py-2 text-slate-700 hover:text-[#002e6e] font-bold transition focus:outline-none"
              >
                <span>Company</span>
                <span className={`text-[10px] text-slate-500 transition-transform duration-200 ${showCompanyMenu ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>

              {showCompanyMenu && (
                <div className="absolute top-full -left-4 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Organization
                  </div>
                  <Link
                    href="/about"
                    onClick={() => setShowCompanyMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-[#002e6e] transition"
                  >
                    <span>🏢</span>
                    <span>About Us</span>
                  </Link>
                  <a
                    href="#comparison"
                    onClick={() => setShowCompanyMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-[#002e6e] transition"
                  >
                    <span>⚖️</span>
                    <span>Legal & Sec 65B</span>
                  </a>
                  <a
                    href="#faq"
                    onClick={() => setShowCompanyMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-[#002e6e] transition"
                  >
                    <span>💬</span>
                    <span>Help & FAQs</span>
                  </a>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/score"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold text-[#002e6e] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-xl transition"
            >
              <span>⚡</span> Check Trust Score
            </Link>

            <button
              onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}
              className="bg-[#002e6e] hover:bg-[#001d47] text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-full transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>👤</span>
              <span>Sign In / Login &rarr;</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          LAYER 1: TREK-INSPIRED 3-CARD FANNED 3D HERO DECK
          ========================================================= */}
      <section
        id="deed-story-deck"
        className="relative z-10 pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Bold Story Pitch */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 bg-white border border-blue-200 px-4 py-1.5 rounded-full shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00baf2] animate-ping" />
                <span className="text-xs font-black text-[#002e6e] uppercase tracking-wider">
                  India&apos;s #1 Digital Khata Legal Protocol
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[62px] font-black text-slate-900 tracking-tight leading-[1.06] uppercase">
                EVERY UDHAR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#002e6e] via-[#0284c7] to-[#00baf2]">
                  HAS A LEGAL DEED.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Bina kisi kagazi jhanjhat ke dukan ka udhar ya aapsi karz <strong>UNIQUE Section 65B 3D Card</strong> me lock karein. <strong>Live Face Photo, Digital Touch Signature, Verified OTP Audit</strong> aur settlement par automatic <strong>WhatsApp NOC</strong> slip.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }}
                  className="w-full sm:w-auto bg-[#002e6e] hover:bg-[#00baf2] hover:text-[#002e6e] text-white text-base font-black px-9 py-4 rounded-full transition shadow-xl shadow-blue-950/20 flex items-center justify-center gap-2"
                >
                  <span>Dukan / Ledger Register Karein</span>
                  <span>&rarr;</span>
                </button>

                <Link
                  href="/score"
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-[#002e6e] border-2 border-[#002e6e] text-base font-extrabold px-7 py-3.5 rounded-full transition shadow-sm"
                >
                  Check Trust Score
                </Link>
              </div>

              {/* Bottom Feature Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-extrabold text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00baf2]" />
                  Sec 65B Court Valid
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#002e6e]" />
                  300-900 Trust Score
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  1-Click WhatsApp NOC
                </span>
              </div>
            </div>

            {/* Right Column: 3-Card Fanned 3D Deck */}
            <div
              ref={fanContainerRef}
              onMouseMove={handleFanMouseMove}
              onMouseLeave={handleFanMouseLeave}
              className="lg:col-span-6 relative h-[470px] sm:h-[500px] flex items-center justify-center perspective-[1400px] select-none"
            >
              <div className="w-80 h-80 bg-gradient-to-tr from-[#002e6e]/25 via-[#00baf2]/30 to-emerald-400/25 rounded-full blur-3xl absolute pointer-events-none" />

              <div
                style={{
                  transform: `rotateX(${fanTilt.x}deg) rotateY(${fanTilt.y}deg)`,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.18s ease-out",
                }}
                className="relative w-full max-w-[460px] h-[420px] flex items-center justify-center"
              >
                {fanDeedCards.map((card, idx) => {
                  const offset = idx - activeFanCard;
                  const translateX = offset * 105;
                  const translateY = Math.abs(offset) * 22;
                  const translateZ = idx === activeFanCard ? 70 : 10;
                  const rotateZ = offset * 13;
                  const scale = idx === activeFanCard ? 1.04 : 0.88;
                  const zIndex = idx === activeFanCard ? 30 : 20 - Math.abs(offset);

                  return (
                    <div
                      key={card.id}
                      onClick={() => setActiveFanCard(idx)}
                      style={{
                        transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateZ(${rotateZ}deg) scale(${scale})`,
                        zIndex,
                        transition: "all 0.45s cubic-bezier(0.2, 0.85, 0.3, 1.05)",
                      }}
                      className={`w-[265px] sm:w-[285px] h-[390px] rounded-[28px] bg-gradient-to-b ${card.gradient} p-5 text-white shadow-[0_25px_70px_rgba(0,25,65,0.45)] border-2 ${card.border} cursor-pointer flex flex-col justify-between absolute`}
                    >
                      {/* Top Pill */}
                      {idx === activeFanCard && (
                        <div className="-top-3.5 -left-4 bg-slate-950/90 text-white text-[10px] font-bold px-3.5 py-1 rounded-full border border-white/20 shadow-lg absolute flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#00baf2] animate-pulse" />
                          <span>{card.topPill}</span>
                        </div>
                      )}

                      {/* Card Header */}
                      <div className="flex justify-between items-center">
                        <span className="font-black text-xs tracking-wider uppercase text-white/90">
                          {card.title}
                        </span>
                        <span className="bg-white/15 backdrop-blur-md text-[9px] font-black px-2.5 py-1 rounded-full border border-white/25 uppercase">
                          {card.badge}
                        </span>
                      </div>

                      {/* Card Center Window */}
                      <div className="my-2 flex-1 rounded-2xl bg-black/35 border border-white/15 p-4 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl mb-2 shadow-inner">
                          {card.icon}
                        </div>
                        <div className="text-[10px] font-mono text-white/70 uppercase tracking-widest">
                          {card.subtitle}
                        </div>
                        <div className={`text-2xl font-black mt-1 ${card.accent}`}>
                          {card.amount}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                          ✓ Biometric & Sign Sealed
                        </div>
                      </div>

                      {/* Stats 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-black/30 p-3 rounded-2xl border border-white/10 text-xs">
                        {card.stats.map((st, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between px-1">
                            <span className="text-[10px] text-white/65 font-medium">{st.label}</span>
                            <span className="font-black text-white text-xs">{st.val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Pill */}
                      {idx === activeFanCard && (
                        <div className="-bottom-3.5 right-3 bg-slate-950 text-[#00baf2] text-[10px] font-black px-3.5 py-1 rounded-full border border-[#00baf2]/50 shadow-xl absolute">
                          ⚡ {card.bottomPill}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Deck Dots */}
              <div className="bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm absolute">
                <span className="text-[10px] font-extrabold text-slate-500 mr-1">
                  Click card to switch:
                </span>
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveFanCard(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeFanCard === i ? "w-7 bg-[#002e6e]" : "w-2.5 bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          LAYER 2: STATUTORY ACCREDITATION & METRICS RIBBON
          ========================================================= */}
      <section className="relative z-10 py-10 bg-white border-y border-slate-200 shadow-sm scroll-layer opacity-0 translate-y-12 scale-95 transition-all duration-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#00baf2] transition">
              <div className="text-3xl font-black text-[#002e6e]">₹ 85 Cr+</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Vyapaari Udhar Protected</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#00baf2] transition">
              <div className="text-3xl font-black text-emerald-600">98.4%</div>
              <div className="text-xs font-bold text-slate-500 mt-1">On-Time Debt Recovery Rate</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#00baf2] transition">
              <div className="text-3xl font-black text-[#00baf2]">Sec 65B</div>
              <div className="text-xs font-bold text-slate-500 mt-1">100% Court Admissible Proof</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#00baf2] transition">
              <div className="text-3xl font-black text-indigo-600">&lt; 45 Sec</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Mobile Execution Speed</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          LAYER 3: HIGH-IMPACT LIVE CRYPTOGRAPHIC FORENSIC VAULT
          ========================================================= */}
      <section
        id="comparison"
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f4f8fc] via-white to-[#f4f8fc] border-y border-slate-200/80 scroll-layer opacity-0 translate-y-12 scale-95 transition-all duration-700"
      >
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#002e6e] text-[#00baf2] text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
              <span>🛡️</span> LIVE CRYPTOGRAPHIC FORENSIC VAULT
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Dekhein Kaise SignGuard Adalat Ka Pukka Saboot Banata Hai
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Kacche bahi-khate adalat me 0% valid hote hain[cite: 7]. SignGuard ka har ek agreement Section 65B ke antargat immutable cryptographic audit trail ke sath lock hota hai.
            </p>
          </div>

          {/* Interactive Live Evidence Inspector Card */}
          <div className="bg-gradient-to-br from-[#070b14] via-[#0c182c] to-[#030712] text-white rounded-[36px] p-6 sm:p-10 shadow-[0_30px_90px_rgba(0,46,110,0.3)] border border-cyan-500/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
            
            {/* Glowing Background Aura */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#00baf2]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: Live Telemetry Inspection Points */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#00baf2] uppercase tracking-widest block">
                  IMMUTABLE AUDIT STREAM
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Real-Time Forensic Telemetry Inspection
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Jab dukandar agreement lock karta hai, toh system automatic 4 alag-alag legal layers ko ek single tamper-proof SHA-256 hash me bind kar deta hai.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📸</span>
                    <div>
                      <div className="font-bold text-white">Live Biometric Facial Snapshot</div>
                      <div className="text-[11px] text-slate-400">GPS Coordinates: 26.8467° N, 80.9462° E</div>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2.5 py-1 rounded-full border border-emerald-500/30">
                    MATCHED ✓
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✍️</span>
                    <div>
                      <div className="font-bold text-white">Sub-Pixel Stylus Vector</div>
                      <div className="text-[11px] text-slate-400">Stroke pressure & velocity recorded</div>
                    </div>
                  </div>
                  <span className="bg-sky-500/20 text-sky-300 text-[10px] font-mono px-2.5 py-1 rounded-full border border-sky-500/30">
                    LOCKED ✓
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:border-cyan-400/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚖️</span>
                    <div>
                      <div className="font-bold text-white">Section 65B Judicial Certificate</div>
                      <div className="text-[11px] text-slate-400">Indian Evidence Act, 1872 compliant</div>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2.5 py-1 rounded-full border border-emerald-500/30">
                    ADMISSIBLE ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Cryptographic Vault Certificate Preview */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-[#040812] rounded-3xl p-6 border border-cyan-400/40 shadow-2xl relative font-mono text-xs space-y-4">
                
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-white font-bold text-xs tracking-wider">SEC 65B VAULT CERTIFICATE</span>
                  </div>
                  <span className="text-[10px] text-[#00baf2] bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                    STATUS: SEALED
                  </span>
                </div>

                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-500">ISSUED TO:</span>
                    <span className="text-white font-bold">GUPTA WHOLESALE MANDI</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-500">PRINCIPAL DEED:</span>
                    <span className="text-[#00baf2] font-bold">₹ 1,45,000.00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-500">TIMESTAMP:</span>
                    <span className="text-slate-300">2026-10-30 00:15:00 IST</span>
                  </div>
                </div>

                <div className="bg-black/80 p-3 rounded-xl border border-white/10 text-[9px] text-slate-400 break-all space-y-1">
                  <div className="text-[#00baf2] font-bold">SHA-256 HASH SIGNATURE:</div>
                  <div className="text-slate-300">a3f9c81b7e4d209f83a1e2bc64f901a8b3e2d1c09f8e7d6c5b4a3f2e1d0c9b8a</div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }}
                    className="w-full bg-[#00baf2] hover:bg-cyan-300 text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-[0_0_25px_rgba(0,186,242,0.3)]"
                  >
                    MINT YOUR SEC 65B DEED NOW &rarr;
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          LAYER 4: INTERACTIVE SLIDER #1 — INDUSTRY USE CASES
          ========================================================= */}
      <section id="industry-slider" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-layer opacity-0 translate-y-12 scale-95 transition-all duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-xs font-black text-[#002e6e] bg-blue-100 border border-blue-200 px-3.5 py-1 rounded-full uppercase tracking-wider">
              Interactive Industry Deck (Slide {industrySlide + 1} of {industrySlides.length})
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
              Har Vyapaar Ke Liye Ready-to-Mint 3D Deeds
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setIndustrySlide((prev) => (prev - 1 + industrySlides.length) % industrySlides.length)
              }
              className="w-12 h-12 rounded-2xl bg-white hover:bg-[#002e6e] hover:text-white text-[#002e6e] border border-slate-300 font-black text-lg transition shadow-sm flex items-center justify-center"
            >
              &larr;
            </button>
            <button
              onClick={() => setIndustrySlide((prev) => (prev + 1) % industrySlides.length)}
              className="w-12 h-12 rounded-2xl bg-[#002e6e] hover:bg-[#00baf2] hover:text-[#002e6e] text-white font-black text-lg transition shadow-md flex items-center justify-center"
            >
              &rarr;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 bg-gradient-to-br from-[#002e6e] to-[#00183a] text-white rounded-[32px] p-8 sm:p-10 shadow-2xl border border-blue-800">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-[#00baf2] text-[#002e6e] text-xs font-black px-3.5 py-1 rounded-full uppercase">
                {industrySlides[industrySlide].badge}
              </span>
              <span className="text-4xl">{industrySlides[industrySlide].icon}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black leading-snug mb-3">
              {industrySlides[industrySlide].title}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              {industrySlides[industrySlide].desc}
            </p>

            <div className="grid grid-cols-3 gap-4 bg-white/10 p-4 rounded-2xl border border-white/15 text-xs mb-6">
              <div>
                <span className="text-sky-300 block text-[10px] font-mono">SAMPLE DEED VALUE</span>
                <span className="text-lg font-black text-white">{industrySlides[industrySlide].amount}</span>
              </div>
              <div>
                <span className="text-sky-300 block text-[10px] font-mono">VERIFIED PARTY</span>
                <span className="text-sm font-bold text-white">{industrySlides[industrySlide].party}</span>
              </div>
              <div>
                <span className="text-sky-300 block text-[10px] font-mono">TRUST SCORE</span>
                <span className="text-sm font-black text-emerald-400">{industrySlides[industrySlide].score}</span>
              </div>
            </div>

            <button
              onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }}
              className="bg-[#00baf2] hover:bg-white text-[#002e6e] font-black text-xs sm:text-sm px-7 py-3.5 rounded-full transition shadow-lg"
            >
              Is Template Se Agreement Banayein &rarr;
            </button>
          </div>

          <div className="lg:col-span-5 space-y-3">
            {industrySlides.map((item, index) => (
              <div
                key={index}
                onClick={() => setIndustrySlide(index)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between ${
                  industrySlide === index
                    ? "bg-white border-[#00baf2] border-2 shadow-xl -translate-x-2"
                    : "bg-white/70 border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#00baf2] uppercase block">
                      {item.badge}
                    </span>
                    <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                  </div>
                </div>
                <span className="text-xs font-black text-[#002e6e]">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          LAYER 5: 6-PILLAR 3D BENTO SECURITY ARCHITECTURE
          ========================================================= */}
      <section id="bento-layers" className="relative z-10 py-24 bg-white border-y border-slate-200 scroll-layer opacity-0 translate-y-12 scale-95 transition-all duration-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#002e6e] bg-blue-50 border border-blue-200 px-3.5 py-1 rounded-full uppercase tracking-wider">
              6-Layer Forensic Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Kanooni Suraksha Ke 6 Pukke Stambh
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "📸",
                tag: "PILLAR 01",
                title: "Live Biometric Face Audit",
                desc: "Customer ki live selfie ko GPS coordinates aur device IP ke sath lock kiya jata hai taaki physical presence sabit ho.",
              },
              {
                icon: "✍️",
                tag: "PILLAR 02",
                title: "Sub-Pixel Touch Signature",
                desc: "Mobile screen par kiye gaye hastakshar ke stroke velocity vectors ko store kiya jata hai jo fake sign ke daave khatam karta hai.",
              },
              {
                icon: "🔐",
                tag: "PILLAR 03",
                title: "2FA OTP Consent Telemetry",
                desc: "Customer ke mobile/email par real-time OTP verify karke non-repudiation audit log generate kiya jata hai.",
              },
              {
                icon: "⚖️",
                tag: "PILLAR 04",
                title: "Section 65B Court Certificate",
                desc: "Indian Evidence Act 1872 ke Section 65B ke anuroop automatic electronic certificate har PDF ke sath attach hota hai.",
              },
              {
                icon: "📊",
                tag: "PILLAR 05",
                title: "Partial Payment Reconciler",
                desc: "Kisto me aane wale paise ka real-time ledger hisaab aur har kist par updated digital receipt.",
              },
              {
                icon: "💬",
                tag: "PILLAR 06",
                title: "1-Click WhatsApp NOC Slip",
                desc: "Udhar zero hote hi official No Objection Certificate (NOC) customer ke WhatsApp par turant deliver ho jata hai.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#f8fafc] hover:bg-white p-8 rounded-[28px] border border-slate-200/90 hover:border-[#00baf2] shadow-sm hover:shadow-[0_20px_50px_rgba(0,46,110,0.1)] hover:-translate-y-2 transition-all duration-300 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#002e6e] to-[#00baf2] text-white flex items-center justify-center text-2xl shadow-md">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{card.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          LAYER 6: INTERACTIVE ROI RECOVERY SIMULATOR
          ========================================================= */}
      <section id="roi-simulator" className="relative z-10 py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-layer opacity-0 translate-y-12 scale-95 transition-all duration-700">
        <div className="bg-gradient-to-br from-[#002e6e] via-[#001d47] to-slate-950 text-white rounded-[36px] p-8 sm:p-12 shadow-2xl border border-blue-800 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="bg-[#00baf2] text-[#002e6e] text-xs font-black px-3.5 py-1 rounded-full uppercase">
              Interactive Profit Safeguard Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              SignGuard Se Aapki Dukan Ka Kitna Paisa Dubne Se Bachega?
            </h2>

            <div className="space-y-5 pt-2">
              <div>
                <div className="flex justify-between text-xs sm:text-sm font-bold mb-2">
                  <span className="text-sky-200">Mahine Ka Kul Dukan Udhar:</span>
                  <span className="text-[#00baf2] text-lg font-black">
                    ₹ {monthlyUdhar.toLocaleString("en-IN")} / month
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="10000"
                  value={monthlyUdhar}
                  onChange={(e) => setMonthlyUdhar(Number(e.target.value))}
                  className="w-full h-2.5 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-[#00baf2]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm font-bold mb-2">
                  <span className="text-sky-200">SignGuard Target Recovery Rate:</span>
                  <span className="text-emerald-400 text-lg font-black">{recoveryTarget}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="99"
                  step="1"
                  value={recoveryTarget}
                  onChange={(e) => setRecoveryTarget(Number(e.target.value))}
                  className="w-full h-2.5 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white text-slate-900 p-8 rounded-3xl shadow-xl text-center space-y-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
              SAALANA SURAKSHIT MUNAFA (SAVED)
            </span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight">
              + ₹ {annualSaved.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kacche bahi-khate me lagbhag 25-28% udhar fas jata hai. Section 65B legal lock se aapka yeh paisa seedha aapke bank me wapas aata hai.
            </p>
            <button
              onClick={() => { setAuthMode("signup"); setShowAuthModal(true); }}
              className="w-full bg-[#002e6e] hover:bg-[#00baf2] hover:text-[#002e6e] text-white font-black text-sm py-4 rounded-2xl transition shadow-md"
            >
              Apna Udhar Lock Karein &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          LAYER 7: MERCHANT STORIES SLIDER #2 + FAQ ACCORDION
          ========================================================= */}
      <section className="relative z-10 py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 scroll-layer opacity-0 translate-y-12 scale-95 transition-all duration-700">
        
        {/* Slider #2: Verified Merchant Recovery Stories */}
        <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-slate-200 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <span className="text-xs font-black text-[#00baf2] uppercase tracking-widest">
                Verified Merchant Stories (Slide {storySlide + 1} / {merchantStories.length})
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Bharat Ke Vyapaariyon Ka Bharosa
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setStorySlide((prev) => (prev - 1 + merchantStories.length) % merchantStories.length)
                }
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-[#002e6e] hover:text-white font-black transition"
              >
                &larr;
              </button>
              <button
                onClick={() => setStorySlide((prev) => (prev + 1) % merchantStories.length)}
                className="w-10 h-10 rounded-xl bg-[#002e6e] text-white hover:bg-[#00baf2] hover:text-[#002e6e] font-black transition"
              >
                &rarr;
              </button>
            </div>
          </div>

          <div className="bg-[#f4f8fc] p-6 sm:p-8 rounded-2xl border border-blue-100 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-amber-500 font-black text-sm">{merchantStories[storySlide].rating}</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                {merchantStories[storySlide].saved}
              </span>
            </div>
            <p className="text-base sm:text-xl font-bold text-slate-800 italic leading-relaxed">
              &ldquo;{merchantStories[storySlide].quote}&rdquo;
            </p>
            <div className="pt-2">
              <div className="font-black text-[#002e6e] text-base">{merchantStories[storySlide].name}</div>
              <div className="text-xs text-slate-500 font-bold">{merchantStories[storySlide].business}</div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div id="faq" className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Aksar Puche Jaane Wale Sawaal (FAQ)
            </h2>
            <p className="text-slate-600 text-sm">
              SignGuard ki Section 65B validity aur recovery workflow ke baare me sabhi jankari.
            </p>
          </div>

          <div className="space-y-3">
            {faqList.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left px-6 py-5 font-extrabold text-sm sm:text-base text-slate-900 flex justify-between items-center gap-4 hover:bg-slate-50 transition"
                  >
                    <span>{item.q}</span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-transform ${
                        isOpen ? "rotate-180 bg-[#002e6e] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ENTERPRISE FOOTER */}
      <footer className="relative z-10 bg-slate-950 text-slate-400 py-14 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#002e6e] flex items-center justify-center text-white text-base">
              🛡️
            </div>
            <span className="font-black text-white text-base">SignGuard 3D Sovereign Enterprise</span>
          </div>

          <div className="flex flex-wrap gap-6 font-bold text-slate-300">
            <a href="#deed-story-deck" className="hover:text-[#00baf2] transition">3D Card Deck</a>
            <a href="#comparison" className="hover:text-[#00baf2] transition">Forensic Vault</a>
            <a href="#industry-slider" className="hover:text-[#00baf2] transition">Use Cases</a>
            <Link href="/score" className="hover:text-[#00baf2] transition">Check Score</Link>
            <Link href="/about" className="hover:text-[#00baf2] transition">About Us</Link>
          </div>

          <div>© 2026 SignGuard Secure. Section 65B Compliant.</div>
        </div>
      </footer>

      {/* AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
            >
              ✕
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 bg-blue-50 text-[#002e6e] rounded-2xl flex items-center justify-center mx-auto text-2xl">
                🛡️
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {authMode === "login" ? "Merchant Login" : "Create New Account"}
              </h3>
              <p className="text-xs text-slate-500">
                Apne secure ledger dashboard aur agreements access karne ke liye login karein.
              </p>
            </div>

            {authError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Personal Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#002e6e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#002e6e]"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#002e6e] hover:bg-[#002050] text-white text-sm font-extrabold py-3.5 rounded-xl transition shadow-md"
              >
                {authLoading ? "Processing..." : authMode === "login" ? "Access Secure Dashboard →" : "Register Account →"}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setAuthError("");
                }}
                className="text-[#002e6e] font-extrabold hover:underline"
              >
                {authMode === "login"
                  ? "Naye merchant hain? Naya account banayein"
                  : "Pehle se account hai? Login karein"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}