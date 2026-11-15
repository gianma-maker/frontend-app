"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { Field, ResourceConfig } from "@/lib/resources";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = Record<string, string | number | null>;

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

const BADGE: Record<string, string> = {
  Upcoming: "bg-sky-200 text-sky-900",
  Ongoing: "bg-amber-200 text-amber-900",
  Completed: "bg-emerald-200 text-emerald-900",
  Cancelled: "bg-red-200 text-red-900",
  Registered: "bg-sky-200 text-sky-900",
  Confirmed: "bg-emerald-200 text-emerald-900",
  Scheduled: "bg-sky-200 text-sky-900",
};

const Badge = ({ value }: { value: string }) => (
  <span
    className={`font-mono rounded-full border-2 border-[var(--ink)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
      BADGE[value] ?? "bg-muted text-muted-foreground"
    }`}
  >
    {value}
  </span>
);

const display = (field: Field, value: Row[string] | undefined) => {
  if (value === null || value === undefined || value === "") return "-";
  if (field.type === "date") return new Date(String(value)).toLocaleDateString();
  if (field.type === "time") return String(value).slice(0, 5);
  return String(value);
};

const toInput = (field: Field, value: Row[string] | undefined) => {
  if (value === null || value === undefined) return "";
  if (field.type === "date") return String(value).slice(0, 10);
  if (field.type === "time") return String(value).slice(0, 5);
  return String(value);
};

const popButton =
  "border-2 border-[var(--ink)] font-bold shadow-[3px_3px_0_0_var(--ink)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_var(--ink)]";

