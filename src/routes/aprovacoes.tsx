import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, titulosAPagar } from "@/lib/mock-data";

export const Route = createFileRoute("/aprovacoes")({
  head: () => ({
    meta: [
      { title: "Fila de aprovação de pagamentos — FinCore" },
      {
        name: "description",
        content: "Títulos acima da alçada do operador aguardando aprovação ou devolução.",
      },
      { property: "og:title", content: "Fila de aprovação de pagamentos — FinCore" },
      { property: "og:description", content: "Aprove ou devolva títulos com justificativa." },
    ],
  }),
  component: Aprovacoes,
});

type Item = (typeof titulosAPagar)[number] & { status: "pendente" | "aprovado" | "devolvido" };

function Aprovacoes() {
  const [itens, setItens] = useState<Item[]>(
    titulosAPagar.map((t) => ({ ...t, status: "pendente" as const })),
  );
  const [devolvendo, setDevolvendo] = useState<Item | null>(null);
  const [justificativa, setJustificativa] = useState("");

  const aprovar = (id: string) => {
    setItens((l) => l.map((i) => (i.id === id ? { ...i, status: "aprovado" } : i)));
    toast.success("Título aprovado para pagamento");
  };

  const confirmarDevolucao = () => {
    if (!devolvendo || justificativa.trim().length < 5) return;
    setItens((l) => l.map((i) => (i.id === devolvendo.id ? { ...i, status: "devolvido" } : i)));
    toast.info(`Título devolvido a ${devolvendo.lancadoPor}`);
    setDevolvendo(null);
    setJustificativa("");
  };

  const pendentes = itens.filter((i) => i.status === "pendente");
  const total = pendentes.reduce((s, i) => s + i.valor, 0);

  return (
    <>
      <PageHeader
        titulo="Fila de aprovação de pagamentos"
        descricao="Títulos acima da alçada de R$ 5.000,00 do operador logado."
        acoes={
          <>
            <StatusBadge tone="warning">{pendentes.length} aguardando</StatusBadge>
            <StatusBadge tone="info">Total {brl(total)}</StatusBadge>
          </>
        }
      />

      <Card className="shadow-card">
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Lançado por</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.fornecedor}</TableCell>
                  <TableCell className="num text-right font-semibold">{brl(i.valor)}</TableCell>
                  <TableCell className="num text-sm">{i.vencimento}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{i.lancadoPor}</TableCell>
                  <TableCell>
                    <StatusBadge
                      tone={
                        i.status === "aprovado"
                          ? "success"
                          : i.status === "devolvido"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {i.status === "aprovado"
                        ? "Aprovado"
                        : i.status === "devolvido"
                          ? "Devolvido"
                          : "Aguardando"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    {i.status === "pendente" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => aprovar(i.id)}>
                          Aprovar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDevolvendo(i)}>
                          Devolver
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Finalizado</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={!!devolvendo}
        onOpenChange={(o) => {
          if (!o) {
            setDevolvendo(null);
            setJustificativa("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolver título</DialogTitle>
            <DialogDescription>
              {devolvendo
                ? `${devolvendo.fornecedor} · ${brl(devolvendo.valor)} · venc. ${devolvendo.vencimento}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="justificativa">
              Justificativa <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="justificativa"
              rows={4}
              placeholder="Ex.: nota fiscal divergente do pedido de compra 2026/0412."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 5 caracteres. A justificativa é enviada a quem lançou o título.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDevolvendo(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={justificativa.trim().length < 5}
              onClick={confirmarDevolucao}
            >
              Confirmar devolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
