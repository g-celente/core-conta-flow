import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  CheckCircle2,
  Download,
  EyeOff,
  Filter,
  Pencil,
  Plus,
  Repeat,
  Save,
  Search,
  ShieldAlert,
  Split,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge, tomDoStatus } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useDados, type NovoTitulo } from "@/components/app/DadosContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  brl,
  categoriasDespesa,
  centrosDeCusto,
  type RateioLinha,
  type StatusTitulo,
  type TituloPagar,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contas-a-pagar")({
  head: () => ({
    meta: [
      { title: "Contas a pagar — FinCore" },
      {
        name: "description",
        content: "Gerencie títulos a pagar, vencimentos, rateio por centro de custo e aprovações.",
      },
      { property: "og:title", content: "Contas a pagar — FinCore" },
      {
        property: "og:description",
        content: "Criar, listar, editar e cancelar títulos com filtros e totais.",
      },
    ],
  }),
  component: ContasAPagar,
});

/** Alçada do operador: acima disso o título vai para /aprovacoes (PV3). */
const ALCADA = 10000;

const STATUS: StatusTitulo[] = [
  "Em aberto",
  "Aprovação pendente",
  "Agendado",
  "Pago",
  "Atrasado",
  "Cancelado",
];

type FormTitulo = {
  documento: string;
  parceiroId: string;
  categoria: string;
  vencimento: string;
  valor: string;
  parcelas: string;
  recorrencia: string;
  rateio: RateioLinha[];
};

const formVazio = (): FormTitulo => ({
  documento: "",
  parceiroId: "",
  categoria: categoriasDespesa[0]!,
  vencimento: "",
  valor: "",
  parcelas: "1",
  recorrencia: "Nenhuma",
  rateio: [{ centroId: centrosDeCusto[0]!.id, percentual: 100 }],
});

