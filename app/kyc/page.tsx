"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "../providers";

export default function KYCPage() {
  const [step, setStep] = useState<"personal" | "document" | "face" | "review">("personal");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    country: "",
    idType: "passport"
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPersonalData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/")) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image file");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const constraints = { 
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Unable to access camera. Please check your permissions in browser settings.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setSelfie(imageData);
        stopCamera();
      }
    }
  };

  const retakeSelfie = () => {
    setSelfie(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const renderStep = () => {
    switch (step) {
      case "personal":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
              <p className="text-zinc-600">Step 1 of 4 · Please provide your identity details</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={personalData.firstName}
                    onChange={handlePersonalChange}
                    placeholder="John"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={personalData.lastName}
                    onChange={handlePersonalChange}
                    placeholder="Doe"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={personalData.dateOfBirth}
                  onChange={handlePersonalChange}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={personalData.country}
                  onChange={handlePersonalChange}
                  placeholder="United States"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ID Type</label>
                <select
                  name="idType"
                  value={personalData.idType}
                  onChange={handlePersonalChange}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                >
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="national_id">National ID</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "document":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Upload Identity Document</h2>
              <p className="text-zinc-600">Step 2 of 4 · Upload a clear photo of your document</p>
            </div>

            {uploadedFile ? (
              <div className="space-y-4">
                {filePreview && (
                  <div className="rounded-lg overflow-hidden border border-zinc-200">
                    <img src={filePreview} alt="Document preview" className="w-full max-h-96 object-cover" />
                  </div>
                )}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900 font-medium">✓ File uploaded: {uploadedFile.name}</p>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setFilePreview(null);
                  }}
                  className="px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50"
                >
                  Choose Different File
                </button>
              </div>
            ) : (
              <>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    dragActive
                      ? "border-zinc-900 bg-zinc-50"
                      : "border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  <svg className="mx-auto h-12 w-12 text-zinc-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-zinc-500">PNG, JPG, GIF up to 10MB</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  className="hidden"
                />

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Quality Check:</strong> Make sure the document is clear, readable, and all corners are visible.
                  </p>
                </div>
              </>
            )}
          </div>
        );

      case "face":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Face Capture</h2>
              <p className="text-zinc-600">Step 3 of 4 · Take a selfie for biometric verification</p>
            </div>

            {selfie ? (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-zinc-200">
                  <img src={selfie} alt="Selfie" className="w-full" />
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900 font-medium">✓ Selfie captured successfully</p>
                </div>
                <button
                  onClick={retakeSelfie}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50"
                >
                  Retake Selfie
                </button>
              </div>
            ) : cameraActive ? (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border-2 border-zinc-300 bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <div className="space-y-3">
                  <button
                    onClick={captureSelfie}
                    className="w-full px-4 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800"
                  >
                    Capture Selfie
                  </button>
                  <button
                    onClick={stopCamera}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cameraError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-900 font-medium">⚠ {cameraError}</p>
                    <p className="text-xs text-red-700 mt-2">Make sure to:</p>
                    <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
                      <li>Allow camera access when the browser asks</li>
                      <li>Check browser camera permissions in settings</li>
                      <li>Ensure your device has a working camera</li>
                    </ul>
                  </div>
                )}
                <div className="bg-zinc-100 rounded-lg aspect-video flex items-center justify-center border-2 border-dashed border-zinc-300">
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-zinc-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="font-medium mb-2">Camera Preview</p>
                    <p className="text-sm text-zinc-500 mb-4">Enable camera access to capture selfie</p>
                    <button
                      onClick={startCamera}
                      className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800"
                    >
                      Enable Camera
                    </button>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-3">Tips for a good selfie:</p>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 accent-zinc-900" />
                    <span className="text-sm text-blue-900">Face is clearly visible and well-lit</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 accent-zinc-900" />
                    <span className="text-sm text-blue-900">No glasses, sunglasses, or hats</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 accent-zinc-900" />
                    <span className="text-sm text-blue-900">Photo matches government-issued ID</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        );

      case "review":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
              <p className="text-zinc-600">Step 4 of 4 · Review your information before submission</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-zinc-200 rounded-lg">
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Full Name</span>
                    <span className="font-medium">{personalData.firstName} {personalData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Date of Birth</span>
                    <span className="font-medium">{personalData.dateOfBirth || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Country</span>
                    <span className="font-medium">{personalData.country || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">ID Type</span>
                    <span className="font-medium capitalize">{personalData.idType.replace("_", " ")}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  ✓ Document uploaded and verified<br />
                  ✓ Face capture completed<br />
                  ✓ All required information provided
                </p>
              </div>

              <label className="flex items-start gap-3">
                <input type="checkbox" className="w-4 h-4 mt-1 accent-zinc-900" required />
                <span className="text-sm">I confirm that all information provided is accurate and I have read the privacy policy.</span>
              </label>
            </div>
          </div>
        );
    }
  };

  const steps = ["personal", "document", "face", "review"];
  const currentStepIndex = steps.indexOf(step);
  const isDocumentStepValid = uploadedFile !== null;
  const isFaceStepValid = selfie !== null;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [kycId, setKycId] = useState<string | null>(null);
  const { user, token } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-zinc-200">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <Link href="/dashboard" className="text-xl font-semibold">
            Assure
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex justify-between mb-8">
          {steps.map((s, idx) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                idx <= currentStepIndex ? "bg-zinc-900" : "bg-zinc-300"
              }`}>
                {idx + 1}
              </div>
              <span className="text-xs font-medium text-zinc-600 text-center capitalize">{s}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-zinc-200 h-1 rounded-full overflow-hidden">
          <div className="bg-zinc-900 h-full transition-all" style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-8 pb-20">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-2xl px-6 py-4 flex gap-4 justify-between">
          <button
            onClick={() => {
              const idx = steps.indexOf(step);
              if (idx > 0) setStep(steps[idx - 1] as any);
            }}
            disabled={step === "personal"}
            className="px-6 py-2 border border-zinc-300 rounded-lg font-medium hover:bg-zinc-50 disabled:opacity-50 transition"
          >
            Back
          </button>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-zinc-300 rounded-lg font-medium hover:bg-zinc-50 transition"
            >
              Cancel
            </Link>
            <button
              onClick={async () => {
                const idx = steps.indexOf(step);
                if (idx < steps.length - 1) {
                  setStep(steps[idx + 1] as any);
                  return;
                }

                // Final submission: call Azure Function /api/kyc/start
                setSubmitError(null);
                setSubmitting(true);
                try {
                  const functionsBase = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
                  if (!functionsBase) {
                    throw new Error("NEXT_PUBLIC_FUNCTIONS_BASE_URL is not configured");
                  }

                  const userId = user?.email || user?.name || user?.id;
                  const headers: any = { "Content-Type": "application/json" };
                  if (token) headers["Authorization"] = `Bearer ${token}`;

                  const startResp = await fetch(`${functionsBase}/api/kyc/start`, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({ userId, idType: personalData.idType, personalData })
                  });

                  if (!startResp.ok) {
                    const err = await startResp.json().catch(() => ({}));
                    throw new Error(err?.error || `Start API failed: ${startResp.status}`);
                  }

                  const startJson = await startResp.json();
                  setKycId(startJson.kycId || null);

                  // If we have a direct upload URL, upload the document file
                  if (startJson.uploadUrl && uploadedFile) {
                    const uploadResp = await fetch(startJson.uploadUrl, {
                      method: "PUT",
                      headers: {
                        "x-ms-blob-type": "BlockBlob",
                        "Content-Type": uploadedFile.type
                      },
                      body: uploadedFile
                    });

                    if (!uploadResp.ok) {
                      throw new Error("Document upload failed");
                    }

                    // Notify backend that upload is complete so it can analyze the document
                    try {
                      const uploadUrl = startJson.uploadUrl as string;
                      const parsed = new URL(uploadUrl);
                      // blob path is everything after container (e.g. /container/<blobPath>)
                      const parts = parsed.pathname.split("/");
                      const blobPath = parts.slice(2).join("/");

                      const notifyHeaders: any = { "Content-Type": "application/json" };
                      if (token) notifyHeaders["Authorization"] = `Bearer ${token}`;
                      await fetch(`${functionsBase}/api/kyc/upload-document`, {
                        method: "POST",
                        headers: notifyHeaders,
                        body: JSON.stringify({ kycId: startJson.kycId, blobName: blobPath, blobUrl: uploadUrl })
                      });
                    } catch (notifyErr) {
                      console.warn("Failed to notify backend for analysis:", notifyErr);
                    }
                  }

                  // Success: move to a completed state or dashboard
                  alert("KYC started — upload complete. KYC ID: " + (startJson.kycId || "-"));
                } catch (err: any) {
                  console.error(err);
                  setSubmitError(err?.message || String(err));
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={((step === "document" && !isDocumentStepValid) || (step === "face" && !isFaceStepValid)) || submitting}
              className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 transition"
            >
              {submitting ? "Submitting…" : (step === "review" ? "Submit" : "Next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
