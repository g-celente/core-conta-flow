import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/importar-extrato")({
  head: () => ({
    meta: [
      { title: "Importar extrato bancário — FinCore" },
      {
        name: "description",
        content: "Importe arquivos OFX e CNAB e revise as linhas lidas antes de confirmar.",
      },
      { property: "og:title", content: "Importar extrato bancário — FinCore" },
      { property: "og:description", content: "Upload de OFX/CNAB com prévia e validação." },
    ],
  }),
  component: ImportarExtrato,
});

type Linha = {
  data: string;
  descricao: string;
  valor: number;
  tipo: "Crédito" | "Débito";
  erro?: string;
};

const linhasMock: Linha[] = [
  { data: "01/06/2026", descricao: "TED RECEBIDA - MERCADO CENTRAL LTDA", valor: 12450.0, tipo: "Crédito" },
  { data: "02/06/2026", descricao: "PIX ENVIADO - EMBALAGENS IPIRANGA ME", valor: 7350.0, tipo: "Débito" },
  { data: "03/06/2026", descricao: "TARIFA PACOTE SERVICOS", valor: 89.9, tipo: "Débito" },
  {
    data: "04/06/2026",
    descricao: "LINHA 0042 - REGISTRO TRUNCADO",
    valor: 0,
    tipo: "Débito",
    erro: "Campo de valor inválido no segmento CNAB (posição 142-155).",
  },
  { data: "05/06/2026", descricao: "BOLETO PAGO - ENERGISA DISTRIBUICAO", valor: 12760.35, tipo: "Débito" },
  {
    data: "06/06/2026",
    descricao: "LINHA 0071 - DATA FORA DO PERIODO",
    valor: 3200.0,
    tipo: "Crédito",
    erro: "Data 31/02/2026 inexistente.",
  },
  { data: "08/06/2026", descricao: "DEPOSITO DINHEIRO - CAIXA LOJA 2", valor: 4820.75, tipo: "Crédito" },
];

function ImportarExtrato() {
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const validas = linhasMock.filter((l) => !l.erro);
  const invalidas = linhasMock.length - validas.length;

  const carregar = (nome: string) => {
    setArquivo(nome);
    toast.success(`Arquivo ${nome} lido com sucesso`);
  };

  return (
    <>
      <PageHeader
        titulo="Importar extrato bancário"
        descricao="Aceita arquivos .ofx e .cnab exportados pelo internet banking."
        acoes={
          arquivo ? (
            <Button variant="outline" onClick={() => setArquivo(null)}>
              Trocar arquivo
            </Button>
          ) : null
        }
      />

      {!arquivo ? (
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                carregar(e.dataTransfer.files?.[0]?.name ?? "extrato-junho-2026.ofx");
              }}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-14 text-center transition-colors",
                dragging && "border-primary bg-accent/50",
              )}
            >
              <UploadCloud className="size-10 text-primary" />
              <p className="mt-4 text-base font-semibold">Arraste o arquivo aqui</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Formatos aceitos: .ofx e .cnab · até 10 MB
              </p>
              <label className="mt-5 inline-flex">
                <input
                  type="file"
                  accept=".ofx,.cnab,.ret,.txt"
                  className="sr-only"
                  onChange={(e) => carregar(e.target.files?.[0]?.name ?? "extrato.ofx")}
                />
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  <FileUp className="size-4" /> Selecionar arquivo
                </span>
              </label>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">
              Prévia de {arquivo}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {linhasMock.length} linhas lidas
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <StatusBadge tone="success">{validas.length} válidas</StatusBadge>
              <StatusBadge tone="danger">{invalidas} com erro</StatusBadge>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-28">Tipo</TableHead>
                  <TableHead className="w-36 text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linhasMock.map((l, i) => (
                  <TableRow
                    key={i}
                    className={cn(l.erro && "bg-destructive/8 hover:bg-destructive/12")}
                  >
                    <TableCell className="num align-top text-sm">{l.data}</TableCell>
                    <TableCell className="align-top">
                      <span className={cn("text-sm", l.erro && "font-medium text-destructive")}>
                        {l.descricao}
                      </span>
                      {l.erro ? (
                        <p className="mt-1 text-xs text-destructive">{l.erro}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top">
                      <StatusBadge tone={l.tipo === "Crédito" ? "success" : "neutral"}>
                        {l.tipo}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="num align-top text-right">
                      {l.erro ? "—" : brl(l.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setArquivo(null)}>
                Cancelar
              </Button>
              <Button
                disabled={validas.length === 0}
                onClick={() =>
                  toast.success(`${validas.length} lançamentos importados para conciliação`)
                }
              >
                Confirmar importação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
