import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Cable,
  CheckCircle2,
  CheckCheck,
  FilePlus2,
  FolderLock,
  Sigma,
  Table as TableIcon,
  ToggleRight,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { StatusBadge } from "@/components/app/StatusBadge";
import { cn } from "@/lib/utils";
import { calcularComissoes, competencias, type LinhaComissao } from "./dados";
import type { PortaNucleo } from "./tipos";

/**
 * Tela do módulo exclusivo. Recebe a porta do núcleo por props — não importa
 * nenhum contexto nem tipo de domínio do núcleo, o que mantém a fronteira de
 * isolamento. (Os componentes de UI compartilhados são design system, não
 * regra de negócio.)
 */

const moeda = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function TelaComissoes({ porta }: { porta: PortaNucleo }) {
  const [competencia, setCompetencia] = useState(competencias[0]!.id);
  const [linhas, setLinhas] = useState<LinhaComissao[]>(() =>
    calcularComissoes(competencias[0]!.id),
  );
  const [selecionadas, setSelecionadas] = useState<string[]>([]);

  const trocarCompetencia = (id: string) => {
    setCompetencia(id);
    setLinhas(calcularComissoes(id));
    setSelecionadas([]);
  };

  const rotuloCompetencia = competencias.find((c) => c.id === competencia)?.rotulo ?? competencia;

  const totais = useMemo(
    () => ({
      recebido: linhas.reduce((s, l) => s + l.recebido, 0),
      comissao: linhas.reduce((s, l) => s + l.comissao, 0),
      aprovadas: linhas.filter((l) => l.status !== "A aprovar").length,
    }),
    [linhas],
  );

  const aprovar = (ids: string[]) => {
    if (ids.length === 0) return;
    setLinhas((l) =>
      l.map((x) =>
        ids.includes(x.vendedorId) && x.status === "A aprovar" ? { ...x, status: "Aprovada" } : x,
      ),
    );
    porta.auditar(
      "Aprovar comissão",
      `${ids.length} comissão(ões) aprovada(s) na competência ${rotuloCompetencia}`,
    );
    toast.success(`${ids.length} comissão(ões) aprovada(s)`);
    setSelecionadas([]);
  };

  const gerarTitulo = () => {
    const aprovadas = linhas.filter((l) => l.status === "Aprovada" && l.comissao > 0);
    if (aprovadas.length === 0) {
      toast.error("Nenhuma comissão aprovada", {
        description: "Aprove ao menos uma linha antes de gerar o título.",
      });
      return;
    }
    const valor = +aprovadas.reduce((s, l) => s + l.comissao, 0).toFixed(2);
    const criado = porta.lancarTitulo({
      documento: `COM-${competencia.replace("-", "")}`,
      fornecedor: `Comissões de vendas — ${rotuloCompetencia}`,
      valor,
      vencimento: "10/07/2026",
      categoria: "Comissões",
      origem: "Módulo de comissões",
    });
    setLinhas((l) =>
      l.map((x) => (x.status === "Aprovada" ? { ...x, status: "Título gerado" } : x)),
    );
    porta.auditar(
      "Gerar título de comissão",
      `Título ${criado.documento} de ${moeda(valor)} criado a partir de ${aprovadas.length} comissão(ões)`,
    );
    toast.success(`Título ${criado.documento} criado em Contas a pagar`, {
      description: `${moeda(valor)} · vencimento 10/07/2026 · categoria Comissões.`,
    });
  };

  const todasSelecionaveis = linhas
    .filter((l) => l.status === "A aprovar")
    .map((l) => l.vendedorId);

  const fronteiras = [
    {
      icone: FolderLock,
      titulo: "Pacote separado",
      texto:
        "Todo o código vive em src/modules/comissoes/ — rota, componentes, dados e tipos. Nenhum arquivo do núcleo importa desta pasta.",
    },
    {
      icone: TableIcon,
      titulo: "Tabela própria",
      texto:
        "O cadastro de vendedores, percentuais e recebimentos por competência está em modules/comissoes/dados.ts, fora de src/lib/mock-data.ts.",
    },
    {
      icone: Cable,
      titulo: "Leitura via interface do núcleo",
      texto:
        "O módulo declara a porta PortaNucleo em tipos.ts. A rota injeta a implementação; o módulo nunca conhece TituloPagar nem os contextos do núcleo.",
    },
    {
      icone: ToggleRight,
      titulo: "Rota condicional",
      texto:
        "A rota /comissoes só renderiza a tela quando a flag mod_comissoes está ativa. Em qualquer outro tenant, redireciona para o dashboard com aviso.",
    },
  ];

  return (
    <>
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="space-y-1.5 pt-6">
            <Label htmlFor="comp">Competência</Label>
            <Select value={competencia} onValueChange={trocarCompetencia}>
              <SelectTrigger id="comp">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {competencias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {linhas.length} vendedores comissionados nesta competência.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Sigma className="size-4" /> Regra de cálculo
            </p>
            <p className="text-sm">
              Percentual contratado <strong>sobre o valor de títulos recebidos no mês</strong>.
              Títulos cancelados e não liquidados ficam fora da base.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Wallet className="size-4" /> Total de comissões
            </p>
            <p className="num text-2xl font-bold text-success">{moeda(totais.comissao)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Base recebida {moeda(totais.recebido)} · {totais.aprovadas} de {linhas.length}{" "}
              aprovadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Comissões de {rotuloCompetencia}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={selecionadas.length === 0}
              onClick={() => aprovar(selecionadas)}
            >
              <CheckCheck className="size-3.5" /> Aprovar selecionadas ({selecionadas.length})
            </Button>
            <Button size="sm" className="gap-1.5" onClick={gerarTitulo}>
              <FilePlus2 className="size-3.5" /> Gerar título a pagar (comissão)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[46rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todas"
                    className="size-4 rounded accent-[var(--primary)]"
                    checked={
                      todasSelecionaveis.length > 0 &&
                      selecionadas.length === todasSelecionaveis.length
                    }
                    onChange={(e) => setSelecionadas(e.target.checked ? todasSelecionaveis : [])}
                  />
                </TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Recebido</TableHead>
                <TableHead className="w-20 text-right">%</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
                <TableHead className="w-40 text-center">Status</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l) => {
                const podeAprovar = l.status === "A aprovar";
                return (
                  <TableRow key={l.vendedorId}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${l.vendedor}`}
                        disabled={!podeAprovar}
                        className="size-4 rounded accent-[var(--primary)] disabled:opacity-30"
                        checked={selecionadas.includes(l.vendedorId)}
                        onChange={(e) =>
                          setSelecionadas((s) =>
                            e.target.checked
                              ? [...s, l.vendedorId]
                              : s.filter((x) => x !== l.vendedorId),
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <span className="block font-medium">{l.vendedor}</span>
                      <span className="block text-xs text-muted-foreground">{l.equipe}</span>
                    </TableCell>
                    <TableCell className="num text-right">{moeda(l.recebido)}</TableCell>
                    <TableCell className="num text-right text-muted-foreground">
                      {l.percentual}%
                    </TableCell>
                    <TableCell className="num text-right font-bold text-success">
                      {moeda(l.comissao)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge
                        tone={
                          l.status === "A aprovar"
                            ? "warning"
                            : l.status === "Aprovada"
                              ? "success"
                              : "info"
                        }
                      >
                        {l.status}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {podeAprovar ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Aprovar comissão"
                          className="hover:text-success"
                          onClick={() => aprovar([l.vendedorId])}
                        >
                          <CheckCircle2 className="size-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Finalizada</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              {linhas.length} vendedores · competência {rotuloCompetencia}
            </span>
            <div className="flex items-center gap-5">
              <span className="flex flex-col text-right">
                <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">
                  Base recebida
                </span>
                <span className="num font-bold">{moeda(totais.recebido)}</span>
              </span>
              <span className="flex flex-col text-right">
                <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">
                  Total de comissões
                </span>
                <span className="num text-lg font-bold text-success">{moeda(totais.comissao)}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cn("mt-6 border-destructive/40 shadow-card")}>
        <CardHeader>
          <CardTitle className="text-base">Fronteiras de isolamento do módulo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {fronteiras.map((c) => {
            const Icone = c.icone;
            return (
              <div
                key={c.titulo}
                className="flex gap-3 rounded-lg border border-border bg-muted/40 p-3"
              >
                <Icone className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-sm font-semibold">{c.titulo}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{c.texto}</span>
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
}
