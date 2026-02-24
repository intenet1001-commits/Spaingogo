"use client";

import { useState } from "react";
import { Phone, X } from "lucide-react";
import { EMERGENCY_CONTACTS } from "@/infrastructure/data/emergency";
import type { EmergencyContact } from "@/infrastructure/data/emergency";
import { cn } from "@/lib/utils";

export default function EmergencyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating SOS button - bottom-right, above hotel FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-40 right-4 z-40 w-14 h-14 rounded-full bg-[#C60B1E] text-white shadow-warm-lg flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
        aria-label="긴급연락처"
      >
        <span className="text-lg leading-none">🆘</span>
        <span className="text-[9px] font-bold leading-none">SOS</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      {open && (
        <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white dark:bg-[#1A1209] rounded-t-3xl shadow-2xl animate-slide-up">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-[#E8DDD0]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8]">
                🆘 긴급 연락처
              </h2>
              <p className="text-xs text-[#8A7A6A] mt-0.5">
                탭하면 바로 전화연결됩니다
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-[#F5F0E8] flex items-center justify-center"
            >
              <X size={16} className="text-[#6B5E4E]" />
            </button>
          </div>

          {/* Contact list */}
          <div className="px-4 pb-8 space-y-2 max-h-[70vh] overflow-y-auto">
            {/* Emergency section */}
            <p className="text-xs font-bold text-[#C60B1E] uppercase tracking-wider mb-2">
              🚨 긴급
            </p>
            {EMERGENCY_CONTACTS.filter((c) =>
              ["emergency", "medical"].includes(c.category)
            ).map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}

            <p className="text-xs font-bold text-[#6B5E4E] uppercase tracking-wider mt-4 mb-2">
              👮 경찰
            </p>
            {EMERGENCY_CONTACTS.filter((c) => c.category === "police").map(
              (contact) => (
                <ContactCard key={contact.id} contact={contact} />
              )
            )}

            <p className="text-xs font-bold text-[#6B7C3E] uppercase tracking-wider mt-4 mb-2">
              🇰🇷 영사관 & 호텔
            </p>
            {EMERGENCY_CONTACTS.filter((c) =>
              ["consulate", "hotel"].includes(c.category)
            ).map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}

            <p className="text-xs font-bold text-[#5A6E9E] uppercase tracking-wider mt-4 mb-2">
              🏢 회사
            </p>
            {EMERGENCY_CONTACTS.filter((c) => c.category === "company").map(
              (contact) => (
                <ContactCard key={contact.id} contact={contact} />
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const isEmergency =
    contact.category === "emergency" || contact.category === "medical";

  return (
    <a
      href={`tel:${contact.phone}`}
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-2xl border transition-all active:scale-[0.98]",
        isEmergency
          ? "bg-[#C60B1E]/8 border-[#C60B1E]/30 hover:bg-[#C60B1E]/12"
          : "bg-white dark:bg-[#2A2018] border-[#E8DDD0] dark:border-[#3A2E24] hover:border-[#C60B1E]/30"
      )}
    >
      <span className="text-2xl flex-shrink-0">{contact.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-[#1A1209] dark:text-[#F5F0E8]">
            {contact.nameKo}
          </p>
          {isEmergency && (
            <span className="text-[10px] font-bold bg-[#C60B1E] text-white px-1.5 py-0.5 rounded-full">
              긴급
            </span>
          )}
        </div>
        <p className="text-xs text-[#8A7A6A] truncate mt-0.5">
          {contact.description}
        </p>
        {contact.hours && (
          <p className="text-[10px] text-[#6B7C3E] mt-0.5">
            🕐 {contact.hours}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className={cn(
            "font-bold text-base",
            isEmergency
              ? "text-[#C60B1E]"
              : "text-[#1A1209] dark:text-[#F5F0E8]"
          )}
        >
          {contact.phone}
        </span>
        <Phone size={14} className="text-[#6B7C3E]" />
      </div>
    </a>
  );
}