export default function ResourcePage({ config }: { config: ResourceConfig }) {
  const { title, singular, endpoint, idKey, fields } = config;

  const emptyForm = () =>
    Object.fromEntries(
      fields.map((f) => [f.key, f.type === "select" ? f.options?.[0] ?? "" : ""])
    ) as Record<string, string>;

  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, string>>(emptyForm);

  // Used by Refresh button and after create/update/delete
  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient<Row[]>(endpoint, {
        method: "GET",
        requiresAuth: true,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, `Failed to fetch ${title.toLowerCase()}.`));
    } finally {
      setLoading(false);
    }
  }, [endpoint, title]);

  // Initial load (state is set only inside promise callbacks)
  useEffect(() => {
    let cancelled = false;
    apiClient<Row[]>(endpoint, { method: "GET", requiresAuth: true })
      .then((data) => {
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(getErrorMessage(err, `Failed to fetch ${title.toLowerCase()}.`));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint, title]);

  const handleView = async (id: number) => {
    setError("");
    setSuccess("");
    try {
      const data = await apiClient<Row>(`${endpoint}/${id}`, {
        method: "GET",
        requiresAuth: true,
      });
      setSelected(data);
    } catch (err) {
      setError(getErrorMessage(err, `Failed to load ${singular.toLowerCase()}.`));
    }
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setSelected(null);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const openEditForm = (row: Row) => {
    setEditingId(Number(row[idKey]));
    setForm(
      Object.fromEntries(fields.map((f) => [f.key, toInput(f, row[f.key])]))
    );
    setSelected(null);
    setError("");
    setSuccess("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    // Build body: numbers -> Number, empty optional -> null (update) or omitted (create)
    const body: Record<string, string | number | null> = {};
    for (const f of fields) {
      const raw = form[f.key]?.trim() ?? "";
      if (raw === "") {
        if (!f.required && editingId !== null) body[f.key] = null;
        continue;
      }
      body[f.key] = f.type === "number" ? Number(raw) : raw;
    }

    try {
      if (editingId !== null) {
        await apiClient(`${endpoint}/${editingId}`, {
          method: "PUT",
          requiresAuth: true,
          body: JSON.stringify(body),
        });
        setSuccess(`${singular} #${editingId} updated successfully.`);
      } else {
        await apiClient(endpoint, {
          method: "POST",
          requiresAuth: true,
          body: JSON.stringify(body),
        });
        setSuccess(`New ${singular.toLowerCase()} created successfully.`);
      }
      closeForm();
      await fetchRows();
    } catch (err) {
      setError(getErrorMessage(err, "Operation failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Delete ${singular} #${id}?`)) return;
    setError("");
    setSuccess("");
    try {
      await apiClient(`${endpoint}/${id}`, {
        method: "DELETE",
        requiresAuth: true,
      });
      if (selected && Number(selected[idKey]) === id) setSelected(null);
      setSuccess(`${singular} #${id} deleted successfully.`);
      await fetchRows();
    } catch (err) {
      setError(getErrorMessage(err, `Failed to delete ${singular.toLowerCase()}.`));
    }
  };

  const tableFields = fields.slice(0, 5);
  const colSpan = tableFields.length + 2;

  const inputStyle =
    "border-2 border-[var(--ink)] bg-white focus-visible:ring-0 focus-visible:shadow-[3px_3px_0_0_var(--ball)]";

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border-2 border-[var(--ink)] bg-red-100 p-3 text-sm font-medium text-red-800 shadow-[3px_3px_0_0_var(--ink)]">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border-2 border-[var(--ink)] bg-[var(--lime)] p-3 text-sm font-medium text-[var(--ink)] shadow-[3px_3px_0_0_var(--ink)]">
          {success}
        </div>
      )}

      {/* CREATE / UPDATE */}
      {isFormOpen && (
        <Card className="pop">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="font-display text-2xl">
                {editingId !== null
                  ? `Update ${singular} #${editingId}`
                  : `Create New ${singular}`}
              </CardTitle>
              <CardDescription>
                {editingId !== null
                  ? "Modify the details below."
                  : "Fill in the details below."}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={closeForm}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.key} className="space-y-2">
                    <Label
                      htmlFor={f.key}
                      className="font-mono text-xs font-bold uppercase tracking-wider"
                    >
                      {f.label}
                      {!f.required && " (optional)"}
                    </Label>
                    {f.type === "select" ? (
                      <select
                        id={f.key}
                        value={form[f.key] ?? ""}
                        onChange={(e) =>
                          setForm({ ...form, [f.key]: e.target.value })
                        }
                        className="flex h-9 w-full rounded-md border-2 border-[var(--ink)] bg-white px-3 py-1 text-sm outline-none focus:shadow-[3px_3px_0_0_var(--ball)]"
                      >
                        {f.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={f.key}
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key] ?? ""}
                        onChange={(e) =>
                          setForm({ ...form, [f.key]: e.target.value })
                        }
                        required={f.required}
                        className={inputStyle}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  className={`${popButton} bg-white`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className={`${popButton} bg-[var(--ball)] text-[var(--ink)] hover:bg-[var(--ball)]`}
                >
                  {submitting
                    ? "Saving..."
                    : editingId !== null
                    ? "Save Changes"
                    : `Create ${singular}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* READ single */}
      {selected && (
        <Card className="pop">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="font-display text-2xl">
                {singular} Details{" "}
                <span className="font-mono text-lg">
                  #{String(selected[idKey])}
                </span>
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                GET {endpoint}/{String(selected[idKey])}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-mono block text-[11px] uppercase tracking-wider text-muted-foreground">
                ID
              </span>
              <span className="font-mono font-bold">
                #{String(selected[idKey])}
              </span>
            </div>
            {fields.map((f) => (
              <div key={f.key}>
                <span className="font-mono block text-[11px] uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </span>
                <span className="font-medium">
                  {f.type === "select" && selected[f.key] ? (
                    <Badge value={String(selected[f.key])} />
                  ) : (
                    display(f, selected[f.key])
                  )}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* LIST */}
      <Card className="pop">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-display text-2xl">{title}</CardTitle>
            <CardDescription>
              A list of all {title.toLowerCase()} stored in the backend.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchRows}
              disabled={loading}
              className={`${popButton} bg-white`}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={openCreateForm}
              className={`${popButton} bg-[var(--ball)] text-[var(--ink)] hover:bg-[var(--ball)]`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create {singular}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border-2 border-[var(--ink)]">
            <Table>
              <TableHeader className="bg-[var(--ink)] [&_th]:font-mono [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-[var(--paper)]">
                <TableRow className="hover:bg-[var(--ink)]">
                  <TableHead className="w-17.5">ID</TableHead>
                  {tableFields.map((f) => (
                    <TableHead key={f.key}>{f.label}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={colSpan}
                      className="font-mono h-24 text-center text-muted-foreground"
                    >
                      Loading {title.toLowerCase()}...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={colSpan}
                      className="font-mono h-24 text-center text-muted-foreground"
                    >
                      No {title.toLowerCase()} yet. Serve the first one! 🏓
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => {
                    const id = Number(row[idKey]);
                    return (
                      <TableRow key={id} className="hover:bg-[var(--lime)]/30">
                        <TableCell className="font-mono font-bold">
                          #{id}
                        </TableCell>
                        {tableFields.map((f) => (
                          <TableCell key={f.key}>
                            {f.type === "select" && row[f.key] ? (
                              <Badge value={String(row[f.key])} />
                            ) : (
                              display(f, row[f.key])
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(id)}
                              className="border-2 border-[var(--ink)] bg-white"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Read
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditForm(row)}
                              className="border-2 border-[var(--ink)] bg-[var(--lime)] text-[var(--ink)] hover:bg-[var(--lime)]"
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Update
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(id)}
                              className="border-2 border-[var(--ink)]"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}