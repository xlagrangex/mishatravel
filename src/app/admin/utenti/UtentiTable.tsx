"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Search,
  Plus,
  UserCog,
  ShieldCheck,
  Users,
  KeyRound,
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { AdminUserListItem } from "@/lib/supabase/queries/admin-users";
import type { OperatorSection, UserRoleType } from "@/lib/types";
import {
  createAdminUser,
  updateUserRole,
  resetUserPassword,
  deactivateUser,
  reactivateUser,
  deleteUser,
} from "./actions";

interface UtentiTableProps {
  users: AdminUserListItem[];
  stats: {
    total: number;
    superAdmins: number;
    admins: number;
    operators: number;
  };
}

const roleConfig: Record<string, { label: string; className: string }> = {
  super_admin: {
    label: "Super Admin",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  admin: {
    label: "Admin",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  operator: {
    label: "Operatore",
    className: "border-green-200 bg-green-50 text-green-700",
  },
};

const sectionLabels: Record<OperatorSection, string> = {
  tours: "Tour",
  cruises: "Crociere",
  fleet: "Flotta",
  departures: "Partenze",
  destinations: "Destinazioni",
  agencies: "Agenzie",
  quotes: "Preventivi",
  messages: "Messaggi",
  blog: "Blog",
  catalogs: "Cataloghi",
  media: "Media",
  users_readonly: "Utenti (sola lettura)",
  account_statements: "Estratti Conto",
};

const ALL_SECTIONS: OperatorSection[] = Object.keys(sectionLabels) as OperatorSection[];

export default function UtentiTable({ users, stats }: UtentiTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserListItem | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    display_name: "",
    role: "operator" as "admin" | "operator",
    permissions: [] as string[],
  });

  // Edit form state
  const [editRole, setEditRole] = useState<UserRoleType>("operator");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  // Reset password state
  const [newPassword, setNewPassword] = useState("");

  const filtered = useMemo(() => {
    let result = users;

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.display_name ?? "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [users, searchQuery, roleFilter]);

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createAdminUser(createForm);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      } else {
        setShowCreateDialog(false);
        setCreateForm({
          email: "",
          password: "",
          display_name: "",
          role: "operator",
          permissions: [],
        });
      }
    });
  };

  const openEditDialog = (user: AdminUserListItem) => {
    setEditingUser(user);
    setEditRole(user.role ?? "operator");
    setEditPermissions([...user.permissions]);
    setShowEditDialog(true);
  };

  const handleUpdateRole = () => {
    if (!editingUser) return;
    setActionId(editingUser.id);
    startTransition(async () => {
      const result = await updateUserRole(editingUser.id, editRole, editPermissions);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      } else {
        setShowEditDialog(false);
        setEditingUser(null);
      }
      setActionId(null);
    });
  };

  const openResetDialog = (user: AdminUserListItem) => {
    setEditingUser(user);
    setNewPassword("");
    setShowResetDialog(true);
  };

  const handleResetPassword = () => {
    if (!editingUser) return;
    startTransition(async () => {
      const result = await resetUserPassword(editingUser.id, newPassword);
      if (!result.success) {
        alert(`Errore: ${result.error}`);
      } else {
        setShowResetDialog(false);
        setEditingUser(null);
        setNewPassword("");
        alert("Password aggiornata con successo.");
      }
    });
  };

  const handleToggleActive = (user: AdminUserListItem) => {
    const action = user.is_active ? "disattivare" : "riattivare";
    if (!confirm(`Sei sicuro di voler ${action} "${user.display_name ?? user.email}"?`)) return;
    setActionId(user.id);
    startTransition(async () => {
      const result = user.is_active
        ? await deactivateUser(user.id)
        : await reactivateUser(user.id);
      if (!result.success) alert(`Errore: ${result.error}`);
      setActionId(null);
    });
  };

  const handleDelete = (user: AdminUserListItem) => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare "${user.display_name ?? user.email}"? Questa azione non puo essere annullata.`
      )
    )
      return;
    setActionId(user.id);
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (!result.success) alert(`Errore: ${result.error}`);
      setActionId(null);
    });
  };

  const toggleCreatePermission = (section: string) => {
    setCreateForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(section)
        ? prev.permissions.filter((p) => p !== section)
        : [...prev.permissions, section],
    }));
  };

  const toggleEditPermission = (section: string) => {
    setEditPermissions((prev) =>
      prev.includes(section)
        ? prev.filter((p) => p !== section)
        : [...prev, section]
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-secondary">
            Gestione Utenti
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestione utenti, ruoli e permessi.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Nuovo Utente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-muted p-3 text-muted-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Utenti Totali</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.superAdmins}</p>
              <p className="text-sm text-muted-foreground">Super Admin</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-sm text-muted-foreground">Admin</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.operators}</p>
              <p className="text-sm text-muted-foreground">Operatori</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtra per ruolo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i ruoli</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="operator">Operatore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <UserCog className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Nessun utente trovato
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || roleFilter !== "all"
              ? "Prova a modificare i filtri."
              : "Crea il primo utente per iniziare."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Ultimo Accesso</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const rc = roleConfig[user.role ?? ""] ?? {
                  label: user.role ?? "N/A",
                  className: "",
                };
                return (
                  <TableRow
                    key={user.id}
                    className={cn(actionId === user.id && "opacity-50")}
                  >
                    <TableCell className="font-medium">
                      {user.display_name || "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", rc.className)}
                      >
                        {rc.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          user.is_active
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        )}
                      >
                        {user.is_active ? "Attivo" : "Disattivato"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.last_sign_in_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => openEditDialog(user)}
                          title="Modifica ruolo e permessi"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => openResetDialog(user)}
                          title="Reset password"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className={
                            user.is_active
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-green-600 hover:bg-green-50"
                          }
                          disabled={isPending && actionId === user.id}
                          onClick={() => handleToggleActive(user)}
                          title={user.is_active ? "Disattiva" : "Riattiva"}
                        >
                          {user.is_active ? (
                            <Ban className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        {user.role !== "super_admin" && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={isPending && actionId === user.id}
                            onClick={() => handleDelete(user)}
                            title="Elimina utente"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuovo Utente</DialogTitle>
            <DialogDescription>
              Crea un nuovo utente admin o operatore.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nome Completo</Label>
              <Input
                id="create-name"
                value={createForm.display_name}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, display_name: e.target.value }))
                }
                placeholder="Mario Rossi"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="mario@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password Temporanea</Label>
              <Input
                id="create-password"
                type="text"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, password: e.target.value }))
                }
                placeholder="Minimo 8 caratteri"
              />
            </div>
            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Select
                value={createForm.role}
                onValueChange={(v) =>
                  setCreateForm((p) => ({
                    ...p,
                    role: v as "admin" | "operator",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operator">Operatore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {createForm.role === "operator" && (
              <div className="space-y-2">
                <Label>Permessi Sezioni</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_SECTIONS.map((section) => (
                    <div
                      key={section}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`create-perm-${section}`}
                        checked={createForm.permissions.includes(section)}
                        onCheckedChange={() => toggleCreatePermission(section)}
                      />
                      <Label
                        htmlFor={`create-perm-${section}`}
                        className="text-sm font-normal"
                      >
                        {sectionLabels[section]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Annulla
            </Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending ? "Creazione..." : "Crea Utente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifica Ruolo e Permessi</DialogTitle>
            <DialogDescription>
              {editingUser?.display_name ?? editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as UserRoleType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="operator">Operatore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editRole === "operator" && (
              <div className="space-y-2">
                <Label>Permessi Sezioni</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_SECTIONS.map((section) => (
                    <div
                      key={section}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`edit-perm-${section}`}
                        checked={editPermissions.includes(section)}
                        onCheckedChange={() => toggleEditPermission(section)}
                      />
                      <Label
                        htmlFor={`edit-perm-${section}`}
                        className="text-sm font-normal"
                      >
                        {sectionLabels[section]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Annulla
            </Button>
            <Button onClick={handleUpdateRole} disabled={isPending}>
              {isPending ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Imposta una nuova password per{" "}
              {editingUser?.display_name ?? editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nuova Password</Label>
              <Input
                id="new-password"
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimo 8 caratteri"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
            >
              Annulla
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isPending || newPassword.length < 8}
            >
              {isPending ? "Reset..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
