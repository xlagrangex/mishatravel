import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { QuotePdfPayload } from "./quote-pdf-data";

// ---------------------------------------------------------------------------
// Brand constants
// ---------------------------------------------------------------------------

const B = {
  red: "#C41E2F",
  navy: "#1B2D4F",
  gray: "#64748B",
  lightGray: "#F1F5F9",
  border: "#E2E8F0",
  white: "#FFFFFF",
  text: "#1E293B",
  textLight: "#475569",
  green: "#16A34A",
  greenBg: "#F0FDF4",
  greenDark: "#166534",
  redBg: "#FEF2F2",
  redDark: "#991B1B",
  amberBg: "#FFFBEB",
  amberBorder: "#F59E0B",
  amberDark: "#92400E",
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  // Page base
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: B.text,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  // Header/Footer
  pageHeader: {
    position: "absolute",
    top: 15,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: B.border,
    paddingBottom: 6,
  },
  pageFooter: {
    position: "absolute",
    bottom: 15,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: B.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 6.5, color: B.gray },
  // Cover
  coverPage: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: B.text,
    paddingHorizontal: 40,
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: "flex-start",
  },
  coverImage: {
    width: "100%",
    height: 240,
    objectFit: "cover",
    borderRadius: 6,
  },
  accentBar: {
    width: "100%",
    height: 3,
    backgroundColor: B.red,
    marginTop: 12,
    marginBottom: 16,
  },
  // Section
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 14,
    borderBottomWidth: 2,
    borderBottomColor: B.red,
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: B.navy,
  },
  // Itinerary
  itineraryDay: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 10,
  },
  dayBadge: {
    width: 36,
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: B.red,
    justifyContent: "center",
    alignItems: "center",
  },
  dayBadgeText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: B.white,
  },
  dayContent: { flex: 1, paddingTop: 1 },
  dayLocality: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: B.navy,
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 8,
    color: B.red,
    fontFamily: "Helvetica-Bold",
  },
  dayDesc: { fontSize: 8.5, lineHeight: 1.45, color: B.textLight },
  // Tables
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: B.navy,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: B.white,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: B.border,
  },
  tableRowAlt: { backgroundColor: B.lightGray },
  tableCell: { fontSize: 8 },
  // Hotels
  hotelStars: { color: "#F59E0B", fontSize: 8 },
  // Ship
  shipBox: { flexDirection: "row", gap: 12, marginBottom: 10 },
  shipImage: {
    width: 140,
    height: 95,
    objectFit: "cover",
    borderRadius: 4,
  },
  // Offer box (new elegant design)
  offerHeader: {
    backgroundColor: B.navy,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    padding: 10,
  },
  offerBody: {
    padding: 12,
    borderWidth: 1,
    borderColor: B.border,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderTopWidth: 0,
  },
  offerDetailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  offerDetailLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: B.navy,
    width: 100,
  },
  offerDetailValue: { fontSize: 8, color: B.text, flex: 1 },
  // Colored info boxes
  infoBox: {
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  // Final page
  finalBox: {
    backgroundColor: B.navy,
    borderRadius: 6,
    padding: 24,
    marginTop: 20,
    alignItems: "center",
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function formatShortDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
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
  return "*".repeat(n);
}

// ---------------------------------------------------------------------------
// Shared page wrappers
// ---------------------------------------------------------------------------

function PageHeader({ logoUrl }: { logoUrl: string }) {
  return (
    <View style={s.pageHeader} fixed>
      <Image src={logoUrl} style={{ width: 80 }} />
      <Text style={s.footerText}>www.mishatravel.com</Text>
    </View>
  );
}

function PageFooterBlock({ quoteId }: { quoteId: string }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.footerText}>
        MishaTravel S.r.l. | info@mishatravel.com
      </Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) =>
          `Rif. #${quoteId.slice(0, 8).toUpperCase()} | Pag. ${pageNumber}/${totalPages}`
        }
      />
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface QuotePdfDocumentProps {
  data: QuotePdfPayload;
  logoUrl: string;
  coverImageBase64: string | null;
  shipImageBase64: string | null;
  cabinImagesBase64: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Main Document
// ---------------------------------------------------------------------------

export default function QuotePdfDocument({
  data,
  logoUrl,
  coverImageBase64,
  shipImageBase64,
  cabinImagesBase64,
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

  const priceLabels: string[] = [];
  for (const dep of data.departures) {
    for (const p of dep.prices) {
      if (!priceLabels.includes(p.label)) priceLabels.push(p.label);
    }
  }

  // Find the selected departure for highlighting
  const selectedDep = data.selectedDepartureDate
    ? data.departures.find((d) => d.data_partenza === data.selectedDepartureDate)
    : null;
  const otherDeps = data.departures.filter(
    (d) => d.data_partenza !== data.selectedDepartureDate
  );

  return (
    <Document
      title={`Preventivo - ${data.title}`}
      author="MishaTravel"
      subject={`Preventivo per ${data.agency.business_name}`}
    >
      {/* ================================================================= */}
      {/* PAGE 1: COVER                                                     */}
      {/* ================================================================= */}
      <Page size="A4" style={s.coverPage}>
        {/* Logo */}
        <Image src={logoUrl} style={{ width: 160, marginBottom: 16 }} />

        {/* Cover Image */}
        {coverImageBase64 && (
          <Image src={coverImageBase64} style={s.coverImage} />
        )}

        {/* Accent bar */}
        <View style={s.accentBar} />

        {/* Title block */}
        <Text
          style={{
            fontSize: 10,
            fontFamily: "Helvetica-Bold",
            color: B.red,
            letterSpacing: 3,
            marginBottom: 6,
          }}
        >
          PREVENTIVO
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontFamily: "Helvetica-Bold",
            color: B.navy,
            marginBottom: 4,
          }}
        >
          {data.title}
        </Text>
        <Text
          style={{ fontSize: 11, color: B.textLight, marginBottom: 20 }}
        >
          {[
            data.destinationName,
            data.durataNotti ? `${data.durataNotti} notti` : null,
            data.requestType === "tour" ? "Tour" : "Crociera Fluviale",
          ]
            .filter(Boolean)
            .join("  \u2022  ")}
        </Text>

        {/* Info grid — 2 columns */}
        <View
          style={{
            backgroundColor: B.lightGray,
            borderRadius: 6,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row", gap: 20 }}>
            {/* Left column */}
            <View style={{ flex: 1 }}>
              <CoverInfoItem
                label="Per"
                value={`${data.agency.business_name}${data.agency.city ? ` - ${data.agency.city}` : ""}`}
              />
              <CoverInfoItem
                label="Partecipanti"
                value={`${data.participantsAdults} adulti${data.participantsChildren > 0 ? `, ${data.participantsChildren} bambini` : ""}`}
              />
              {data.cabinType && (
                <CoverInfoItem label="Cabina" value={data.cabinType} />
              )}
              {pensioneLabel && (
                <CoverInfoItem label="Trattamento" value={pensioneLabel} />
              )}
            </View>
            {/* Right column */}
            <View style={{ flex: 1 }}>
              {data.selectedDepartureDate && (
                <CoverInfoItem
                  label="Data partenza"
                  value={formatShortDate(data.selectedDepartureDate)}
                />
              )}
              {data.selectedDepartureCity && (
                <CoverInfoItem
                  label="Partenza da"
                  value={data.selectedDepartureCity}
                />
              )}
              {data.tipoVoli && (
                <CoverInfoItem label="Voli" value={data.tipoVoli} />
              )}
              <CoverInfoItem
                label="Data preventivo"
                value={formatDate(data.quoteCreatedAt)}
              />
              <CoverInfoItem
                label="Riferimento"
                value={`#${data.quoteId.slice(0, 8).toUpperCase()}`}
              />
            </View>
          </View>

          {/* Price badge (if offer exists) */}
          {data.offer?.total_price != null && (
            <View
              style={{
                backgroundColor: B.red,
                borderRadius: 4,
                padding: 10,
                marginTop: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 7, color: B.white, opacity: 0.85, marginBottom: 2 }}
              >
                PREZZO TOTALE OFFERTA
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Helvetica-Bold",
                  color: B.white,
                }}
              >
                {formatPrice(data.offer.total_price)}
              </Text>
            </View>
          )}
        </View>
      </Page>

      {/* ================================================================= */}
      {/* PAGE 2+: ITINERARY                                                */}
      {/* ================================================================= */}
      {data.itinerary.length > 0 && (
        <Page size="A4" style={s.page} wrap>
          <PageHeader logoUrl={logoUrl} />
          <PageFooterBlock quoteId={data.quoteId} />

          <SectionHeader title="Programma Dettagliato" />

          {/* Location route overview */}
          {data.locations.length > 0 && (
            <View
              style={{
                backgroundColor: B.lightGray,
                borderRadius: 4,
                padding: 8,
                marginBottom: 12,
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {data.locations.map((loc, idx) => (
                <React.Fragment key={idx}>
                  <Text
                    style={{
                      fontSize: 8,
                      fontFamily: "Helvetica-Bold",
                      color: B.navy,
                    }}
                  >
                    {loc.nome}
                  </Text>
                  {idx < data.locations.length - 1 && (
                    <Text
                      style={{
                        fontSize: 8,
                        color: B.red,
                        marginHorizontal: 4,
                      }}
                    >
                      {"\u2192"}
                    </Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          )}

          {data.itinerary.map((day, idx) => (
            <View key={idx} style={s.itineraryDay} wrap={false}>
              <View style={s.dayBadge}>
                <Text style={s.dayBadgeText}>{day.numero_giorno}</Text>
              </View>
              <View style={s.dayContent}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <Text style={s.dayLocality}>{day.localita}</Text>
                  {day.date && (
                    <Text style={s.dayDate}>{formatShortDate(day.date)}</Text>
                  )}
                </View>
                <Text style={s.dayDesc}>{stripHtml(day.descrizione)}</Text>
              </View>
            </View>
          ))}
        </Page>
      )}

      {/* ================================================================= */}
      {/* PAGE: HOTELS / SHIP                                               */}
      {/* ================================================================= */}
      {(data.hotels.length > 0 || data.ship) && (
        <Page size="A4" style={s.page} wrap>
          <PageHeader logoUrl={logoUrl} />
          <PageFooterBlock quoteId={data.quoteId} />

          {/* Hotels (tour) */}
          {data.hotels.length > 0 && (
            <>
              <SectionHeader title="Alloggi" />
              <View style={{ marginBottom: 8 }}>
                <View style={s.tableHeaderRow}>
                  <Text style={[s.tableHeaderCell, { flex: 2 }]}>
                    Localita
                  </Text>
                  <Text style={[s.tableHeaderCell, { flex: 3 }]}>Hotel</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1 }]}>Cat.</Text>
                </View>
                {data.hotels.map((h, idx) => (
                  <View
                    key={idx}
                    style={[
                      s.tableRow,
                      idx % 2 === 1 ? s.tableRowAlt : {},
                    ]}
                  >
                    <Text style={[s.tableCell, { flex: 2 }]}>
                      {h.localita}
                    </Text>
                    <Text style={[s.tableCell, { flex: 3 }]}>
                      {h.nome_albergo}
                    </Text>
                    <Text style={[s.hotelStars, { flex: 1 }]}>
                      {stars(h.stelle)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Ship info (cruise) — expanded */}
          {data.ship && (
            <>
              <SectionHeader title="La Nave" />

              {/* Ship header */}
              <View style={s.shipBox}>
                {shipImageBase64 && (
                  <Image src={shipImageBase64} style={s.shipImage} />
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Helvetica-Bold",
                      color: B.navy,
                      marginBottom: 4,
                    }}
                  >
                    {data.ship.name}
                  </Text>
                  {data.cabinType && (
                    <Text
                      style={{
                        fontSize: 9,
                        color: B.textLight,
                        marginBottom: 2,
                      }}
                    >
                      Cabina richiesta: {data.cabinType}
                    </Text>
                  )}
                  {data.numCabins && (
                    <Text
                      style={{
                        fontSize: 9,
                        color: B.textLight,
                        marginBottom: 2,
                      }}
                    >
                      Numero cabine: {data.numCabins}
                    </Text>
                  )}
                </View>
              </View>

              {/* Ship description */}
              {data.ship.description && (
                <Text
                  style={{
                    fontSize: 8.5,
                    lineHeight: 1.45,
                    color: B.textLight,
                    marginBottom: 10,
                  }}
                >
                  {stripHtml(data.ship.description)}
                </Text>
              )}

              {/* Services */}
              {data.ship.services.length > 0 && (
                <View wrap={false} style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Helvetica-Bold",
                      color: B.navy,
                      marginBottom: 4,
                    }}
                  >
                    Servizi a bordo
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {data.ship.services.map((svc, idx) => (
                      <View
                        key={idx}
                        style={{
                          width: "50%",
                          flexDirection: "row",
                          alignItems: "flex-start",
                          marginBottom: 3,
                          paddingRight: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: 1,
                            backgroundColor: B.green,
                            marginRight: 4,
                            marginTop: 1,
                          }}
                        />
                        <Text style={{ fontSize: 8, color: B.textLight, flex: 1 }}>
                          {svc}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Activities */}
              {data.ship.activities.length > 0 && (
                <View wrap={false} style={{ marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Helvetica-Bold",
                      color: B.navy,
                      marginBottom: 4,
                    }}
                  >
                    Attivita a bordo
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {data.ship.activities.map((act, idx) => (
                      <View
                        key={idx}
                        style={{
                          width: "50%",
                          flexDirection: "row",
                          marginBottom: 3,
                          paddingRight: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 8,
                            color: B.red,
                            marginRight: 4,
                          }}
                        >
                          {"\u2022"}
                        </Text>
                        <Text style={{ fontSize: 8, color: B.textLight }}>
                          {act}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Cabin details */}
              {data.shipCabinDetails.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Helvetica-Bold",
                      color: B.navy,
                      marginBottom: 6,
                    }}
                  >
                    Tipologie di Cabina
                  </Text>
                  {data.shipCabinDetails.map((cabin, idx) => (
                    <View
                      key={idx}
                      wrap={false}
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        marginBottom: 8,
                        borderBottomWidth: 0.5,
                        borderBottomColor: B.border,
                        paddingBottom: 8,
                      }}
                    >
                      {cabinImagesBase64[cabin.titolo] && (
                        <Image
                          src={cabinImagesBase64[cabin.titolo]}
                          style={{
                            width: 100,
                            height: 70,
                            objectFit: "cover",
                            borderRadius: 3,
                          }}
                        />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: "Helvetica-Bold",
                            color: B.navy,
                            marginBottom: 2,
                          }}
                        >
                          {cabin.titolo}
                        </Text>
                        {cabin.tipologia && (
                          <Text
                            style={{
                              fontSize: 7.5,
                              color: B.gray,
                              marginBottom: 2,
                            }}
                          >
                            {cabin.tipologia}
                          </Text>
                        )}
                        {cabin.descrizione && (
                          <Text
                            style={{
                              fontSize: 8,
                              color: B.textLight,
                              lineHeight: 1.3,
                            }}
                          >
                            {stripHtml(cabin.descrizione)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </Page>
      )}

      {/* ================================================================= */}
      {/* PAGE: DATES, PRICES, SUPPLEMENTS, OFFER                           */}
      {/* ================================================================= */}
      <Page size="A4" style={s.page} wrap>
        <PageHeader logoUrl={logoUrl} />
        <PageFooterBlock quoteId={data.quoteId} />

        {/* Selected departure highlight */}
        {selectedDep && (
          <>
            <SectionHeader title="La Tua Partenza" />
            <View
              wrap={false}
              style={{
                backgroundColor: B.lightGray,
                borderRadius: 4,
                borderLeftWidth: 3,
                borderLeftColor: B.red,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <View>
                  <Text
                    style={{ fontSize: 7.5, color: B.gray, marginBottom: 2 }}
                  >
                    Data di partenza
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Helvetica-Bold",
                      color: B.navy,
                    }}
                  >
                    {formatDate(selectedDep.data_partenza)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{ fontSize: 7.5, color: B.gray, marginBottom: 2 }}
                  >
                    Partenza da
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Helvetica-Bold",
                      color: B.navy,
                    }}
                  >
                    {selectedDep.from_city}
                  </Text>
                </View>
              </View>
              {selectedDep.prices.length > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 16,
                    borderTopWidth: 0.5,
                    borderTopColor: B.border,
                    paddingTop: 6,
                  }}
                >
                  {selectedDep.prices.map((p) => (
                    <View key={p.label}>
                      <Text style={{ fontSize: 7, color: B.gray }}>
                        {p.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "Helvetica-Bold",
                          color: B.red,
                        }}
                      >
                        {formatPrice(p.value)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Other departures table */}
        {otherDeps.length > 0 && (
          <>
            <SectionHeader
              title={
                selectedDep ? "Altre Date Disponibili" : "Date di Partenza e Prezzi"
              }
            />
            <View style={{ marginBottom: 8 }}>
              <View style={s.tableHeaderRow}>
                <Text style={[s.tableHeaderCell, { flex: 2 }]}>Partenza</Text>
                <Text style={[s.tableHeaderCell, { flex: 2 }]}>Data</Text>
                {priceLabels.map((label) => (
                  <Text
                    key={label}
                    style={[
                      s.tableHeaderCell,
                      { flex: 2, textAlign: "right" },
                    ]}
                  >
                    {label}
                  </Text>
                ))}
              </View>
              {otherDeps.map((dep, idx) => (
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
            <View style={{ marginBottom: 8 }}>
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

        {/* Optional excursions */}
        {data.excursions.length > 0 && (
          <>
            <SectionHeader title="Escursioni Opzionali" />
            <View style={{ marginBottom: 8 }}>
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

        {/* Offer — elegant card design */}
        {data.offer && (
          <View wrap={false} style={{ marginTop: 12, marginBottom: 10 }}>
            <View style={s.offerHeader}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Helvetica-Bold",
                  color: B.white,
                  textAlign: "center",
                }}
              >
                OFFERTA PER {data.agency.business_name.toUpperCase()}
              </Text>
            </View>

            {/* Price highlight */}
            {data.offer.total_price != null && (
              <View
                style={{
                  backgroundColor: B.lightGray,
                  padding: 14,
                  alignItems: "center",
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderColor: B.border,
                }}
              >
                <Text
                  style={{ fontSize: 8, color: B.gray, marginBottom: 2 }}
                >
                  Prezzo totale
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Helvetica-Bold",
                    color: B.red,
                  }}
                >
                  {formatPrice(data.offer.total_price)}
                </Text>
              </View>
            )}

            {/* Details */}
            <View style={s.offerBody}>
              {data.offer.offer_expiry && (
                <View style={s.offerDetailRow}>
                  <Text style={s.offerDetailLabel}>Validita offerta</Text>
                  <Text style={s.offerDetailValue}>
                    Fino al {formatDate(data.offer.offer_expiry)}
                  </Text>
                </View>
              )}
              {data.offer.payment_terms && (
                <View style={s.offerDetailRow}>
                  <Text style={s.offerDetailLabel}>Pagamento</Text>
                  <Text style={s.offerDetailValue}>
                    {data.offer.payment_terms}
                  </Text>
                </View>
              )}
              {data.offer.conditions && (
                <View style={s.offerDetailRow}>
                  <Text style={s.offerDetailLabel}>Condizioni</Text>
                  <Text style={s.offerDetailValue}>
                    {data.offer.conditions}
                  </Text>
                </View>
              )}
              {data.offer.notes && (
                <View
                  style={{
                    backgroundColor: B.lightGray,
                    borderRadius: 3,
                    padding: 8,
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 7.5,
                      fontFamily: "Helvetica-Bold",
                      color: B.navy,
                      marginBottom: 2,
                    }}
                  >
                    Note
                  </Text>
                  <Text
                    style={{
                      fontSize: 8,
                      color: B.textLight,
                      lineHeight: 1.4,
                    }}
                  >
                    {data.offer.notes}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </Page>

      {/* ================================================================= */}
      {/* PAGE: INCLUSIONS + CONDITIONS                                     */}
      {/* ================================================================= */}
      <Page size="A4" style={s.page} wrap>
        <PageHeader logoUrl={logoUrl} />
        <PageFooterBlock quoteId={data.quoteId} />

        {/* Included — green box */}
        {included.length > 0 && (
          <View
            style={[
              s.infoBox,
              {
                backgroundColor: B.greenBg,
                borderLeftColor: B.green,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Helvetica-Bold",
                color: B.greenDark,
                marginBottom: 6,
              }}
            >
              La Quota Include
            </Text>
            {included.map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 3,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: B.green,
                    marginRight: 6,
                    marginTop: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 4,
                      height: 2,
                      borderBottomWidth: 1.5,
                      borderLeftWidth: 1.5,
                      borderColor: B.white,
                      transform: "rotate(-45deg)",
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 8.5,
                    flex: 1,
                    lineHeight: 1.4,
                    color: B.text,
                  }}
                >
                  {item.titolo}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Excluded — red box */}
        {excluded.length > 0 && (
          <View
            style={[
              s.infoBox,
              {
                backgroundColor: B.redBg,
                borderLeftColor: B.red,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Helvetica-Bold",
                color: B.redDark,
                marginBottom: 6,
              }}
            >
              La Quota Non Include
            </Text>
            {excluded.map((item, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  marginBottom: 3,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    backgroundColor: B.red,
                    marginRight: 6,
                    marginTop: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 1.5,
                      backgroundColor: B.white,
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 8.5,
                    flex: 1,
                    lineHeight: 1.4,
                    color: B.text,
                  }}
                >
                  {item.titolo}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Important notes — amber box */}
        {data.noteImportanti && (
          <View
            style={[
              s.infoBox,
              {
                backgroundColor: B.amberBg,
                borderLeftColor: B.amberBorder,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Helvetica-Bold",
                color: B.amberDark,
                marginBottom: 4,
              }}
            >
              Note Importanti
            </Text>
            <Text
              style={{
                fontSize: 8.5,
                lineHeight: 1.5,
                color: B.text,
              }}
            >
              {stripHtml(data.noteImportanti)}
            </Text>
          </View>
        )}

        {/* Terms */}
        {data.terms.length > 0 && (
          <>
            <SectionHeader title="Condizioni Generali" />
            {data.terms.map((t, idx) => (
              <Text
                key={idx}
                style={{
                  fontSize: 8,
                  lineHeight: 1.5,
                  marginBottom: 3,
                  color: B.textLight,
                }}
              >
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
              <Text
                key={idx}
                style={{
                  fontSize: 8,
                  lineHeight: 1.5,
                  marginBottom: 3,
                  color: B.textLight,
                }}
              >
                {"\u2022"} {p}
              </Text>
            ))}
          </>
        )}

        {/* Agency notes */}
        {data.notes && (
          <>
            <SectionHeader title="Note dell'Agenzia" />
            <Text
              style={{
                fontSize: 8.5,
                lineHeight: 1.5,
                color: B.textLight,
              }}
            >
              {data.notes}
            </Text>
          </>
        )}

        {/* Final branding block */}
        <View style={s.finalBox} wrap={false}>
          <Image src={logoUrl} style={{ width: 140, marginBottom: 12 }} />
          <Text
            style={{
              fontSize: 9,
              fontFamily: "Helvetica-Bold",
              color: B.white,
              textAlign: "center",
              marginBottom: 3,
            }}
          >
            MishaTravel S.r.l.
          </Text>
          <Text
            style={{
              fontSize: 8,
              color: B.white,
              textAlign: "center",
              marginBottom: 3,
            }}
          >
            Il tuo tour operator di fiducia
          </Text>
          <Text
            style={{
              fontSize: 8,
              color: B.white,
              textAlign: "center",
            }}
          >
            www.mishatravel.com | info@mishatravel.com
          </Text>
          {data.offer?.offer_expiry && (
            <Text
              style={{
                fontSize: 8,
                fontFamily: "Helvetica-Bold",
                color: B.white,
                textAlign: "center",
                marginTop: 10,
              }}
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

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------

function CoverInfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Text style={{ fontSize: 7.5, color: B.gray }}>{label}</Text>
      <Text
        style={{
          fontSize: 9,
          fontFamily: "Helvetica-Bold",
          color: B.navy,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
