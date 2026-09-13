import { Phone, MessageCircle, Instagram, Facebook, Share2 } from "lucide-react";

type LandingFooterProps = {
  storeName?: string;
  storePhone?: string;
  whatsappNumber?: string;
};

export function LandingFooter({ storeName, storePhone, whatsappNumber }: LandingFooterProps) {
  const name = storeName || "Urban Spice";
  const phone = storePhone || "0300-5225898";
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const whatsapp = whatsappNumber || phone;
  const cleanWhatsapp = whatsapp.replace(/[^0-9+]/g, "");

  return (
    <footer className="mt-16 bg-[#4a0a18] text-white border-t border-[#720019] py-10 px-4">
      <div className="mx-auto max-w-4xl flex flex-col items-center justify-center text-center space-y-6">
        {/* Brand Name */}
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-[#d7b56d]">{name}</h2>
          <p className="text-xs text-rose-200/80 mt-1 font-medium">Ultimate Taste In Every Bite</p>
        </div>

        {/* Clickable Phone & WhatsApp Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#d7b56d] hover:bg-[#c4a159] text-slate-950 font-extrabold text-sm shadow-md transition-transform hover:scale-105"
          >
            <Phone className="h-4 w-4" />
            <span>Call Us: {phone}</span>
          </a>

          {cleanWhatsapp && (
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-transform hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp: {whatsapp}</span>
            </a>
          )}
        </div>

        {/* Clickable Social Media Buttons */}
        <div className="space-y-3 pt-2">
          <p className="text-xs uppercase tracking-widest font-extrabold text-[#d7b56d]">
            Connect With Us
          </p>
          <div className="flex items-center justify-center gap-3">
            {/* Facebook Button */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#d7b56d] hover:text-slate-950 text-white flex items-center justify-center transition-all hover:scale-110 border border-white/20"
            >
              <Facebook className="h-5 w-5" />
            </a>

            {/* Instagram Button */}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#d7b56d] hover:text-slate-950 text-white flex items-center justify-center transition-all hover:scale-110 border border-white/20"
            >
              <Instagram className="h-5 w-5" />
            </a>

            {/* WhatsApp Link Button */}
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-500 hover:text-white text-white flex items-center justify-center transition-all hover:scale-110 border border-white/20"
            >
              <MessageCircle className="h-5 w-5" />
            </a>

            {/* Share / Social Offers Button */}
            <a
              href="#"
              title="Social Media Offers"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#d7b56d] hover:text-slate-950 text-white flex items-center justify-center transition-all hover:scale-110 border border-white/20"
            >
              <Share2 className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Follow us for interesting offers */}
        <div className="pt-1">
          <a
            href="#"
            className="inline-block text-sm font-bold text-[#d7b56d] hover:text-amber-200 underline decoration-[#d7b56d]/50 underline-offset-4 transition-colors"
          >
            👉 Follow us for interesting offers
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 w-full pt-4 text-xs text-rose-200/60 font-medium">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
