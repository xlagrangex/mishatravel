import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Heart,
  Headset,
  Briefcase,
  Calculator,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

function getContactIcon(title: string): LucideIcon {
  const t = title.toLowerCase();
  if (t.includes("booking") || t.includes("programmazione")) return Headset;
  if (t.includes("contabil")) return Calculator;
  return Briefcase;
}
import {
  footerContacts,
  footerLinkRapidi,
  footerPagineLegali,
  footerInfoUtili,
  footerAreaAgenzie,
} from "@/lib/data";
import CookieSettingsButton from "@/components/cookie/CookieSettingsButton";

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-bold text-white text-base uppercase tracking-wider mb-5 font-[family-name:var(--font-poppins)] border-b border-white/25 pb-2">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white transition-all duration-300"
            >
              <span className="inline-block w-0 group-hover:w-2.5 h-px bg-white transition-all duration-300" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ blogEnabled = true }: { blogEnabled?: boolean }) {
  const linkRapidi = blogEnabled
    ? footerLinkRapidi
    : footerLinkRapidi.filter((l) => l.label !== "Blog");
  return (
    <footer>
      {/* ============================
          Main Section: Logo + Links + Contacts
         ============================ */}
      <div className="bg-[#A31825] text-white">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          {/* Top area: Logo left + Links right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Logo & company info */}
            <div className="lg:col-span-4">
              <Link
                href="/"
                className="group inline-block mb-6"
              >
                <Image
                  src="/images/logo/logo-footer.webp"
                  alt="Misha Travel"
                  width={280}
                  height={90}
                  className="h-20 w-auto transition-all duration-500 group-hover:brightness-110 group-hover:scale-[1.02]"
                />
              </Link>
              <p className="text-base text-white/80 leading-relaxed max-w-sm">
                Tour operator italiano specializzato in viaggi culturali, grandi
                itinerari e crociere fluviali in Europa e nel mondo.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3 mt-6">
                <a
                  href="https://www.facebook.com/mishatravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="group/social p-3 rounded-full bg-white/10 hover:bg-white hover:scale-110 transition-all duration-300"
                >
                  <Facebook className="size-5 text-white group-hover/social:text-[#A31825] transition-colors duration-300" />
                </a>
                <a
                  href="https://www.instagram.com/mishatravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="group/social p-3 rounded-full bg-white/10 hover:bg-white hover:scale-110 transition-all duration-300"
                >
                  <Instagram className="size-5 text-white group-hover/social:text-[#A31825] transition-colors duration-300" />
                </a>
              </div>
            </div>

            {/* Link columns */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10">
                <FooterLinkList title="Link Rapidi" links={linkRapidi} />
                <FooterLinkList
                  title="Pagine Legali"
                  links={footerPagineLegali}
                />
                <FooterLinkList title="Info Utili" links={footerInfoUtili} />
                <FooterLinkList
                  title="Area Agenzie"
                  links={footerAreaAgenzie}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/20 mt-14 pt-12" />

          {/* Contact row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
            {footerContacts.map((contact) => {
              const Icon = getContactIcon(contact.title);
              return (
                <div
                  key={contact.title}
                  className="group/card relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:border-white/40 hover:from-white/[0.14] hover:to-white/[0.04] p-7 lg:p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Decorative glow in corner */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/10 blur-3xl transition-opacity duration-500 opacity-60 group-hover/card:opacity-100"
                  />
                  {/* Giant watermark icon */}
                  <Icon
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-6 -right-6 size-44 text-white/5 group-hover/card:text-white/10 transition-colors duration-500"
                    strokeWidth={1}
                  />

                  <div className="relative">
                    {/* Icon badge */}
                    <div className="mb-5 inline-flex items-center justify-center size-12 rounded-xl bg-white text-[#A31825] shadow-lg shadow-black/20 group-hover/card:scale-105 transition-transform duration-500">
                      <Icon className="size-6" strokeWidth={2.2} />
                    </div>

                    {/* Department name */}
                    <h5 className="font-bold text-[17px] text-white font-[family-name:var(--font-poppins)] leading-snug mb-5">
                      {contact.title}
                    </h5>

                    {/* Divider */}
                    <div className="h-px bg-white/20 mb-5" />

                    {/* Contacts */}
                    <div className="space-y-3">
                      {contact.phones.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone.replace(/\s/g, "")}`}
                          className="flex items-center gap-3 group/link"
                        >
                          <Phone className="size-4 text-white/70 group-hover/link:text-white shrink-0 transition-colors" strokeWidth={2} />
                          <span className="text-base font-semibold text-white group-hover/link:text-white transition-colors tracking-wide">
                            {phone}
                          </span>
                        </a>
                      ))}
                      {contact.emails.map((email) => (
                        <a
                          key={email}
                          href={`mailto:${email}`}
                          className="flex items-center gap-3 group/link"
                        >
                          <Mail className="size-4 text-white/70 group-hover/link:text-white shrink-0 transition-colors" strokeWidth={2} />
                          <span className="text-base font-semibold text-white group-hover/link:text-white transition-colors break-all">
                            {email}
                          </span>
                        </a>
                      ))}
                    </div>

                    {/* CTA arrow — shows on hover */}
                    <div className="mt-6 flex items-center justify-end">
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-5 text-white/40 group-hover/card:text-white group-hover/card:translate-x-1 group-hover/card:-translate-y-1 transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================
          Legal bar: company info + cookies
         ============================ */}
      <div className="bg-[#8B1520] text-white/75">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p>
            Crucemundo Italia Misha Travel S.r.l. &mdash; Sede Legale: Piazza
            Grimaldi 1-3-5-7 r, 16124 Genova &mdash; P.Iva 02531300990 &mdash;
            &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-3">
            <CookieSettingsButton />
          </div>
        </div>
      </div>

      {/* ============================
          Credits BizStudio — red band with hover slide-up reveal
         ============================ */}
      <div className="bg-[#8B1520] border-t border-white/15 py-3">
        <a
          href="https://bizstudio.it"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 group/biz"
        >
          <Image
            src="https://i.ibb.co/XkFvvj94/favicon.png"
            alt="BizStudio"
            width={21}
            height={21}
            unoptimized
            className="w-[21px] h-[21px] transition-all duration-300 group-hover/biz:brightness-125 group-hover/biz:scale-110"
          />
          <span className="relative overflow-hidden h-5 inline-flex items-center whitespace-nowrap">
            {/* Sizing ghost: keeps the wrapper at the correct intrinsic width */}
            <span className="invisible inline-flex items-center text-xs" aria-hidden="true">
              Sito realizzato con
              <Heart className="size-3 mx-1 fill-current" aria-hidden="true" />
              da&nbsp;
              <span
                style={{
                  fontStyle: "italic",
                  fontWeight: 200,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                }}
              >
                Biz
              </span>
              <span
                style={{
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                }}
              >
                Studio
              </span>
            </span>
            <span
              className="absolute inset-0 inline-flex items-center text-white/85 text-xs transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/biz:-translate-y-full"
            >
              Sito realizzato con
              <Heart className="size-3 mx-1 text-white fill-current" aria-hidden="true" />
              da&nbsp;
              <span
                style={{
                  fontStyle: "italic",
                  fontWeight: 200,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                }}
              >
                Biz
              </span>
              <span
                style={{
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                }}
              >
                Studio
              </span>
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-0 inline-flex items-center text-white text-xs translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/biz:translate-y-0"
            >
              Sito realizzato con
              <Heart className="size-3 mx-1 text-white fill-current" aria-hidden="true" />
              da&nbsp;
              <span
                style={{
                  fontStyle: "italic",
                  fontWeight: 200,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                }}
              >
                Biz
              </span>
              <span
                style={{
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                }}
              >
                Studio
              </span>
            </span>
          </span>
        </a>
      </div>
    </footer>
  );
}