function ContasAPagar() {
  const { has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { titulos, parceiros, criarTitulo, editarTitulo, cancelarTitulo } = useDados();

  const usaCentroCusto = has("centro_custo");
  const usaAlcada = has("alcada");

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusTitulo | null>(null);
  const [filtroCentro, setFiltroCentro] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);

  const [sheetAberto, setSheetAberto] = useState(false);
  const [editando, setEditando] = useState<TituloPagar | null>(null);
  const [form, setForm] = useState<FormTitulo>(formVazio());
  const [cancelando, setCancelando] = useState<TituloPagar | null>(null);

  const centroDoTitulo = (t: TituloPagar) =>
    t.rateio.map((r) => centrosDeCusto.find((c) => c.id === r.centroId)?.codigo ?? "—").join(" / ");

  const lista = useMemo(
    () =>
      titulos.filter((t) => {
        if (
          busca &&
          !`${t.fornecedor} ${t.documento} ${t.categoria}`
            .toLowerCase()
            .includes(busca.toLowerCase())
        )
          return false;
        if (filtroStatus && t.status !== filtroStatus) return false;
        if (filtroCategoria && t.categoria !== filtroCategoria) return false;
        if (usaCentroCusto && filtroCentro && !t.rateio.some((r) => r.centroId === filtroCentro))
          return false;
        return true;
      }),
    [titulos, busca, filtroStatus, filtroCategoria, filtroCentro, usaCentroCusto],
  );

  const totalVisao = lista.reduce((s, t) => s + (t.status === "Cancelado" ? 0 : t.valor), 0);
  const totalAtrasado = lista
    .filter((t) => t.status === "Atrasado")
    .reduce((s, t) => s + t.valor, 0);
  const totalAberto = lista
    .filter((t) => t.status === "Em aberto" || t.status === "Agendado")
    .reduce((s, t) => s + t.valor, 0);

  const somaRateio = form.rateio.reduce((s, r) => s + (Number(r.percentual) || 0), 0);
  const valorNum = Number(form.valor.replace(",", ".")) || 0;
  const rateioOk = !usaCentroCusto || somaRateio === 100;
  const formOk =
    form.documento.trim() !== "" &&
    form.parceiroId !== "" &&
    form.vencimento.trim() !== "" &&
    valorNum > 0 &&
    rateioOk;

  const filtrosAtivos = [
    filtroStatus
      ? { id: "status", rotulo: "Status", valor: filtroStatus, limpar: () => setFiltroStatus(null) }
      : null,
    filtroCategoria
      ? {
          id: "cat",
          rotulo: "Categoria",
          valor: filtroCategoria,
          limpar: () => setFiltroCategoria(null),
        }
      : null,
    usaCentroCusto && filtroCentro
      ? {
          id: "cc",
          rotulo: "Centro de custo",
          valor: centrosDeCusto.find((c) => c.id === filtroCentro)?.codigo ?? "",
          limpar: () => setFiltroCentro(null),
        }
      : null,
  ].filter((f): f is NonNullable<typeof f> => f !== null);

  const abrirNovo = () => {
    setEditando(null);
    setForm(formVazio());
    setSheetAberto(true);
  };

  const abrirEdicao = (t: TituloPagar) => {
    setEditando(t);
    setForm({
      documento: t.documento,
      parceiroId: t.parceiroId,
      categoria: t.categoria,
      vencimento: t.vencimento,
      valor: String(t.valor),
      parcelas: t.parcela ? (t.parcela.split("/")[1] ?? "1") : "1",
      recorrencia: t.recorrencia ?? "Nenhuma",
      rateio: t.rateio.length ? t.rateio : [{ centroId: centrosDeCusto[0]!.id, percentual: 100 }],
    });
    setSheetAberto(true);
  };

  const salvar = () => {
    if (!formOk) return;
    const parceiro = parceiros.find((p) => p.id === form.parceiroId);
    const parcelasNum = Number(form.parcelas) || 1;

    const base: NovoTitulo = {
      documento: form.documento.trim(),
      parceiroId: form.parceiroId,
      fornecedor: parceiro?.razaoSocial ?? "—",
      categoria: form.categoria,
      vencimento: form.vencimento.trim(),
      valor: valorNum,
      rateio: usaCentroCusto
        ? form.rateio.map((r) => ({ ...r, percentual: Number(r.percentual) }))
        : [{ centroId: centrosDeCusto[0]!.id, percentual: 100 }],
      ...(parcelasNum > 1 ? { parcela: `1/${parcelasNum}` } : {}),
      ...(form.recorrencia !== "Nenhuma" ? { recorrencia: form.recorrencia } : {}),
    };

    if (editando) {
      editarTitulo(editando.id, base, perfil.usuario);
      registrar({
        tipo: "crud",
        entidade: "Título a pagar",
        operacao: "Editar",
        detalhe: `${base.documento} · ${base.fornecedor} · ${brl(base.valor)}`,
        usuario: perfil.usuario,
        empresa: nomeAtual,
      });
      toast.success("Título atualizado");
    } else {
      const acima = usaAlcada && valorNum > ALCADA;
      criarTitulo(base, perfil.usuario, acima);
      registrar({
        tipo: acima ? "aprovacao" : "crud",
        entidade: "Título a pagar",
        operacao: "Criar",
        detalhe: acima
          ? `${base.documento} · ${brl(base.valor)} acima da alçada de ${brl(ALCADA)} — enviado à aprovação`
          : `${base.documento} · ${base.fornecedor} · ${brl(base.valor)}`,
        usuario: perfil.usuario,
        empresa: nomeAtual,
      });
      if (acima) {
        toast.warning("Título enviado para aprovação", {
          description: `${brl(valorNum)} excede a alçada de ${brl(ALCADA)} do operador.`,
        });
      } else {
        toast.success("Título lançado em aberto");
      }
      if (parcelasNum > 1) {
        toast.info(`${parcelasNum} parcelas geradas`, {
          description: `Cada parcela de ${brl(valorNum / parcelasNum)} com vencimento mensal.`,
        });
      }
    }
    setSheetAberto(false);
  };

  const confirmarCancelamento = () => {
    if (!cancelando) return;
    cancelarTitulo(cancelando.id, perfil.usuario);
    registrar({
      tipo: "crud",
      entidade: "Título a pagar",
      operacao: "Cancelar",
      detalhe: `${cancelando.documento} cancelado logicamente`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Título cancelado logicamente", {
      description: "O registro permanece na base para auditoria.",
    });
    setCancelando(null);
  };

  const addLinhaRateio = () =>
    setForm((f) => ({
      ...f,
      rateio: [
        ...f.rateio,
        {
          centroId:
            centrosDeCusto.find((c) => !f.rateio.some((r) => r.centroId === c.id))?.id ??
            centrosDeCusto[0]!.id,
          percentual: 0,
        },
      ],
    }));

  return (
    <>
      <PageHeader
        titulo="Contas a pagar"
        descricao="Gerencie e monitore suas obrigações financeiras."
        variabilidade={[
          {
            o_que:
              "Coluna, filtro de centro de custo e bloco de rateio no formulário aparecem só com a feature ativa.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: `Títulos acima de ${brl(ALCADA)} vão para a fila de aprovação; sem alçada, salvam direto em aberto.`,
            por: "feature alcada",
            pv: "PV3",
          },
          {
            o_que: "Ações de criar, editar e cancelar ficam ocultas para o perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <>
              <Button asChild variant="outline" className="gap-1.5">
                <Link to="/exportacoes">
                  <Download className="size-4" /> Exportar
                </Link>
              </Button>
              <Button onClick={abrirNovo} className="gap-1.5">
                <Plus className="size-4" /> Nova conta
              </Button>
            </>
          )
        }
      />

      {/* Filtros */}
      <Card className="mb-4 shadow-card">
        <CardContent className="flex flex-wrap items-center gap-2 pt-6">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar fornecedor ou documento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {filtrosAtivos.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={f.limpar}
              className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <span className="font-normal text-muted-foreground">{f.rotulo}:</span>
              {f.valor}
              <X className="size-3" />
            </button>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 border-dashed">
                <Filter className="size-3.5" /> Filtro
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {STATUS.map((s) => (
                <DropdownMenuItem key={s} onSelect={() => setFiltroStatus(s)}>
                  {s}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Categoria</DropdownMenuLabel>
              {categoriasDespesa.map((c) => (
                <DropdownMenuItem key={c} onSelect={() => setFiltroCategoria(c)}>
                  {c}
                </DropdownMenuItem>
              ))}
              {usaCentroCusto ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Centro de custo</DropdownMenuLabel>
                  {centrosDeCusto.map((c) => (
                    <DropdownMenuItem key={c.id} onSelect={() => setFiltroCentro(c.id)}>
                      {c.codigo} — {c.descricao}
                    </DropdownMenuItem>
                  ))}
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="ml-auto text-xs text-muted-foreground">
            {lista.length} de {titulos.length} títulos
          </span>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="shadow-card">
        <CardContent className="overflow-x-auto pt-6">
          <Table className="min-w-[52rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Vencimento</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead className="hidden lg:table-cell">Categoria</TableHead>
                {usaCentroCusto ? (
                  <TableHead className="hidden xl:table-cell">Centro de custo</TableHead>
                ) : null}
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((t) => {
                const atrasado = t.status === "Atrasado";
                const cancelado = t.status === "Cancelado";
                return (
                  <TableRow key={t.id} className={cn(cancelado && "opacity-55")}>
                    <TableCell
                      className={cn(
                        "num whitespace-nowrap",
                        atrasado && "font-semibold text-destructive",
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {atrasado ? <TriangleAlert className="size-3.5" /> : null}
                        {t.vencimento}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className={cn(cancelado && "line-through")}>{t.fornecedor}</span>
                      {t.origem ? (
                        <StatusBadge tone="info" className="ml-2">
                          {t.origem}
                        </StatusBadge>
                      ) : null}
                    </TableCell>
                    <TableCell className="num text-sm text-muted-foreground">
                      {t.documento}
                      {t.parcela ? (
                        <span className="ml-1 rounded bg-muted px-1 text-[0.65rem]">
                          {t.parcela}
                        </span>
                      ) : null}
                      {t.recorrencia ? (
                        <span className="ml-1 rounded bg-primary/10 px-1 text-[0.65rem] text-primary">
                          {t.recorrencia}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {t.categoria}
                    </TableCell>
                    {usaCentroCusto ? (
                      <TableCell className="num hidden text-sm text-muted-foreground xl:table-cell">
                        {centroDoTitulo(t)}
                      </TableCell>
                    ) : null}
                    <TableCell className="num text-right font-semibold">{brl(t.valor)}</TableCell>
                    <TableCell>
                      <StatusBadge tone={tomDoStatus(t.status)}>{t.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {leitura ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Editar"
                            disabled={cancelado || t.status === "Pago"}
                            onClick={() => abrirEdicao(t)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {t.status !== "Pago" ? (
                            cancelado ? (
                              <Button size="icon" variant="ghost" title="Dar baixa" disabled>
                                <CheckCircle2 className="size-4" />
                              </Button>
                            ) : (
                              <Button size="icon" variant="ghost" title="Dar baixa" asChild>
                                <Link to="/baixa-pagamento" search={{ titulo: t.id }}>
                                  <CheckCircle2 className="size-4" />
                                </Link>
                              </Button>
                            )
                          ) : null}
                          <Button
                            size="icon"
                            variant="ghost"
                            title={
                              t.baixa
                                ? "Não é possível cancelar: título já possui baixa"
                                : "Cancelar título"
                            }
                            disabled={!!t.baixa || cancelado}
                            onClick={() => setCancelando(t)}
                            className="hover:text-destructive"
                          >
                            <Ban className="size-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {lista.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={usaCentroCusto ? 8 : 7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum título encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          {/* Totais */}
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">
              Exibindo {lista.length} de {titulos.length} registros
            </span>
            <div className="flex flex-wrap items-center gap-5">
              <span className="flex flex-col text-right">
                <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">
                  Em aberto
                </span>
                <span className="num font-bold text-success">{brl(totalAberto)}</span>
              </span>
              <span className="flex flex-col text-right">
                <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">
                  Total atrasado
                </span>
                <span className="num font-bold text-destructive">{brl(totalAtrasado)}</span>
              </span>
              <span className="flex flex-col text-right">
                <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">
                  Total da visão
                </span>
                <span className="num text-lg font-bold">{brl(totalVisao)}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      <Sheet open={sheetAberto} onOpenChange={setSheetAberto}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {editando ? `Editar título ${editando.documento}` : "Nova conta a pagar"}
            </SheetTitle>
            <SheetDescription>
              {usaAlcada
                ? `Valores acima de ${brl(ALCADA)} são enviados automaticamente à fila de aprovação (PV3).`
                : "Sem alçada configurada, o título é salvo direto como “Em aberto”."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="f-parceiro">Fornecedor *</Label>
                <Select
                  value={form.parceiroId}
                  onValueChange={(v) => setForm((f) => ({ ...f, parceiroId: v }))}
                >
                  <SelectTrigger id="f-parceiro">
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {parceiros
                      .filter((p) => p.ativo && p.tipo !== "Cliente")
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.razaoSocial}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="f-doc">Documento *</Label>
                <Input
                  id="f-doc"
                  className="num"
                  placeholder="NF-00000"
                  value={form.documento}
                  onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="f-venc">Vencimento *</Label>
                <Input
                  id="f-venc"
                  className="num"
                  placeholder="dd/mm/aaaa"
                  value={form.vencimento}
                  onChange={(e) => setForm((f) => ({ ...f, vencimento: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="f-valor">Valor *</Label>
                <div className="relative">
                  <span className="num pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="f-valor"
                    inputMode="decimal"
                    className="num pl-9"
                    placeholder="0,00"
                    value={form.valor}
                    onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  />
                </div>
                {usaAlcada && valorNum > ALCADA ? (
                  <p className="flex items-start gap-1.5 text-xs text-warning-foreground">
                    <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                    Acima da alçada de {brl(ALCADA)} — irá para a fila de aprovação.
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="f-cat">Categoria</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => setForm((f) => ({ ...f, categoria: v }))}
                >
                  <SelectTrigger id="f-cat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasDespesa.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="f-parc">Parcelamento</Label>
                <Select
                  value={form.parcelas}
                  onValueChange={(v) => setForm((f) => ({ ...f, parcelas: v }))}
                >
                  <SelectTrigger id="f-parc">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "6", "12", "24"].map((n) => (
                      <SelectItem key={n} value={n}>
                        {n === "1" ? "À vista" : `${n} parcelas mensais`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="f-rec">Recorrência</Label>
                <Select
                  value={form.recorrencia}
                  onValueChange={(v) => setForm((f) => ({ ...f, recorrencia: v }))}
                >
                  <SelectTrigger id="f-rec">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Nenhuma", "Mensal", "Bimestral", "Trimestral", "Anual"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {Number(form.parcelas) > 1 && valorNum > 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/8 p-3">
                <Repeat className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-xs text-muted-foreground">
                  Serão geradas <strong>{form.parcelas} parcelas</strong> de{" "}
                  <strong className="num">{brl(valorNum / Number(form.parcelas))}</strong>, a
                  primeira em {form.vencimento || "dd/mm/aaaa"}.
                </p>
              </div>
            ) : null}

            {/* Rateio — só com centro_custo (PV7) */}
            {usaCentroCusto ? (
              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Split className="size-4 text-primary" />
                    Rateio por centro de custo
                  </h3>
                  <StatusBadge tone={somaRateio === 100 ? "success" : "danger"}>
                    {somaRateio}% de 100%
                  </StatusBadge>
                </div>

                <div className="flex flex-col gap-2">
                  {form.rateio.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Select
                        value={r.centroId}
                        onValueChange={(v) =>
                          setForm((f) => ({
                            ...f,
                            rateio: f.rateio.map((x, idx) =>
                              idx === i ? { ...x, centroId: v } : x,
                            ),
                          }))
                        }
                      >
                        <SelectTrigger className="min-w-0 flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {centrosDeCusto.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.codigo} — {c.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative w-24 shrink-0">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="num pr-7"
                          value={r.percentual}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              rateio: f.rateio.map((x, idx) =>
                                idx === i ? { ...x, percentual: Number(e.target.value) } : x,
                              ),
                            }))
                          }
                        />
                        <span className="num pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          %
                        </span>
                      </div>
                      <span className="num w-24 shrink-0 text-right text-xs text-muted-foreground">
                        {brl((valorNum * (Number(r.percentual) || 0)) / 100)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Remover linha de rateio"
                        disabled={form.rateio.length === 1}
                        onClick={() =>
                          setForm((f) => ({ ...f, rateio: f.rateio.filter((_, idx) => idx !== i) }))
                        }
                        className="shrink-0 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-dashed"
                    disabled={form.rateio.length >= centrosDeCusto.length}
                    onClick={addLinhaRateio}
                  >
                    <Plus className="size-3.5" /> Adicionar centro
                  </Button>
                  {somaRateio !== 100 ? (
                    <p className="text-xs text-destructive">
                      O rateio precisa somar exatamente 100% para salvar.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
                <EyeOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  O bloco de rateio por centro de custo está oculto porque a feature{" "}
                  <code className="num">centro_custo</code> não está contratada neste tenant (PV7).
                </p>
              </div>
            )}

            {editando ? (
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-2 text-sm font-semibold">Histórico de alterações</h3>
                <ul className="flex flex-col gap-1.5">
                  {editando.historico.map((h, i) => (
                    <li key={i} className="flex flex-wrap gap-2 text-xs">
                      <span className="num shrink-0 text-muted-foreground">{h.data}</span>
                      <span>{h.descricao}</span>
                      <span className="ml-auto shrink-0 text-muted-foreground">{h.usuario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setSheetAberto(false)}>
                Cancelar
              </Button>
              <Button disabled={!formOk} onClick={salvar} className="gap-1.5">
                <Save className="size-4" />
                {editando ? "Salvar alterações" : "Lançar título"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancelamento */}
      <Dialog open={!!cancelando} onOpenChange={(o) => !o && setCancelando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-destructive" />
              Cancelar título
            </DialogTitle>
            <DialogDescription>
              {cancelando
                ? `${cancelando.documento} · ${cancelando.fornecedor} · ${brl(cancelando.valor)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O cancelamento é <strong>lógico</strong>: o título permanece na base com status
            “Cancelado” para fins de auditoria e não entra nos totais.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelando(null)}>
              Voltar
            </Button>
            <Button variant="destructive" onClick={confirmarCancelamento}>
              Sim, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
