import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  FileEdit,
  LogIn,
  ScrollText,
  Search,
  ShieldCheck,
  ToggleRight,
  Wand2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge, type Tone } from "@/components/app/StatusBadge";
import { useAuditoria, type TipoEvento } from "@/components/app/AuditoriaContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auditoria")({
  head: () => ({
    meta: [
      { title: "Trilha de auditoria — FinCore" },
      {
        name: "description",
        content: "Log das operações feitas na sessão: CRUD, aprovações e mudanças de feature.",
      },
      { property: "og:title", content: "Trilha de auditoria — FinCore" },
      { property: "og:description", content: "Quem fez, o quê, quando e em qual empresa." },
    ],
  }),
  component: Auditoria,
});

const TIPOS: { id: TipoEvento; nome: string; icone: typeof FileEdit; tom: Tone }[] = [
  { id: "crud", nome: "Cadastros e títulos", icone: FileEdit, tom: "info" },
  { id: "aprovacao", nome: "Aprovações", icone: ShieldCheck, tom: "success" },
  { id: "feature", nome: "Features e parâmetros", icone: ToggleRight, tom: "warning" },
  { id: "acesso", nome: "Acesso", icone: LogIn, tom: "neutral" },
  { id: "modulo", nome: "Módulo exclusivo", icone: Wand2, tom: "danger" },
];

function Auditoria() {
  const { eventos } = useAuditoria();
  const { perfil } = usePerfil();

  const [filtro, setFiltro] = useState<TipoEvento | null>(null);
  const [busca, setBusca] = useState("");

  const lista = useMemo(
    () =>
      eventos.filter((e) => {
        if (filtro && e.tipo !== filtro) return false;
        if (
          busca &&
          !`${e.entidade} ${e.operacao} ${e.detalhe} ${e.usuario} ${e.empresa}`
            .toLowerCase()
            .includes(busca.toLowerCase())
        )
          return false;
        return true;
      }),
    [eventos, filtro, busca],
  );

  const contagem = (t: TipoEvento) => eventos.filter((e) => e.tipo === t).length;

  const exportar = () => {
    toast.success(`${lista.length} evento(s) exportado(s)`, {
      description: `Arquivo CSV com ${lista.length} linhas gerado.`,
    });
  };

  return (
    <>
      <PageHeader
        titulo="Trilha de auditoria"
        descricao="Operações registradas nesta sessão. Cada CRUD, aprovação e mudança de feature grava uma linha."
        variabilidade={[
          {
            o_que: "A categoria Módulo exclusivo só aparece quando o módulo de comissões é usado.",
            por: "feature mod_comissoes",
            pv: "PV7",
          },
          {
            o_que: "Todos os perfis leem a trilha; nenhum perfil pode editar ou apagar registros.",
            por: "regra de negócio do núcleo",
            pv: "núcleo",
          },
          {
            o_que: "A coluna Empresa registra o tenant ativo no momento da operação.",
            por: "seletor de empresa",
            pv: "PV7",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone="info">{eventos.length} eventos</StatusBadge>
            <Button
              variant="outline"
              className="gap-1.5"
              disabled={lista.length === 0}
              onClick={exportar}
            >
              <Download className="size-4" /> Exportar CSV
            </Button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {TIPOS.map((t) => {
          const qtd = contagem(t.id);
          const ativo = filtro === t.id;
          const Icone = t.icone;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setFiltro(ativo ? null : t.id)}
              className="text-left"
            >
              <Card
                className={cn(
                  "h-full shadow-card transition-all",
                  ativo ? "border-primary ring-1 ring-primary" : "hover:border-primary/40",
                )}
              >
                <CardContent className="pt-6">
                  <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Icone className="size-4 shrink-0" />
                    <span className="truncate">{t.nome}</span>
                  </p>
                  <p className="num text-xl font-bold">{qtd}</p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex flex-wrap items-center gap-3 text-base">
            Eventos da sessão
            {filtro ? (
              <button
                type="button"
                onClick={() => setFiltro(null)}
                className="flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
              >
                {TIPOS.find((t) => t.id === filtro)?.nome}
                <X className="size-3" />
              </button>
            ) : null}
          </CardTitle>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por entidade, operação ou usuário"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {eventos.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <ScrollText className="size-10 text-muted-foreground" />
              <p className="text-base font-semibold">Nenhum evento registrado ainda</p>
              <p className="max-w-[32rem] text-sm text-muted-foreground">
                A trilha começa vazia em cada sessão. Cadastre um parceiro, lance um título, aprove
                um pagamento ou ligue/desligue uma feature na tela de configurações — cada ação
                grava uma linha aqui, com o usuário <strong>{perfil.usuario}</strong> e o tenant
                ativo.
              </p>
            </div>
          ) : (
            <Table className="min-w-[52rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Hora</TableHead>
                  <TableHead className="w-44">Tipo</TableHead>
                  <TableHead className="w-44">Entidade</TableHead>
                  <TableHead className="w-36">Operação</TableHead>
                  <TableHead>Detalhe</TableHead>
                  <TableHead className="w-40">Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((e) => {
                  const tipo = TIPOS.find((t) => t.id === e.tipo);
                  const Icone = tipo?.icone ?? FileEdit;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="num text-sm text-muted-foreground">{e.hora}</TableCell>
                      <TableCell>
                        <StatusBadge tone={tipo?.tom ?? "neutral"}>
                          <Icone className="size-3" />
                          {tipo?.nome ?? e.tipo}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{e.entidade}</TableCell>
                      <TableCell className="text-sm">{e.operacao}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.detalhe}</TableCell>
                      <TableCell>
                        <span className="block text-sm">{e.usuario}</span>
                        <span className="block truncate text-[0.7rem] text-muted-foreground">
                          {e.empresa}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {lista.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Nenhum evento encontrado com os filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          )}

          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            A trilha é mantida em memória e reinicia ao recarregar a página — no produto real seria
            persistida com retenção de 5 anos e acesso somente leitura para todos os perfis.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
