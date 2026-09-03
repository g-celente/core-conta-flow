import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge, tomDoStatus } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useDados, type NovoTitulo } from "@/components/app/DadosContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
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

export const Route = createFileRoute("/contas-a-pagar")({
  head: () => ({
    meta: [
      { title: "Contas a pagar — FinCore ERP" },
      {
        name: "description",
        content: "Gerencie títulos a pagar, vencimentos, rateio por centro de custo e aprovações.",
      },
      { property: "og:title", content: "Contas a pagar — FinCore ERP" },
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

const inputCls =
  "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary";
const monoCls =
  "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-data-mono text-data-mono focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary";
const labelCls = "mb-1.5 block font-label-md text-label-md text-on-surface-variant";

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
              <Link
                to="/exportacoes"
                className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Exportar
              </Link>
              <button
                type="button"
                onClick={abrirNovo}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Nova conta
              </button>
            </>
          )
        }
      />

      {/* Filtros */}
      <div className="mb-md flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            className="w-full rounded-lg border border-outline-variant bg-surface py-1.5 pl-9 pr-3 font-body-sm text-body-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
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
            className="flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 transition-colors hover:bg-secondary/20"
          >
            <span className="font-label-md text-[11px] text-on-surface-variant">{f.rotulo}:</span>
            <span className="font-label-md text-label-md text-secondary">{f.valor}</span>
            <span className="material-symbols-outlined text-[14px] text-secondary">close</span>
          </button>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-full border border-dashed border-outline-variant px-3 py-1.5 text-on-surface-variant transition-colors hover:bg-surface-container">
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span className="font-label-md text-label-md">Filtro</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
            <p className="px-2 py-1.5 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">
              Status
            </p>
            {STATUS.map((s) => (
              <DropdownMenuItem key={s} onSelect={() => setFiltroStatus(s)}>
                {s}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <p className="px-2 py-1.5 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">
              Categoria
            </p>
            {categoriasDespesa.map((c) => (
              <DropdownMenuItem key={c} onSelect={() => setFiltroCategoria(c)}>
                {c}
              </DropdownMenuItem>
            ))}
            {usaCentroCusto ? (
              <>
                <DropdownMenuSeparator />
                <p className="px-2 py-1.5 font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Centro de custo
                </p>
                {centrosDeCusto.map((c) => (
                  <DropdownMenuItem key={c.id} onSelect={() => setFiltroCentro(c.id)}>
                    {c.codigo} — {c.descricao}
                  </DropdownMenuItem>
                ))}
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="ml-auto font-body-sm text-body-sm text-on-surface-variant">
          {lista.length} de {titulos.length} títulos
        </span>
      </div>

      {/* Tabela */}
      <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    Vencimento
                    <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                  </span>
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                  Fornecedor
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                  Documento
                </th>
                <th className="hidden p-3 font-label-md text-label-md text-on-surface-variant lg:table-cell">
                  Categoria
                </th>
                {usaCentroCusto ? (
                  <th className="hidden p-3 font-label-md text-label-md text-on-surface-variant xl:table-cell">
                    Centro de custo
                  </th>
                ) : null}
                <th className="p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Valor
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Status</th>
                <th className="p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {lista.map((t) => {
                const atrasado = t.status === "Atrasado";
                const cancelado = t.status === "Cancelado";
                return (
                  <tr
                    key={t.id}
                    className={`group transition-colors hover:bg-surface-container-low ${
                      cancelado ? "opacity-55" : ""
                    }`}
                  >
                    <td
                      className={`whitespace-nowrap p-3 font-data-mono ${atrasado ? "font-semibold text-error" : "text-on-surface"}`}
                    >
                      <span className="flex items-center gap-1">
                        {atrasado ? (
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                        ) : null}
                        {t.vencimento}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-primary">
                      <span className={cancelado ? "line-through" : ""}>{t.fornecedor}</span>
                      {t.origem ? (
                        <span className="ml-2 rounded bg-secondary/10 px-1.5 py-0.5 font-label-md text-[10px] text-secondary">
                          {t.origem}
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3 text-on-surface-variant">
                      <span className="font-data-mono">{t.documento}</span>
                      {t.parcela ? (
                        <span className="ml-1 rounded bg-surface-variant px-1 font-data-mono text-[10px] text-outline">
                          ({t.parcela})
                        </span>
                      ) : null}
                      {t.recorrencia ? (
                        <span className="ml-1 rounded bg-primary-fixed px-1 font-label-md text-[10px] text-on-primary-fixed-variant">
                          {t.recorrencia}
                        </span>
                      ) : null}
                    </td>
                    <td className="hidden p-3 text-on-surface-variant lg:table-cell">
                      {t.categoria}
                    </td>
                    {usaCentroCusto ? (
                      <td className="hidden p-3 font-data-mono text-on-surface-variant xl:table-cell">
                        {centroDoTitulo(t)}
                      </td>
                    ) : null}
                    <td className="p-3 text-right font-data-mono text-data-mono">{brl(t.valor)}</td>
                    <td className="p-3">
                      <StatusBadge tone={tomDoStatus(t.status)}>{t.status}</StatusBadge>
                    </td>
                    <td className="p-3 text-right">
                      {leitura ? (
                        <span className="font-body-sm text-body-sm text-outline">—</span>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Editar"
                            disabled={cancelado || t.status === "Pago"}
                            onClick={() => abrirEdicao(t)}
                            className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          {t.status !== "Pago" ? (
                            <Link
                              to="/baixa-pagamento"
                              search={{ titulo: t.id }}
                              title="Dar baixa"
                              className={`rounded p-1 text-on-surface-variant transition-colors hover:bg-secondary/10 hover:text-secondary ${
                                cancelado ? "pointer-events-none opacity-30" : ""
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                check_circle
                              </span>
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            title={
                              t.baixa
                                ? "Não é possível cancelar: título já possui baixa"
                                : "Cancelar título"
                            }
                            disabled={!!t.baixa || cancelado}
                            onClick={() => setCancelando(t)}
                            className="rounded p-1 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <span className="material-symbols-outlined text-[20px]">block</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 ? (
                <tr>
                  <td
                    colSpan={usaCentroCusto ? 8 : 7}
                    className="p-8 text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    Nenhum título encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Rodapé com totais */}
        <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Exibindo {lista.length} de {titulos.length} registros
          </span>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex flex-col text-right">
              <span className="font-body-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Em aberto
              </span>
              <span className="font-data-mono font-bold text-secondary">{brl(totalAberto)}</span>
            </span>
            <span className="hidden h-8 w-px bg-outline-variant sm:block" />
            <span className="flex flex-col text-right">
              <span className="font-body-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Total atrasado
              </span>
              <span className="font-data-mono font-bold text-error">{brl(totalAtrasado)}</span>
            </span>
            <span className="hidden h-8 w-px bg-outline-variant sm:block" />
            <span className="flex flex-col text-right">
              <span className="font-body-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Total da visão
              </span>
              <span className="font-data-mono text-body-lg font-bold text-primary">
                {brl(totalVisao)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Formulário em Sheet */}
      <Sheet open={sheetAberto} onOpenChange={setSheetAberto}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-outline-variant bg-surface-container-lowest sm:max-w-[36rem]"
        >
          <SheetHeader>
            <SheetTitle className="font-headline-sm text-headline-sm text-primary">
              {editando ? `Editar título ${editando.documento}` : "Nova conta a pagar"}
            </SheetTitle>
            <SheetDescription className="font-body-sm text-body-sm text-on-surface-variant">
              {usaAlcada
                ? `Valores acima de ${brl(ALCADA)} são enviados automaticamente à fila de aprovação (PV3).`
                : "Sem alçada configurada, o título é salvo direto como “Em aberto”."}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-lg flex flex-col gap-md">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="f-parceiro">
                  Fornecedor *
                </label>
                <select
                  id="f-parceiro"
                  className={inputCls}
                  value={form.parceiroId}
                  onChange={(e) => setForm((f) => ({ ...f, parceiroId: e.target.value }))}
                >
                  <option value="">Selecione o fornecedor</option>
                  {parceiros
                    .filter((p) => p.ativo && p.tipo !== "Cliente")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.razaoSocial}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="f-doc">
                  Documento *
                </label>
                <input
                  id="f-doc"
                  className={monoCls}
                  placeholder="NF-00000"
                  value={form.documento}
                  onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="f-venc">
                  Vencimento *
                </label>
                <input
                  id="f-venc"
                  className={monoCls}
                  placeholder="dd/mm/aaaa"
                  value={form.vencimento}
                  onChange={(e) => setForm((f) => ({ ...f, vencimento: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="f-valor">
                  Valor *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-data-mono text-on-surface-variant">
                    R$
                  </span>
                  <input
                    id="f-valor"
                    inputMode="decimal"
                    className={`${monoCls} pl-10`}
                    placeholder="0,00"
                    value={form.valor}
                    onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                  />
                </div>
                {usaAlcada && valorNum > ALCADA ? (
                  <p className="mt-1.5 flex items-start gap-1 font-body-sm text-body-sm text-on-tertiary-fixed-variant">
                    <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                    Acima da alçada de {brl(ALCADA)} — irá para a fila de aprovação.
                  </p>
                ) : null}
              </div>

              <div>
                <label className={labelCls} htmlFor="f-cat">
                  Categoria
                </label>
                <select
                  id="f-cat"
                  className={inputCls}
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                >
                  {categoriasDespesa.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="f-parc">
                  Parcelamento
                </label>
                <select
                  id="f-parc"
                  className={inputCls}
                  value={form.parcelas}
                  onChange={(e) => setForm((f) => ({ ...f, parcelas: e.target.value }))}
                >
                  {["1", "2", "3", "6", "12", "24"].map((n) => (
                    <option key={n} value={n}>
                      {n === "1" ? "À vista" : `${n} parcelas mensais`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="f-rec">
                  Recorrência
                </label>
                <select
                  id="f-rec"
                  className={inputCls}
                  value={form.recorrencia}
                  onChange={(e) => setForm((f) => ({ ...f, recorrencia: e.target.value }))}
                >
                  {["Nenhuma", "Mensal", "Bimestral", "Trimestral", "Anual"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {Number(form.parcelas) > 1 && valorNum > 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-primary-fixed-dim bg-primary-fixed/30 p-3">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  event_repeat
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Serão geradas <strong>{form.parcelas} parcelas</strong> de{" "}
                  <strong className="font-data-mono">
                    {brl(valorNum / Number(form.parcelas))}
                  </strong>
                  , a primeira em {form.vencimento || "dd/mm/aaaa"}.
                </p>
              </div>
            ) : null}

            {/* Bloco de rateio — só com a feature centro_custo (PV7) */}
            {usaCentroCusto ? (
              <div className="rounded-lg border border-outline-variant bg-surface p-md">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider text-primary">
                    <span className="material-symbols-outlined text-[18px]">call_split</span>
                    Rateio por centro de custo
                  </h3>
                  <StatusBadge tone={somaRateio === 100 ? "ok" : "erro"}>
                    {somaRateio}% de 100%
                  </StatusBadge>
                </div>

                <div className="flex flex-col gap-2">
                  {form.rateio.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        className={inputCls}
                        value={r.centroId}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            rateio: f.rateio.map((x, idx) =>
                              idx === i ? { ...x, centroId: e.target.value } : x,
                            ),
                          }))
                        }
                      >
                        {centrosDeCusto.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.codigo} — {c.descricao}
                          </option>
                        ))}
                      </select>
                      <div className="relative w-28 shrink-0">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className={`${monoCls} pr-8`}
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
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-data-mono text-on-surface-variant">
                          %
                        </span>
                      </div>
                      <span className="w-24 shrink-0 text-right font-data-mono text-body-sm text-on-surface-variant">
                        {brl((valorNum * (Number(r.percentual) || 0)) / 100)}
                      </span>
                      <button
                        type="button"
                        aria-label="Remover linha de rateio"
                        disabled={form.rateio.length === 1}
                        onClick={() =>
                          setForm((f) => ({ ...f, rateio: f.rateio.filter((_, idx) => idx !== i) }))
                        }
                        className="rounded p-1 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error disabled:opacity-30"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={addLinhaRateio}
                    disabled={form.rateio.length >= centrosDeCusto.length}
                    className="flex items-center gap-1 rounded-lg border border-dashed border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Adicionar centro
                  </button>
                  {somaRateio !== 100 ? (
                    <p className="font-body-sm text-body-sm text-error">
                      O rateio precisa somar exatamente 100% para salvar.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-lg border border-outline-variant bg-surface-container p-3">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  visibility_off
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  O bloco de rateio por centro de custo está oculto porque a feature{" "}
                  <code className="font-data-mono">centro_custo</code> não está contratada neste
                  tenant (PV7).
                </p>
              </div>
            )}

            {editando ? (
              <div className="rounded-lg border border-outline-variant bg-surface p-md">
                <h3 className="mb-2 font-label-md text-label-md uppercase tracking-wider text-primary">
                  Histórico de alterações
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {editando.historico.map((h, i) => (
                    <li key={i} className="flex gap-2 font-body-sm text-body-sm">
                      <span className="shrink-0 font-data-mono text-on-surface-variant">
                        {h.data}
                      </span>
                      <span className="text-on-surface">{h.descricao}</span>
                      <span className="ml-auto shrink-0 text-outline">{h.usuario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-outline-variant pt-md">
              <button
                type="button"
                onClick={() => setSheetAberto(false)}
                className="rounded-lg border border-outline px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!formOk}
                onClick={salvar}
                className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-2 font-label-md text-label-md text-on-secondary shadow-sm transition-colors hover:bg-on-secondary-container disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {editando ? "Salvar alterações" : "Lançar título"}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmação de cancelamento */}
      <Dialog open={!!cancelando} onOpenChange={(o) => !o && setCancelando(null)}>
        <DialogContent className="border-outline-variant bg-surface-container-lowest">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-headline-sm text-headline-sm text-primary">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-error-container/40">
                <span className="material-symbols-outlined text-error">warning</span>
              </span>
              Cancelar título
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              {cancelando
                ? `${cancelando.documento} · ${cancelando.fornecedor} · ${brl(cancelando.valor)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <p className="font-body-md text-body-md text-on-surface-variant">
            O cancelamento é <strong>lógico</strong>: o título permanece na base com status
            “Cancelado” para fins de auditoria e não entra nos totais.
          </p>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setCancelando(null)}
              className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={confirmarCancelamento}
              className="rounded-lg bg-error px-4 py-2 font-label-md text-label-md text-on-error shadow-sm transition-colors hover:bg-error/90"
            >
              Sim, cancelar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
