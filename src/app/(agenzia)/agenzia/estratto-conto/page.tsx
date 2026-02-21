import { Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAgencyStatements } from "@/lib/supabase/queries/account-statements";
import { StatementsTable } from "./StatementsTable";

export default async function EstrattoContoPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const dateFrom = params.from ?? undefined;
  const dateTo = params.to ?? undefined;

  const statements = await getAgencyStatements(dateFrom, dateTo);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Estratto Conto
        </h1>
        <p className="text-sm text-muted-foreground">
          Storico dei documenti contabili della tua agenzia.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5" />
            Documenti ({statements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatementsTable
            statements={statements}
            initialFrom={dateFrom}
            initialTo={dateTo}
          />
        </CardContent>
      </Card>
    </div>
  );
}
