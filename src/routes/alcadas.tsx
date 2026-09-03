import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { brl, usuarios } from "@/lib/mock-data";

export const Route = createFileRoute("/alcadas")({
  head: () => ({
    meta: [
      { title: "Configurar alçada de aprovação — FinCore" },
      {
        name: "description",
        content: "Defina limites de aprovação automática por perfil e aprovadores substitutos.",
      },
      { property: "og:title", content: "Configurar alçada de aprovação — FinCore" },
      { property: "og:description", content: "Limites por perfil e substituto em ausências." },
    ],
  }),
  component: Alcadas,
});

type Perfil = { id: string; nome: string; titular: string; limite: number; substituto: string };

const iniciais: Perfil[] = [
  { id: "p1", nome: "Operador financeiro", titular: "Juliana Prado", limite: 5000, substituto: "Renata Oliveira" },
  { id: "p2", nome: "Analista financeiro", titular: "Renata Oliveira", limite: 25000, substituto: "Ana Paula Ribeiro" },
  { id: "p3", nome: "Coordenador", titular: "Ana Paula Ribeiro", limite: 80000, substituto: "Carlos Eduardo Menezes" },
  { id: "p4", nome: "Diretor financeiro", titular: "Carlos Eduardo Menezes", limite: 500000, substituto: "Marcos Vinícius Tavares" },
];

function Alcadas() {
  const [perfis, setPerfis] = useState(iniciais);

  const atualizar = (id: string, campo: keyof Perfil, valor: string | number) =>
    setPerfis((p) => p.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));

  return (
    <>
      <PageHeader
        titulo="Configurar alçada"
        descricao="Valores acima do limite do perfil vão automaticamente para a fila de aprovação."
        acoes={
          <Button onClick={() => toast.success("Alçadas atualizadas")}>Salvar alterações</Button>
        }
      />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Perfis de usuário</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead className="w-52">Limite de aprovação automática</TableHead>
                <TableHead className="w-64">Aprovador substituto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perfis.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.nome}
                    <p className="num text-xs text-muted-foreground">Limite atual {brl(p.limite)}</p>
                  </TableCell>
                  <TableCell className="text-sm">{p.titular}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        min={0}
                        step={500}
                        className="num"
                        value={p.limite}
                        onChange={(e) => atualizar(p.id, "limite", Number(e.target.value))}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={p.substituto}
                      onValueChange={(v) => atualizar(p.id, "substituto", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Regras gerais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Prazo para aprovação (dias úteis)</label>
            <Input type="number" defaultValue={2} className="num" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Acionar substituto após (horas sem ação)</label>
            <Input type="number" defaultValue={24} className="num" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
