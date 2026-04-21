import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Heart,
} from "lucide-react";
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

          {/* Contacts heading */}
          <div className="text-center mb-10">
            <h3 className="font-bold text-white text-2xl md:text-3xl uppercase tracking-wider font-[family-name:var(--font-poppins)]">
              I nostri contatti
            </h3>
            <div className="mx-auto mt-4 h-[3px] w-16 bg-white/60 rounded-full" />
          </div>

          {/* Contact row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {footerContacts.map((contact) => (
              <div
                key={contact.title}
                className="group/card relative rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 p-8 lg:p-10 transition-all duration-300 hover:-translate-y-1"
              >
                <h5 className="font-bold text-lg lg:text-xl text-white mb-6 font-[family-name:var(--font-poppins)]">
                  {contact.title}
                </h5>
                <div className="space-y-4">
                  {contact.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-4 group/link"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 group-hover/link:bg-white group-hover/link:text-[#A31825] text-white transition-all duration-300 shrink-0">
                        <Phone className="size-4" />
                      </span>
                      <span className="text-[17px] font-semibold text-white/95 group-hover/link:text-white transition-colors duration-300 tracking-wide">
                        {phone}
                      </span>
                    </a>
                  ))}
                  {contact.emails.map((email) => (
                    <a
                      key={email}
                      href={`mailto:${email}`}
                      className="flex items-center gap-4 group/link"
                    >
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 group-hover/link:bg-white group-hover/link:text-[#A31825] text-white transition-all duration-300 shrink-0">
                        <Mail className="size-4" />
                      </span>
                      <span className="text-sm text-white/85 group-hover/link:text-white transition-colors duration-300 break-all">
                        {email}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
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
          Credits BizStudio — contrast black band
         ============================ */}
      <div className="bg-black py-5">
        <a
          href="https://bizstudio.it"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 group/biz transition-all duration-300"
        >
          <Image
            src="https://i.ibb.co/XkFvvj94/favicon.png"
            alt="BizStudio"
            width={20}
            height={20}
            unoptimized
            className="w-5 h-5 opacity-70 group-hover/biz:opacity-100 transition-opacity"
          />
          <span className="text-white/50 text-xs group-hover/biz:text-white/90 transition-colors inline-flex items-center gap-1.5">
            Sito realizzato con
            <Heart
              className="size-3.5 text-[#C41E2F] group-hover/biz:text-red-400 transition-colors fill-current"
              aria-hidden="true"
            />
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
        </a>
      </div>
    </footer>
  );
}
