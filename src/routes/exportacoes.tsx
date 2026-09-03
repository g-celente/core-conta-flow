import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export const Route = createFileRoute("/exportacoes")({
  head: () => ({
    meta: [
      { title: "Exportar dados e relatórios — FinCore" },
      {
        name: "description",
        content: "Gere exportações em PDF, XLSX ou CSV no layout do sistema ou da contabilidade.",
      },
      { property: "og:title", content: "Exportar dados e relatórios — FinCore" },
      { property: "og:description", content: "Exportações contábeis com histórico de downloads." },
    ],
  }),
  component: Exportacoes,
});

type Exp = {
  id: string;
  periodo: string;
  formato: string;
  layout: string;
  gerado: string;
  status: "Concluída" | "Processando";
  arquivo: string;
};

const historicoInicial: Exp[] = [
  { id: "e1", periodo: "01/05/2026 a 31/05/2026", formato: "XLSX", layout: "Escritório contábil", gerado: "01/06/2026 08:42", status: "Concluída", arquivo: "fincore-maio-2026.xlsx" },
  { id: "e2", periodo: "01/04/2026 a 30/04/2026", formato: "PDF", layout: "Padrão do sistema", gerado: "02/05/2026 09:15", status: "Concluída", arquivo: "fincore-abril-2026.pdf" },
  { id: "e3", periodo: "01/01/2026 a 31/03/2026", formato: "CSV", layout: "Escritório contábil", gerado: "05/04/2026 17:03", status: "Concluída", arquivo: "fincore-1tri-2026.csv" },
];

function Exportacoes() {
  const [historico, setHistorico] = useState(historicoInicial);
  const [inicio, setInicio] = useState("2026-06-01");
  const [fim, setFim] = useState("2026-06-30");
  const [formato, setFormato] = useState("XLSX");
  const [layout, setLayout] = useState("Padrão do sistema");

  const gerar = () => {
    const fmt = (d: string) => d.split("-").reverse().join("/");
    setHistorico((h) => [
      {
        id: `e${Date.now()}`,
        periodo: `${fmt(inicio)} a ${fmt(fim)}`,
        formato,
        layout,
        gerado: "03/09/2026 12:39",
        status: "Processando",
        arquivo: `fincore-export.${formato.toLowerCase()}`,
      },
      ...h,
    ]);
    toast.success("Exportação enfileirada. Você será notificado ao concluir.");
  };

  return (
    <>
      <PageHeader
        titulo="Exportar dados e relatórios"
        descricao="Gere arquivos para a contabilidade ou para análise interna."
      />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Nova exportação</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="inicio">Data inicial</Label>
            <Input id="inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fim">Data final</Label>
            <Input id="fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Formato</Label>
            <Select value={formato} onValueChange={setFormato}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="XLSX">XLSX</SelectItem>
                <SelectItem value="CSV">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Layout</Label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Padrão do sistema">Padrão do sistema</SelectItem>
                <SelectItem value="Escritório contábil">Layout do escritório de contabilidade</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="xl:col-span-4">
            <Button onClick={gerar}>Gerar exportação</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Últimas exportações</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Gerado em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Arquivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="num text-sm">{h.periodo}</TableCell>
                  <TableCell>
                    <StatusBadge tone="neutral">{h.formato}</StatusBadge>
                  </TableCell>
                  <TableCell className="text-sm">{h.layout}</TableCell>
                  <TableCell className="num text-sm">{h.gerado}</TableCell>
                  <TableCell>
                    <StatusBadge tone={h.status === "Concluída" ? "success" : "warning"}>
                      {h.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      disabled={h.status !== "Concluída"}
                      onClick={() => toast.success(`Baixando ${h.arquivo}`)}
                    >
                      <Download className="size-4" /> Baixar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
