import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { QuotePdfPayload } from "./quote-pdf-data";

// ---------------------------------------------------------------------------
// Brand constants
// ---------------------------------------------------------------------------

const BRAND = {
  red: "#C41E2F",
  navy: "#1B2D4F",
  gray: "#64748B",
  lightGray: "#F1F5F9",
  border: "#E2E8F0",
  white: "#FFFFFF",
  text: "#1E293B",
  textLight: "#475569",
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BRAND.text,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  // Header/Footer on every page
  pageHeader: {
    position: "absolute",
    top: 15,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${BRAND.border}`,
    paddingBottom: 6,
  },
  pageHeaderText: {
    fontSize: 7,
    color: BRAND.gray,
  },
  pageFooter: {
    position: "absolute",
    bottom: 15,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: `1px solid ${BRAND.border}`,
    paddingTop: 6,
  },
  pageFooterText: {
    fontSize: 6.5,
    color: BRAND.gray,
  },
  // Cover
  coverPage: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BRAND.text,
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  coverLogo: {
    width: 180,
    marginBottom: 20,
  },
  coverTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND.red,
    letterSpacing: 4,
    marginBottom: 8,
  },
  coverProductName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: BRAND.navy,
    marginBottom: 6,
  },
  coverSubtitle: {
    fontSize: 12,
    color: BRAND.textLight,
    marginBottom: 24,
  },
  coverImage: {
    width: "100%",
    height: 220,
    objectFit: "cover",
    borderRadius: 4,
    marginBottom: 24,
  },
  coverInfoBox: {
    backgroundColor: BRAND.lightGray,
    borderRadius: 4,
    padding: 16,
  },
  coverInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  coverInfoLabel: {
    fontSize: 8,
    color: BRAND.gray,
  },
  coverInfoValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BRAND.navy,
  },
  // Sections
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 16,
    borderBottom: `2px solid ${BRAND.red}`,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: BRAND.navy,
  },
  // Itinerary
  itineraryDay: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 10,
  },
  dayNumber: {
    width: 40,
    minWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.red,
    justifyContent: "center",
    alignItems: "center",
  },
  dayNumberText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND.white,
  },
  dayContent: {
    flex: 1,
    paddingTop: 2,
  },
  dayLocality: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BRAND.navy,
    marginBottom: 2,
  },
  dayDesc: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: BRAND.textLight,
  },
  // Map
  mapImage: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 8,
  },
  // Tables
  table: {
    marginBottom: 8,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: BRAND.navy,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: BRAND.white,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: `0.5px solid ${BRAND.border}`,
  },
  tableRowAlt: {
    backgroundColor: BRAND.lightGray,
  },
  tableCell: {
    fontSize: 8,
  },
  // Hotels
  hotelStars: {
    color: "#F59E0B",
    fontSize: 8,
  },
  // Inclusions
  inclusionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 6,
  },
  checkMark: {
    fontSize: 10,
    color: "#16A34A",
    fontFamily: "Helvetica-Bold",
    width: 14,
  },
  crossMark: {
    fontSize: 10,
    color: BRAND.red,
    fontFamily: "Helvetica-Bold",
    width: 14,
  },
  inclusionText: {
    fontSize: 8.5,
    flex: 1,
    lineHeight: 1.4,
  },
  // Offer highlight box
  offerBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 4,
    border: `1px solid #F59E0B`,
    padding: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  offerPrice: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: BRAND.red,
    marginBottom: 4,
  },
  offerLabel: {
    fontSize: 8,
    color: BRAND.gray,
    marginBottom: 2,
  },
  offerValue: {
    fontSize: 9,
    marginBottom: 4,
  },
  // Conditions
  conditionItem: {
    fontSize: 8,
    lineHeight: 1.5,
    marginBottom: 3,
    color: BRAND.textLight,
  },
  // Final page
  finalBox: {
    backgroundColor: BRAND.navy,
    borderRadius: 4,
    padding: 20,
    marginTop: 20,
    alignItems: "center",
  },
  finalLogo: {
    width: 140,
    marginBottom: 12,
  },
  finalText: {
    fontSize: 8,
    color: BRAND.white,
    textAlign: "center",
    marginBottom: 3,
  },
  finalBold: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BRAND.white,
    textAlign: "center",
    marginBottom: 3,
  },
  // Ship info
  shipBox: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  shipImage: {
    width: 120,
    height: 80,
    objectFit: "cover",
    borderRadius: 4,
  },
  shipInfo: {
    flex: 1,
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags from string */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&agrave;/g, "a")
    .replace(/&egrave;/g, "e")
    .replace(/&igrave;/g, "i")
    .replace(/&ograve;/g, "o")
    .replace(/&ugrave;/g, "u")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "...")
    .replace(/&mdash;/g, " - ")
    .replace(/&ndash;/g, " - ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatPrice(value: string | number | null): string {
  if (value == null) return "-";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(num);
}

