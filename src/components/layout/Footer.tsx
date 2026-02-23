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
      <h4 className="font-semibold text-white text-base uppercase tracking-wider mb-5 font-[family-name:var(--font-poppins)]">
        {title}
      </h4>
      <ul className="space-y-3">
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
          Top Section: Contact columns
         ============================ */}
      <div className="bg-[#C41E2F] text-white">
        <div className="container mx-auto px-4 py-14 lg:py-16">
          <h3 className="text-2xl font-bold font-[family-name:var(--font-poppins)] mb-10 text-center">
            Contattaci
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {footerContacts.map((contact) => (
              <div
                key={contact.title}
                className="border border-white/20 rounded-xl p-6 bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <h4 className="font-semibold text-lg mb-5 font-[family-name:var(--font-poppins)]">
                  {contact.title}
                </h4>
                <div className="space-y-3 text-[15px] text-white/90">
                  <p className="flex items-start gap-3">
                    <MapPin className="size-[18px] mt-0.5 shrink-0 text-white/70" />
                    <span>{contact.address || "Piazza Grimaldi 1-3, 16124 Genova"}</span>
                  </p>
                  {contact.phones.map((phone) => (
                    <p key={phone} className="flex items-center gap-3">
                      <Phone className="size-[18px] shrink-0 text-white/70" />
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="hover:text-white transition-colors"
                      >
                        {phone}
                      </a>
                    </p>
                  ))}
                  {contact.emails.map((email) => (
                    <p key={email} className="flex items-center gap-3">
                      <Mail className="size-[18px] shrink-0 text-white/70" />
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
          Middle Section: Logo + Links grid
         ============================ */}
      <div className="bg-[#1B2D4F] text-white">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

            {/* Logo & company info - wider column */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-block mb-6">
                <Image
                  src="/images/logo/logo-footer.webp"
                  alt="Misha Travel"
                  width={220}
                  height={70}
                  className="h-14 w-auto"
                />
              </Link>
              <p className="text-[15px] text-white/65 leading-relaxed mb-6 max-w-sm">
                Tour operator italiano specializzato in viaggi culturali, grandi
                itinerari e crociere fluviali in Europa e nel mondo.
              </p>

              {/* Company legal info */}
              <div className="text-sm text-white/50 leading-relaxed mb-6 space-y-1">
                <p className="font-medium text-white/65">Crucemundo Italia Misha Travel S.r.l.</p>
                <p>Sede Legale: Piazza Grimaldi 1-3-5-7 r</p>
                <p>16124 - Genova</p>
                <p>P.Iva 02531300990</p>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
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

            {/* Link columns - evenly spaced */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-8">
                <FooterLinkList title="Link Rapidi" links={footerLinkRapidi} />
                <FooterLinkList title="Pagine Legali" links={footerPagineLegali} />
                <FooterLinkList title="Info Utili" links={footerInfoUtili} />
                <FooterLinkList title="Area Agenzie" links={footerAreaAgenzie} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ============================
          Bottom Bar: Copyright
         ============================ */}
      <div className="bg-[#142340] text-white/50">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p>Crucemundo Italia Misha Travel S.r.l. &copy; {new Date().getFullYear()} &mdash; Tutti i diritti riservati</p>
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
