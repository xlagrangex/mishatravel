import {
  Plane,
  Ship,
  Anchor,
  MapPin,
  Users,
  FileText,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Tour Attivi", value: "0", icon: Plane, color: "text-blue-600" },
  { label: "Crociere Attive", value: "0", icon: Ship, color: "text-cyan-600" },
  { label: "Navi", value: "0", icon: Anchor, color: "text-indigo-600" },
  { label: "Destinazioni", value: "0", icon: MapPin, color: "text-green-600" },
  { label: "Agenzie Registrate", value: "0", icon: Users, color: "text-purple-600" },
  { label: "Preventivi in Attesa", value: "0", icon: FileText, color: "text-orange-600" },
  { label: "Partenze Prossime", value: "0", icon: Calendar, color: "text-red-600" },
  { label: "Preventivi Confermati", value: "0", icon: TrendingUp, color: "text-emerald-600" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Panoramica generale del sistema MishaTravel
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
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

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Ultimi Preventivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Nessun preventivo ancora.
              </p>
              <p className="text-xs text-muted-foreground">
                Le richieste delle agenzie appariranno qui.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Departures */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Prossime Partenze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Nessuna partenza programmata.
              </p>
              <p className="text-xs text-muted-foreground">
                Aggiungi tour e crociere per vedere le partenze.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Stato Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Database</span>
              <Badge variant="outline" className="ml-auto text-xs">Online</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Storage</span>
              <Badge variant="outline" className="ml-auto text-xs">Online</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-sm">Auth</span>
              <Badge variant="outline" className="ml-auto text-xs">Setup</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
              <span className="text-sm">Email</span>
              <Badge variant="outline" className="ml-auto text-xs">Sprint 8</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
