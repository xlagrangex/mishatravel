import { Ship, Route, BedDouble, CalendarRange } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Crociere Totali", value: "0", icon: Ship },
  { label: "Itinerari", value: "0", icon: Route },
  { label: "Cabine Configurate", value: "0", icon: BedDouble },
  { label: "Partenze Attive", value: "0", icon: CalendarRange },
];

export default function CrocierePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Crociere Fluviali
          </h1>
          <Badge variant="outline">Sprint 2</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Gestione crociere fluviali. CRUD completo con itinerari, cabine,
          partenze e prezzi per deck.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-lg bg-muted p-3 text-muted-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Ship className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="font-heading text-xl font-semibold text-secondary">
            Prossimamente
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Questa sezione permettera di gestire le crociere fluviali con
            itinerari giornalieri, configurazione cabine per deck, partenze
            stagionali e listini prezzi differenziati.
          </p>
          <Badge variant="outline" className="mt-4">
            Previsto per Sprint 2
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
