"use client";

import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Camera, CheckCircle, RotateCcw, Lock } from 'lucide-react';
import { LEGAL_DISCLAIMERS, DEED_PREFIX } from '@/lib/legal-constants';
import { LegalFooter } from '@/components/legal/LegalFooter';
import { supabase } from '@/lib/supabase';

export default function CreateDeedPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    borrowerName: '',
    borrowerPhone: '',
    idLast4: '',
    category: 'SHOP_UDHAR',
    amount: '',
    dueDate: '',
    terms: '',
  });

  // Verification State
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [generatedDeedId, setGeneratedDeedId] = useState<string | null>(null);

  // Camera & Signature Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Camera Start Karna
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access denied ya camera nahi mila.");
      setCameraActive(false);
    }
  };

  // Photo Capture Karna
  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      setSelfieDataUrl(canvas.toDataURL('image/jpeg', 0.8));
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  // Base64 ko file (Blob) me badalne ka function (Storage ke liye)
  const dataUrlToBlob = async (dataUrl: string) => {
    const res = await fetch(dataUrl);
    return await res.blob();
  };

  // Final Submit - Photo, Sign aur Data Database me save karna
  const handleFinalSubmit = async () => {
    if (!selfieDataUrl) return alert("Kripya live photo capture karein!");
    if (sigCanvasRef.current?.isEmpty()) return alert("Kripya box me digital signature karein!");
    if (otpInput !== '1234') return alert("Galat OTP! (Demo OTP: 1234 daalein)");
    if (!consentChecked) return alert("Kanooni sahamati checkbox tick karna anivarya hai!");

    setIsSubmitting(true);

    try {
      const newDeedNo = `${DEED_PREFIX}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const timestamp = Date.now();

      // 1. Photo ko bucket me save karna
      const photoBlob = await dataUrlToBlob(selfieDataUrl);
      const photoName = `photo_${newDeedNo}_${timestamp}.jpg`;
      const { error: photoError } = await supabase.storage
        .from('agreements_media')
        .upload(photoName, photoBlob, { contentType: 'image/jpeg' });
      
      if (photoError) throw new Error("Photo save nahi hui: " + photoError.message);
      const { data: photoData } = supabase.storage.from('agreements_media').getPublicUrl(photoName);

      // 2. Signature ko bucket me save karna
      const sigDataUrl = sigCanvasRef.current!.getTrimmedCanvas().toDataURL('image/png');
      const sigBlob = await dataUrlToBlob(sigDataUrl);
      const sigName = `sign_${newDeedNo}_${timestamp}.png`;
      const { error: sigError } = await supabase.storage
        .from('agreements_media')
        .upload(sigName, sigBlob, { contentType: 'image/png' });

      if (sigError) throw new Error("Signature save nahi hui: " + sigError.message);
      const { data: sigData } = supabase.storage.from('agreements_media').getPublicUrl(sigName);

      // 3. Pura Data (Link ke saath) Database Table me bhejna
      const { error: dbError } = await supabase
        .from('deeds')
        .insert([
          {
            deed_number: newDeedNo,
            borrower_name: formData.borrowerName,
            borrower_phone: formData.borrowerPhone,
            id_last4: formData.idLast4,
            category: formData.category,
            amount: Number(formData.amount),
            due_date: formData.dueDate || null,
            status: 'ACTIVE',
            photo_url: photoData.publicUrl,
            signature_url: sigData.publicUrl
          }
        ]);

      if (dbError) throw dbError;

      setGeneratedDeedId(newDeedNo);
      setStep(3);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <div className="w-full max-w-md mx-auto p-4 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase">SignGuard Secure</span>
            <h1 className="text-lg font-extrabold text-slate-900">Naya Agreement Banayein</h1>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 rounded-full text-slate-700">
            Step {step} / 3
          </span>
        </div>

        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Agreement ki Category</label>
              <select
                value={formData.category}
                onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              >
                <option value="SHOP_UDHAR">Shop Udhar / Vyapaar Credit</option>
                <option value="PERSONAL_LOAN">Personal Friendly Loan</option>
                <option value="VEHICLE_RENT">Bike / Car Handover</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer ka Pura Naam</label>
              <input
                type="text"
                placeholder="ID card ke hisaab se"
                value={formData.borrowerName}
                onChange={(e: any) => setFormData({ ...formData, borrowerName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit no."
                  value={formData.borrowerPhone}
                  onChange={(e: any) => setFormData({ ...formData, borrowerPhone: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ID Proof (Last 4 Digit)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="XXXX (Aadhaar/DL)"
                  value={formData.idLast4}
                  onChange={(e: any) => setFormData({ ...formData, idLast4: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rashi (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={formData.amount}
                  onChange={(e: any) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Wapsi Tarikh (Due)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e: any) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm text-slate-900"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if(!formData.borrowerName || !formData.amount) return alert("Pura naam aur Rashi bharna zaroori hai!");
                setStep(2);
              }}
              className="w-full py-3 bg-indigo-950 text-white rounded-xl font-bold text-sm hover:bg-indigo-900 transition"
            >
              Aage Badhein: Photo &amp; Sign →
            </button>
          </div>
        )}

        {/* STEP 2: Photo, Sign & OTP */}
        {step === 2 && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            
            {/* 1. Camera */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">1. Customer ki Live Photo</label>
              {!selfieDataUrl && !cameraActive && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full py-6 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center text-slate-600 bg-slate-50"
                >
                  <Camera className="w-6 h-6 mb-1 text-indigo-600" />
                  <span className="text-xs font-semibold">Camera Open Karein</span>
                </button>
              )}

              {cameraActive && (
                <div className="space-y-2">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black" />
                  <button
                    type="button"
                    onClick={captureSelfie}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    📸 Photo Click Karein
                  </button>
                </div>
              )}

              {selfieDataUrl && (
                <div className="relative">
                  <img src={selfieDataUrl} alt="Selfie" className="w-full h-40 object-cover rounded-xl border" />
                  <button onClick={() => setSelfieDataUrl(null)} className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Dobara Khinchein
                  </button>
                </div>
              )}
            </div>

            {/* 2. Touch Signature */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800">2. Customer ke Digital Sign</label>
                <button onClick={() => sigCanvasRef.current?.clear()} className="text-[11px] text-indigo-600 font-semibold">Clear Sign</button>
              </div>
              <div className="border-2 border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor="navy"
                  canvasProps={{ className: 'w-full h-32' }}
                />
              </div>
            </div>

            {/* 3. OTP & Consent */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">3. OTP Verification ({formData.borrowerPhone})</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="OTP (Demo: 1234)"
                  value={otpInput}
                  onChange={(e: any) => setOtpInput(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-300 text-sm"
                />
                <button onClick={() => { setOtpSent(true); alert("Demo OTP: 1234"); }} className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                  {otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                <input type="checkbox" checked={consentChecked} onChange={(e: any) => setConsentChecked(e.target.checked)} className="mt-1" />
                <span className="text-[11px] text-slate-700 leading-relaxed">
                  {LEGAL_DISCLAIMERS.SIGNING_CONSENT}
                </span>
              </label>

              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 flex justify-center gap-2 disabled:bg-emerald-400 disabled:cursor-not-allowed"
              >
                <Lock className="w-4 h-4" /> {isSubmitting ? 'Securely Saving Data...' : 'Verify & Lock Agreement'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Agreement Locked!</h2>
            <p className="text-xs text-slate-600">
              Deed Number: <b className="font-mono text-indigo-900">{generatedDeedId}</b> safaltapurvak generate aur save ho gaya hai.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-left text-[11px] text-slate-600 border space-y-1">
              <p><b>Party:</b> {formData.borrowerName}</p>
              <p><b>Amount:</b> ₹{formData.amount}</p>
              <p><b>Proof:</b> Photo &amp; Sign Securely Uploaded</p>
            </div>
            <a href="/" className="block w-full py-3 bg-indigo-950 text-white rounded-xl font-bold text-sm">
              Dashboard Par Wapas Jayein
            </a>
          </div>
        )}

      </div>
      <LegalFooter />
    </div>
  );
}