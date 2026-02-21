import { Image, Upload, HardDrive, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "File Totali", value: "0", icon: Image },
  { label: "Caricamenti Oggi", value: "0", icon: Upload },
  { label: "Spazio Utilizzato", value: "0 MB", icon: HardDrive },
  { label: "Cartelle", value: "0", icon: FolderOpen },
];

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Libreria Media
          </h1>
          <Badge variant="outline">Sprint 2</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Gestione centralizzata di tutte le immagini e file caricati su
          Supabase Storage.
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
          <Image className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="font-heading text-xl font-semibold text-secondary">
            Prossimamente
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Questa sezione permettera di gestire centralmente tutte le immagini
            e i file su Supabase Storage con drag & drop, organizzazione in
            cartelle, ridimensionamento automatico e ottimizzazione.
          </p>
          <Badge variant="outline" className="mt-4">
            Previsto per Sprint 2
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
