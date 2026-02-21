import { BookOpen, FileEdit, Tags, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Articoli Totali", value: "0", icon: BookOpen },
  { label: "Bozze", value: "0", icon: FileEdit },
  { label: "Categorie", value: "0", icon: Tags },
  { label: "Visualizzazioni", value: "0", icon: Eye },
];

export default function BlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Blog
          </h1>
          <Badge variant="outline">Sprint 2</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Gestione articoli del blog. Editor rich text, categorie, SEO.
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
          <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="font-heading text-xl font-semibold text-secondary">
            Prossimamente
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Questa sezione permettera di creare e gestire articoli del blog con
            editor rich text, gestione categorie e tag, ottimizzazione SEO e
            programmazione pubblicazione.
          </p>
          <Badge variant="outline" className="mt-4">
            Previsto per Sprint 2
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
