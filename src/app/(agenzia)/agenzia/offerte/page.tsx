import { Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgencyOffers } from "@/lib/supabase/queries/quotes";
import { OffersList } from "./OffersList";

export const dynamic = "force-dynamic";

export default async function OffertePage() {
  const offers = await getAgencyOffers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Offerte Ricevute
        </h1>
        <p className="text-sm text-muted-foreground">
          Le offerte inviate dall&apos;operatore in risposta alle tue richieste
          di preventivo.
        </p>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Gift className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Non hai ancora ricevuto offerte.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Le offerte appariranno qui quando l&apos;operatore risponde alle
              tue richieste di preventivo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <OffersList offers={offers} />
      )}
    </div>
  );
}
