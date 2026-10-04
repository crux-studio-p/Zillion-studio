"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Nav } from "@/components/hero/Nav";
import { submitApplication } from "@/lib/actions/affiliate.actions";

export default function AffiliateProgramPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      discordName: formData.get("discordName") as string,
      email: formData.get("email") as string,
      communityName: formData.get("communityName") as string,
      reach: formData.get("reach") as string,
      walletId: formData.get("walletId") as string,
      socialLinks: formData.get("socialLinks") as string,
      experience: formData.get("experience") as string,
      whyResell: formData.get("whyResell") as string,
      couponSplit: formData.get("couponSplit") as string,
      preferredCodeName: formData.get("preferredCodeName") as string,
      additionalInfo: formData.get("additionalInfo") as string,
    };

    try {
      await submitApplication(data);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <div className="h-[100dvh] relative flex items-center justify-center p-4 md:p-8 pt-[100px] md:pt-[120px] pb-4 md:pb-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/affiliate-program-bg.png" 
            alt="Background" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/5 backdrop-blur-md"></div>
        </div>

        {/* Main Card */}
        <div className="relative z-10 w-full max-w-6xl h-full bg-[#fafafa] rounded-3xl md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/40">
        
        {/* Left Side - Image */}
        <div className="hidden md:block w-1/2 p-3">
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
            <Image 
              src="/affiliate-program-bg.png" 
              alt="Pixel art landscape" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 bg-[#fafafa] h-full min-h-0">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-serif text-foreground mb-4">Application Received!</h2>
              <p className="text-muted-foreground mb-8">
                Thank you for applying to the Zillion Studios Affiliate Program. We will review your application and email you soon with our decision.
              </p>
              <Link href="/" className="bg-black text-white font-medium rounded-xl px-8 py-3 hover:bg-neutral-800 transition-colors">
                Return to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
            
            {/* Header (Sticky) */}
            <div className="px-5 sm:px-8 md:px-8 lg:px-10 pt-8 md:pt-10 pb-4 shrink-0 bg-[#fafafa] z-10">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-black transition-colors mb-8">
                <ArrowLeft size={16} />
                Back
              </Link>
              
              <p className="text-sm font-semibold text-muted-foreground mb-1">Join the team</p>
              <h1 className="text-3xl md:text-4xl font-serif text-foreground leading-tight mb-2">
                Apply for the<br />Affiliate Program
              </h1>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {/* Form Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-8 md:px-8 lg:px-10 pb-6 custom-scrollbar space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700 ml-1">Discord name</label>
                    <input required name="discordName" type="text" placeholder="username#0000" className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700 ml-1">Email Address</label>
                    <input required name="email" type="email" placeholder="you@example.com" className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700 ml-1">Community / server name</label>
                  <input name="communityName" type="text" placeholder="My Roleplay Server (optional)" className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700 ml-1">Audience size / reach</label>
                    <select name="reach" className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow appearance-none">
                      <option value="">Select size...</option>
                      <option value="0-500">0 - 500 members</option>
                      <option value="500-2000">500 - 2,000 members</option>
                      <option value="2000-5000">2,000 - 5,000 members</option>
                      <option value="5000+">5,000+ members</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700 ml-1">Tebex wallet ID</label>
                    <input required name="walletId" type="text" placeholder="Wallet ID for payout" className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700 ml-1">Social / store links</label>
                  <input required name="socialLinks" type="text" placeholder="https://..." className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700 ml-1">Reselling / promo experience</label>
                  <textarea required name="experience" rows={2} placeholder="Have you resold or promoted assets before?" className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow resize-none"></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700 ml-1">Why do you want to resell Zillion Studios assets?</label>
                  <textarea required name="whyResell" rows={3} placeholder="Tell us why you are a good fit" className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow resize-none"></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700 ml-1">15% coupon split</label>
                    <select required name="couponSplit" className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow appearance-none">
                      <option value="15-0">15% me / 0% customer</option>
                      <option value="10-5">10% me / 5% customer</option>
                      <option value="5-10">5% me / 10% customer</option>
                      <option value="0-15">0% me / 15% customer</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-700 ml-1">Preferred coupon name</label>
                    <input name="preferredCodeName" type="text" placeholder="e.g. ZILLION10 (optional)" className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-neutral-700 ml-1">Anything else we should know?</label>
                  <textarea name="additionalInfo" rows={2} placeholder="Optional details..." className="w-full bg-black/[0.04] border-none rounded-2xl px-4 py-3.5 text-sm text-foreground focus:ring-2 focus:ring-black/10 focus:outline-none transition-shadow resize-none"></textarea>
                </div>

            </div>

            {/* Footer (Sticky) */}
            <div className="px-5 sm:px-8 md:px-8 lg:px-10 py-5 md:py-6 shrink-0 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent z-10 border-t border-border">
              <button disabled={isLoading} type="submit" className="w-full bg-black text-white font-medium rounded-2xl py-4 hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10 disabled:opacity-50 flex justify-center items-center gap-2">
                {isLoading ? "Submitting..." : "Submit Application"}
              </button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                By applying, you agree to our <a href="#" className="text-blue-600 hover:underline">Affiliate Terms</a>.
              </p>
            </div>
            
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
