import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
} from "lucide-react";
import {
  footerContacts,
  footerLinkRapidi,
  footerPagineLegali,
  footerInfoUtili,
  footerAreaAgenzie,
} from "@/lib/data";

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4 font-[family-name:var(--font-poppins)]">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-[15px] text-white/75 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer>
      {/* ============================
          Main Section: Logo + Links + Contacts
         ============================ */}
      <div className="bg-[#A31825] text-white">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          {/* Top area: Logo left + Links 2×2 right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Logo & company info */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-block mb-5">
                <Image
                  src="/images/logo/logo-footer.webp"
                  alt="Misha Travel"
                  width={220}
                  height={70}
                  className="h-14 w-auto"
                />
              </Link>
              <p className="text-[15px] text-white/65 leading-relaxed max-w-sm">
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
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Facebook className="size-5" />
                </a>
                <a
                  href="https://www.instagram.com/mishatravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Instagram className="size-5" />
                </a>
              </div>
            </div>

            {/* Link columns in 2×2 grid */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10">
                <FooterLinkList title="Link Rapidi" links={footerLinkRapidi} />
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
          <div className="border-t border-white/15 mt-12 pt-10" />

          {/* Contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {footerContacts.map((contact) => (
              <div key={contact.title}>
                <h5 className="font-semibold text-sm mb-2 font-[family-name:var(--font-poppins)]">
                  {contact.title}
                </h5>
                <div className="space-y-1.5 text-sm text-white/70">
                  {contact.phones.map((phone) => (
                    <p key={phone} className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0" />
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="hover:text-white transition-colors"
                      >
                        {phone}
                      </a>
                    </p>
                  ))}
                  {contact.emails.map((email) => (
                    <p key={email} className="flex items-center gap-2">
                      <Mail className="size-3.5 shrink-0" />
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-white transition-colors"
                      >
                        {email}
                      </a>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================
          Bottom Bar: Legal + Credits
         ============================ */}
      <div className="bg-[#8B1520] text-white/60">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>
            Crucemundo Italia Misha Travel S.r.l. &mdash; Sede Legale: Piazza
            Grimaldi 1-3-5-7 r, 16124 Genova &mdash; P.Iva 02531300990 &mdash;
            &copy; {new Date().getFullYear()}
          </p>
          <p>
            Sito realizzato da{" "}
            <a
              href="https://bizstudio.it"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              Biz Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
