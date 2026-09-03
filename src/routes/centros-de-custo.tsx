import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { brl, centrosDeCusto, usuarios } from "@/lib/mock-data";

export const Route = createFileRoute("/centros-de-custo")({
  head: () => ({
    meta: [
      { title: "Centros de custo — FinCore" },
      {
        name: "description",
        content: "Cadastre centros de custo com responsável, rateio padrão e total do mês.",
      },
      { property: "og:title", content: "Centros de custo — FinCore" },
      { property: "og:description", content: "Cadastro e acompanhamento de centros de custo." },
    ],
  }),
  component: CentrosDeCusto,
});

function CentrosDeCusto() {
  const [lista, setLista] = useState(centrosDeCusto);
  const [aberto, setAberto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState({ codigo: "", descricao: "", responsavel: usuarios[0]!, rateio: 0 });

  const filtrada = lista.filter((c) =>
    `${c.codigo} ${c.descricao} ${c.responsavel}`.toLowerCase().includes(filtro.toLowerCase()),
  );
  const total = lista.reduce((s, c) => s + c.mes, 0);

  const salvar = () => {
    if (!form.codigo || !form.descricao) return;
    setLista((l) => [...l, { id: `cc-${Date.now()}`, ...form, mes: 0 }]);
    setAberto(false);
    setForm({ codigo: "", descricao: "", responsavel: usuarios[0]!, rateio: 0 });
    toast.success("Centro de custo cadastrado");
  };

  return (
    <>
      <PageHeader
        titulo="Centro de custo"
        descricao="Estrutura de custos usada no rateio de títulos e nos relatórios gerenciais."
        acoes={
          <Button className="gap-1.5" onClick={() => setAberto(true)}>
            <Plus className="size-4" /> Novo centro de custo
          </Button>
        }
      />

      <Card className="shadow-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">
            {lista.length} centros · total lançado em junho/2026:{" "}
            <span className="num">{brl(total)}</span>
          </CardTitle>
          <Input
            placeholder="Filtrar por código, descrição ou responsável"
            className="sm:max-w-xs"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Rateio padrão</TableHead>
                <TableHead className="text-right">Lançado no mês</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrada.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="num font-semibold">{c.codigo}</TableCell>
                  <TableCell>{c.descricao}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.responsavel}</TableCell>
                  <TableCell className="num text-right">{c.rateio}%</TableCell>
                  <TableCell className="num text-right font-semibold">{brl(c.mes)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Novo centro de custo</SheetTitle>
            <SheetDescription>Os campos marcados com * são obrigatórios.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4">
            <div className="space-y-1.5">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                placeholder="CC-500"
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                placeholder="Marketing"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select
                value={form.responsavel}
                onValueChange={(v) => setForm({ ...form, responsavel: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rateio">Rateio padrão (%)</Label>
              <Input
                id="rateio"
                type="number"
                min={0}
                max={100}
                className="num"
                value={form.rateio}
                onChange={(e) => setForm({ ...form, rateio: Number(e.target.value) })}
              />
            </div>
          </div>
          <SheetFooter>
            <Button onClick={salvar}>Salvar centro de custo</Button>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
