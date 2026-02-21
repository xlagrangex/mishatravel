import { Users, UserCheck, UserX, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Agenzie Totali", value: "0", icon: Users },
  { label: "Agenzie Attive", value: "0", icon: UserCheck },
  { label: "In Attesa Approvazione", value: "0", icon: UserX },
  { label: "Richieste Totali", value: "0", icon: History },
];

export default function AgenziePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Agenzie
          </h1>
          <Badge variant="outline">Sprint 7</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Gestione agenzie partner. Approvazione, blocco, storico richieste.
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
          <Users className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="font-heading text-xl font-semibold text-secondary">
            Prossimamente
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Questa sezione permettera di gestire le agenzie partner con
            workflow di approvazione, blocco/sblocco, storico richieste e
            preventivi, e comunicazioni dirette.
          </p>
          <Badge variant="outline" className="mt-4">
            Previsto per Sprint 7
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
