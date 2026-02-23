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
      <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-5 font-[family-name:var(--font-poppins)]">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-[15px] text-white/80 hover:text-white transition-colors"
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
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {footerContacts.map((contact) => (
              <div
                key={contact.title}
                className="border border-white/20 rounded-lg p-5 bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <h4 className="font-semibold text-lg mb-4 font-[family-name:var(--font-poppins)]">
                  {contact.title}
                </h4>
                <div className="space-y-3 text-[15px] text-white/90">
                  <p className="flex items-start gap-2">
                    <MapPin className="size-4 mt-0.5 shrink-0" />
                    <span>{contact.address || "Piazza Grimaldi 1-3, 16124 Genova"}</span>
                  </p>
                  {contact.phones.map((phone) => (
                    <p key={phone} className="flex items-center gap-2">
                      <Phone className="size-4 shrink-0" />
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
                      <Mail className="size-4 shrink-0" />
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
          Middle Section: Links grid
         ============================ */}
      <div className="bg-[#A31825] text-white">
        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Logo & company info */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <Image
                  src="/images/logo/logo-footer.webp"
                  alt="Misha Travel"
                  width={180}
                  height={60}
                  className="h-12 w-auto"
                />
              </Link>
              <p className="text-sm text-white/70 leading-relaxed">
                Tour operator italiano specializzato in viaggi culturali, grandi
                itinerari e crociere fluviali in Europa e nel mondo.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="https://www.facebook.com/mishatravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Facebook className="size-4" />
                </a>
                <a
                  href="https://www.instagram.com/mishatravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Instagram className="size-4" />
                </a>
              </div>
            </div>

            {/* Link columns */}
            <FooterLinkList title="Link Rapidi" links={footerLinkRapidi} />
            <FooterLinkList title="Pagine Legali" links={footerPagineLegali} />
            <FooterLinkList title="Info Utili" links={footerInfoUtili} />
            <FooterLinkList title="Area Agenzie" links={footerAreaAgenzie} />
          </div>
        </div>
      </div>

      {/* ============================
          Bottom Bar: Copyright + Legal
         ============================ */}
      <div className="bg-[#8B1520] text-white/70">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>Crucemundo Italia Misha Travel S.r.l. &mdash; Sede Legale: Piazza Grimaldi 1-3-5-7 r, 16124 Genova &mdash; P.Iva 02531300990 &mdash; &copy; {new Date().getFullYear()}</p>
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
