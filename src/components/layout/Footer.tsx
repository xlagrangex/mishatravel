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

export default function Footer() {
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
          <div className="border-t border-white/20 mt-14 pt-10" />

          {/* Contact row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerContacts.map((contact) => (
              <div
                key={contact.title}
                className="group/card rounded-lg p-4 -m-4 hover:bg-white/5 transition-all duration-300"
              >
                <h5 className="font-semibold text-base text-white mb-3 font-[family-name:var(--font-poppins)] group-hover/card:translate-x-0.5 transition-transform duration-300">
                  {contact.title}
                </h5>
                <div className="space-y-2 text-[15px] text-white/85">
                  {contact.phones.map((phone) => (
                    <p key={phone} className="flex items-center gap-2.5">
                      <Phone className="size-4 shrink-0 text-white/60" />
                      <a
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="hover:text-white transition-colors duration-300"
                      >
                        {phone}
                      </a>
                    </p>
                  ))}
                  {contact.emails.map((email) => (
                    <p key={email} className="flex items-center gap-2.5">
                      <Mail className="size-4 shrink-0 text-white/60" />
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-white transition-colors duration-300"
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
      <div className="bg-[#8B1520] text-white/75">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
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
              className="underline hover:text-white transition-colors duration-300"
            >
              Biz Studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