function stars(n: number): string {
  return "\u2605".repeat(n);
}

// ---------------------------------------------------------------------------
// Header / Footer wrappers
// ---------------------------------------------------------------------------

function PageHeader({ logoUrl }: { logoUrl: string }) {
  return (
    <View style={s.pageHeader} fixed>
      <Image src={logoUrl} style={{ width: 80 }} />
      <Text style={s.pageHeaderText}>www.mishatravel.com</Text>
    </View>
  );
}

function PageFooterBlock({ quoteId }: { quoteId: string }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.pageFooterText}>
        MishaTravel S.r.l. | info@mishatravel.com | +39 06 XXX XXXX
      </Text>
      <Text
        style={s.pageFooterText}
        render={({ pageNumber, totalPages }) =>
          `Rif. #${quoteId.slice(0, 8).toUpperCase()} | Pag. ${pageNumber}/${totalPages}`
        }
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Section header helper
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Document Component
// ---------------------------------------------------------------------------

interface QuotePdfDocumentProps {
  data: QuotePdfPayload;
  mapImageBase64: string | null;
  logoUrl: string;
}

export default function QuotePdfDocument({
  data,
  mapImageBase64,
  logoUrl,
}: QuotePdfDocumentProps) {
  const pensioneMap: Record<string, string> = {
    no: "Senza pasti",
    mezza: "Mezza pensione",
    completa: "Pensione completa",
  };
  const pensioneLabel =
    data.pensione.map((p) => pensioneMap[p] ?? p).join(", ") || null;

  const included = data.inclusions.filter((i) => i.is_included);
  const excluded = data.inclusions.filter((i) => !i.is_included);

  // Collect all unique price labels from departures for table header
  const priceLabels: string[] = [];
  for (const dep of data.departures) {
    for (const p of dep.prices) {
      if (!priceLabels.includes(p.label)) priceLabels.push(p.label);
    }
  }

  return (
    <Document
      title={`Preventivo - ${data.title}`}
      author="MishaTravel"
      subject={`Preventivo per ${data.agency.business_name}`}
    >
      {/* ================================================================= */}
      {/* PAGE 1: COVER */}
      {/* ================================================================= */}
      <Page size="A4" style={s.coverPage}>
        <View>
          <Image src={logoUrl} style={s.coverLogo} />
          <Text style={s.coverTitle}>PREVENTIVO</Text>
          <Text style={s.coverProductName}>{data.title}</Text>
          <Text style={s.coverSubtitle}>
            {[data.destinationName, data.durataNotti ? `${data.durataNotti} notti` : null]
              .filter(Boolean)
              .join("  \u2022  ")}
          </Text>

          {data.coverImageUrl && (
            <Image src={data.coverImageUrl} style={s.coverImage} />
          )}
        </View>

        <View style={s.coverInfoBox}>
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Per</Text>
            <Text style={s.coverInfoValue}>
              {data.agency.business_name}
              {data.agency.city ? ` - ${data.agency.city}` : ""}
            </Text>
          </View>
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Tipo</Text>
            <Text style={s.coverInfoValue}>
              {data.requestType === "tour" ? "Tour" : "Crociera Fluviale"}
            </Text>
          </View>
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Partecipanti</Text>
            <Text style={s.coverInfoValue}>
              {data.participantsAdults} adulti
              {data.participantsChildren > 0
                ? `, ${data.participantsChildren} bambini`
                : ""}
            </Text>
          </View>
          {data.cabinType && (
            <View style={s.coverInfoRow}>
              <Text style={s.coverInfoLabel}>Tipo Cabina</Text>
              <Text style={s.coverInfoValue}>{data.cabinType}</Text>
            </View>
          )}
          {pensioneLabel && (
            <View style={s.coverInfoRow}>
              <Text style={s.coverInfoLabel}>Trattamento</Text>
              <Text style={s.coverInfoValue}>{pensioneLabel}</Text>
            </View>
          )}
          {data.tipoVoli && (
            <View style={s.coverInfoRow}>
              <Text style={s.coverInfoLabel}>Voli</Text>
              <Text style={s.coverInfoValue}>{data.tipoVoli}</Text>
            </View>
          )}
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Data preventivo</Text>
            <Text style={s.coverInfoValue}>
              {formatDate(data.quoteCreatedAt)}
            </Text>
          </View>
          <View style={s.coverInfoRow}>
            <Text style={s.coverInfoLabel}>Riferimento</Text>
            <Text style={s.coverInfoValue}>
              #{data.quoteId.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>
      </Page>

      {/* ================================================================= */}
      {/* PAGE 2+: ITINERARY */}
      {/* ================================================================= */}
      {data.itinerary.length > 0 && (
        <Page size="A4" style={s.page} wrap>
          <PageHeader logoUrl={logoUrl} />
          <PageFooterBlock quoteId={data.quoteId} />

          <SectionHeader title="Programma Dettagliato" />

          {data.itinerary.map((day, idx) => (
            <View
              key={idx}
              style={s.itineraryDay}
              wrap={false}
            >
              <View style={s.dayNumber}>
                <Text style={s.dayNumberText}>{day.numero_giorno}</Text>
              </View>
              <View style={s.dayContent}>
                <Text style={s.dayLocality}>{day.localita}</Text>
                <Text style={s.dayDesc}>
                  {stripHtml(day.descrizione)}
                </Text>
              </View>
            </View>
          ))}

          {/* Static Map */}
          {mapImageBase64 && (
            <View wrap={false}>
              <SectionHeader title="Mappa del Percorso" />
              <Image
                src={`data:image/png;base64,${mapImageBase64}`}
                style={s.mapImage}
              />
              <Text style={{ fontSize: 7, color: BRAND.gray, textAlign: "center" }}>
                {data.locations.map((l) => l.nome).join("  \u2192  ")}
              </Text>
            </View>
          )}
        </Page>
      )}

      {/* ================================================================= */}
      {/* PAGE: HOTELS / SHIP */}
      {/* ================================================================= */}
      {(data.hotels.length > 0 || data.ship) && (
        <Page size="A4" style={s.page} wrap>
          <PageHeader logoUrl={logoUrl} />
          <PageFooterBlock quoteId={data.quoteId} />

          {/* Hotels (tour) */}
          {data.hotels.length > 0 && (
            <>
              <SectionHeader title="Alloggi" />
              <View style={s.table}>
                <View style={s.tableHeaderRow}>
                  <Text style={[s.tableHeaderCell, { flex: 2 }]}>Localita</Text>
                  <Text style={[s.tableHeaderCell, { flex: 3 }]}>Hotel</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1 }]}>Cat.</Text>
                </View>
                {data.hotels.map((h, idx) => (
                  <View
                    key={idx}
                    style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
                  >
                    <Text style={[s.tableCell, { flex: 2 }]}>{h.localita}</Text>
                    <Text style={[s.tableCell, { flex: 3 }]}>{h.nome_albergo}</Text>
                    <Text style={[s.hotelStars, { flex: 1 }]}>
                      {stars(h.stelle)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Ship info (cruise) */}
          {data.ship && (
            <>
              <SectionHeader title="La Nave" />
              <View style={s.shipBox}>
                {data.ship.cover_image_url && (
                  <Image src={data.ship.cover_image_url} style={s.shipImage} />
                )}
                <View style={s.shipInfo}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Helvetica-Bold",
                      color: BRAND.navy,
                      marginBottom: 4,
                    }}
                  >
                    {data.ship.name}
                  </Text>
                  {data.cabinType && (
                    <Text style={{ fontSize: 9, color: BRAND.textLight }}>
                      Cabina richiesta: {data.cabinType}
                    </Text>
                  )}
                  {data.numCabins && (
                    <Text style={{ fontSize: 9, color: BRAND.textLight }}>
                      Numero cabine: {data.numCabins}
                    </Text>
                  )}
                </View>
              </View>
            </>
          )}
        </Page>
      )}

      {/* ================================================================= */}
      {/* PAGE: DATES, PRICES, SUPPLEMENTS */}
      {/* ================================================================= */}
      <Page size="A4" style={s.page} wrap>
        <PageHeader logoUrl={logoUrl} />
        <PageFooterBlock quoteId={data.quoteId} />

        {/* Departures table */}
        {data.departures.length > 0 && (
          <>
            <SectionHeader title="Date di Partenza e Prezzi" />
            <View style={s.table}>
              <View style={s.tableHeaderRow}>
                <Text style={[s.tableHeaderCell, { flex: 2 }]}>
                  Partenza
                </Text>
                <Text style={[s.tableHeaderCell, { flex: 2 }]}>Data</Text>
                {priceLabels.map((label) => (
                  <Text
                    key={label}
                    style={[s.tableHeaderCell, { flex: 2, textAlign: "right" }]}
                  >
                    {label}
                  </Text>
                ))}
              </View>
              {data.departures.map((dep, idx) => (
                <View
                  key={idx}
                  style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
                >
                  <Text style={[s.tableCell, { flex: 2 }]}>
                    {dep.from_city}
                  </Text>
                  <Text style={[s.tableCell, { flex: 2 }]}>
                    {formatDate(dep.data_partenza)}
                  </Text>
                  {priceLabels.map((label) => {
                    const price = dep.prices.find((p) => p.label === label);
                    return (
                      <Text
                        key={label}
                        style={[
                          s.tableCell,
                          {
                            flex: 2,
                            textAlign: "right",
                            fontFamily: "Helvetica-Bold",
                          },
                        ]}
                      >
                        {price ? formatPrice(price.value) : "-"}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Supplements */}
        {data.supplements.length > 0 && (
          <>
            <SectionHeader title="Supplementi" />
            <View style={s.table}>
              <View style={s.tableHeaderRow}>
                <Text style={[s.tableHeaderCell, { flex: 4 }]}>
                  Supplemento
                </Text>
                <Text
                  style={[
                    s.tableHeaderCell,
                    { flex: 2, textAlign: "right" },
                  ]}
                >
                  Prezzo
                </Text>
              </View>
              {data.supplements.map((sup, idx) => (
                <View
                  key={idx}
                  style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
                >
                  <Text style={[s.tableCell, { flex: 4 }]}>{sup.titolo}</Text>
                  <Text
                    style={[
                      s.tableCell,
                      {
                        flex: 2,
                        textAlign: "right",
                        fontFamily: "Helvetica-Bold",
                      },
                    ]}
                  >
                    {sup.prezzo ?? "-"}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Optional excursions (tour only) */}
        {data.excursions.length > 0 && (
          <>
            <SectionHeader title="Escursioni Opzionali" />
            <View style={s.table}>
              <View style={s.tableHeaderRow}>
                <Text style={[s.tableHeaderCell, { flex: 4 }]}>
                  Escursione
                </Text>
                <Text
                  style={[
                    s.tableHeaderCell,
                    { flex: 2, textAlign: "right" },
                  ]}
                >
                  Prezzo
                </Text>
              </View>
              {data.excursions.map((exc, idx) => (
                <View
                  key={idx}
                  style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
                >
                  <Text style={[s.tableCell, { flex: 4 }]}>{exc.titolo}</Text>
                  <Text
                    style={[
                      s.tableCell,
                      {
                        flex: 2,
                        textAlign: "right",
                        fontFamily: "Helvetica-Bold",
                      },
                    ]}
                  >
                    {exc.prezzo != null ? formatPrice(exc.prezzo) : "-"}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Offer highlight */}
        {data.offer && (
          <View style={s.offerBox} wrap={false}>
            <Text
              style={{
                fontSize: 8,
                fontFamily: "Helvetica-Bold",
                color: BRAND.navy,
                marginBottom: 6,
              }}
            >
              OFFERTA PER {data.agency.business_name.toUpperCase()}
            </Text>
            {data.offer.total_price != null && (
              <Text style={s.offerPrice}>
                {formatPrice(data.offer.total_price)}
              </Text>
            )}
            {data.offer.offer_expiry && (
              <>
                <Text style={s.offerLabel}>Validita offerta</Text>
                <Text style={s.offerValue}>
                  Fino al {formatDate(data.offer.offer_expiry)}
                </Text>
              </>
            )}
            {data.offer.conditions && (
              <>
                <Text style={s.offerLabel}>Condizioni</Text>
                <Text style={s.offerValue}>{data.offer.conditions}</Text>
              </>
            )}
            {data.offer.payment_terms && (
              <>
                <Text style={s.offerLabel}>Termini di pagamento</Text>
                <Text style={s.offerValue}>{data.offer.payment_terms}</Text>
              </>
            )}
            {data.offer.notes && (
              <>
                <Text style={s.offerLabel}>Note</Text>
                <Text style={s.offerValue}>{data.offer.notes}</Text>
              </>
            )}
          </View>
        )}
      </Page>

      {/* ================================================================= */}
      {/* PAGE: INCLUSIONS + CONDITIONS */}
      {/* ================================================================= */}
      <Page size="A4" style={s.page} wrap>
        <PageHeader logoUrl={logoUrl} />
        <PageFooterBlock quoteId={data.quoteId} />

        {/* Included */}
        {included.length > 0 && (
          <>
            <SectionHeader title="La Quota Include" />
            {included.map((item, idx) => (
              <View key={idx} style={s.inclusionRow}>
                <Text style={s.checkMark}>{"\u2713"}</Text>
                <Text style={s.inclusionText}>{item.titolo}</Text>
              </View>
            ))}
          </>
        )}

        {/* Excluded */}
        {excluded.length > 0 && (
          <>
            <SectionHeader title="La Quota Non Include" />
            {excluded.map((item, idx) => (
              <View key={idx} style={s.inclusionRow}>
                <Text style={s.crossMark}>{"\u2717"}</Text>
                <Text style={s.inclusionText}>{item.titolo}</Text>
              </View>
            ))}
          </>
        )}

        {/* Important notes */}
        {data.noteImportanti && (
          <>
            <SectionHeader title="Note Importanti" />
            <Text style={s.conditionItem}>{stripHtml(data.noteImportanti)}</Text>
          </>
        )}

        {/* Terms */}
        {data.terms.length > 0 && (
          <>
            <SectionHeader title="Condizioni Generali" />
            {data.terms.map((t, idx) => (
              <Text key={idx} style={s.conditionItem}>
                {"\u2022"} {t}
              </Text>
            ))}
          </>
        )}

        {/* Penalties */}
        {data.penalties.length > 0 && (
          <>
            <SectionHeader title="Penali di Cancellazione" />
            {data.penalties.map((p, idx) => (
              <Text key={idx} style={s.conditionItem}>
                {"\u2022"} {p}
              </Text>
            ))}
          </>
        )}

        {/* Agency notes */}
        {data.notes && (
          <>
            <SectionHeader title="Note dell'Agenzia" />
            <Text style={s.conditionItem}>{data.notes}</Text>
          </>
        )}

        {/* Final branding block */}
        <View style={s.finalBox} wrap={false}>
          <Image src={logoUrl} style={s.finalLogo} />
          <Text style={s.finalBold}>MishaTravel S.r.l.</Text>
          <Text style={s.finalText}>
            Tour operator specializzato in Russia e paesi ex-URSS
          </Text>
          <Text style={s.finalText}>
            www.mishatravel.com | info@mishatravel.com
          </Text>
          {data.offer?.offer_expiry && (
            <Text
              style={[s.finalBold, { marginTop: 8, fontSize: 8 }]}
            >
              Questo preventivo e valido fino al{" "}
              {formatDate(data.offer.offer_expiry)}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}
