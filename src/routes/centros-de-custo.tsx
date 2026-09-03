import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { brl, centrosDeCusto, usuarios, type CentroCusto } from "@/lib/mock-data";

export const Route = createFileRoute("/centros-de-custo")({
  head: () => ({
    meta: [
      { title: "Centros de custo — FinCore ERP" },
      {
        name: "description",
        content: "Cadastre centros de custo com responsável, rateio padrão e total do mês.",
      },
      { property: "og:title", content: "Centros de custo — FinCore ERP" },
      { property: "og:description", content: "Cadastro e acompanhamento de centros de custo." },
    ],
  }),
  component: CentrosDeCusto,
});

const inputCls =
  "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary";
const labelCls = "mb-1.5 block font-label-md text-label-md text-on-surface-variant";

function CentrosDeCusto() {
  const { has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { titulos } = useDados();

  const [lista, setLista] = useState<CentroCusto[]>(centrosDeCusto);
  const [aberto, setAberto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    responsavel: usuarios[0]!,
    rateio: 0,
  });

  if (!has("centro_custo")) {
    return (
      <>
        <PageHeader
          titulo="Centro de custo"
          descricao="Estrutura de custos usada no rateio de títulos."
          variabilidade={[
            {
              o_que: "A tela e o grupo Custos no menu só existem com a feature contratada.",
              por: "feature centro_custo",
              pv: "PV7",
            },
          ]}
        />
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">toggle_off</span>
          <div>
            <p className="font-label-md text-label-md text-primary">
              Centro de custo não contratado
            </p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Ative a feature <code className="font-data-mono">centro_custo</code> em{" "}
              <Link to="/configuracoes" className="text-secondary underline decoration-dotted">
                Features do tenant
              </Link>{" "}
              (PV7) para habilitar o rateio por departamento.
            </p>
          </div>
        </div>
      </>
    );
  }

  /** Valor efetivamente rateado em cada centro, a partir dos títulos da sessão. */
  const lancadoNoCentro = (id: string) =>
    titulos
      .filter((t) => t.status !== "Cancelado")
      .reduce((s, t) => {
        const linha = t.rateio.find((r) => r.centroId === id);
        return s + (linha ? (t.valor * linha.percentual) / 100 : 0);
      }, 0);

  const filtrada = lista.filter((c) =>
    `${c.codigo} ${c.descricao} ${c.responsavel}`.toLowerCase().includes(filtro.toLowerCase()),
  );
  const total = lista.reduce((s, c) => s + lancadoNoCentro(c.id), 0);
  const somaRateioPadrao = lista.reduce((s, c) => s + c.rateio, 0);

  const salvar = () => {
    if (!form.codigo.trim() || !form.descricao.trim()) return;
    setLista((l) => [...l, { id: `cc-${Date.now()}`, ...form, mes: 0 }]);
    registrar({
      tipo: "crud",
      entidade: "Centro de custo",
      operacao: "Criar",
      detalhe: `${form.codigo} — ${form.descricao} (${form.rateio}% padrão)`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    setAberto(false);
    setForm({ codigo: "", descricao: "", responsavel: usuarios[0]!, rateio: 0 });
    toast.success("Centro de custo cadastrado");
  };

  return (
    <>
      <PageHeader
        titulo="Centro de custo"
        descricao="Estrutura de custos usada no rateio de títulos e nos relatórios gerenciais."
        variabilidade={[
          {
            o_que:
              "A tela e o grupo Custos no menu só existem com a feature centro_custo contratada.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "A coluna Lançado no mês é calculada sobre o rateio real dos títulos da sessão.",
            por: "núcleo",
            pv: "núcleo",
          },
          {
            o_que: "O botão Novo centro de custo fica oculto no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <button
              type="button"
              onClick={() => setAberto(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Novo centro de custo
            </button>
          )
        }
      />

      <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex flex-col gap-3 border-b border-outline-variant bg-surface px-md py-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-headline-sm text-headline-sm text-primary">
            {lista.length} centros ·{" "}
            <span className="font-data-mono text-body-lg">{brl(total)}</span> rateados
          </h3>
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              search
            </span>
            <input
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-1.5 pl-9 pr-3 font-body-sm text-body-sm focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              placeholder="Filtrar por código, descrição ou responsável"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="w-32 p-3 font-label-md text-label-md text-on-surface-variant">
                  Código
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                  Descrição
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                  Responsável
                </th>
                <th className="p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Rateio padrão
                </th>
                <th className="p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Lançado no mês
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
              {filtrada.map((c) => {
                const lancado = lancadoNoCentro(c.id);
                return (
                  <tr key={c.id} className="hover:bg-surface-container-low">
                    <td className="p-3 font-data-mono text-data-mono font-semibold text-primary">
                      {c.codigo}
                    </td>
                    <td className="p-3 text-on-surface">{c.descricao}</td>
                    <td className="p-3 text-on-surface-variant">{c.responsavel}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-variant">
                          <div
                            className="h-full rounded-full bg-secondary"
                            style={{ width: `${c.rateio}%` }}
                          />
                        </div>
                        <span className="w-10 font-data-mono text-data-mono text-on-surface">
                          {c.rateio}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-data-mono text-data-mono text-on-surface">
                      {brl(lancado)}
                    </td>
                  </tr>
                );
              })}
              {filtrada.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    Nenhum centro de custo encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-low p-md">
          <StatusBadge tone={somaRateioPadrao === 100 ? "ok" : "atencao"}>
            Rateio padrão soma {somaRateioPadrao}%
          </StatusBadge>
          <Link
            to="/rateio"
            className="flex items-center gap-1.5 font-label-md text-label-md text-secondary underline decoration-dotted"
          >
            <span className="material-symbols-outlined text-[16px]">call_split</span>
            Ratear um título específico
          </Link>
        </div>
      </div>

      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-outline-variant bg-surface-container-lowest sm:max-w-[28rem]"
        >
          <SheetHeader>
            <SheetTitle className="font-headline-sm text-headline-sm text-primary">
              Novo centro de custo
            </SheetTitle>
            <SheetDescription className="font-body-sm text-body-sm text-on-surface-variant">
              O rateio padrão é a sugestão inicial aplicada no formulário de títulos.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-lg flex flex-col gap-4">
            <div>
              <label className={labelCls} htmlFor="cc-cod">
                Código *
              </label>
              <input
                id="cc-cod"
                className={inputCls}
                placeholder="CC-500"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="cc-desc">
                Descrição *
              </label>
              <input
                id="cc-desc"
                className={inputCls}
                placeholder="Ex.: Tecnologia"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="cc-resp">
                Responsável
              </label>
              <select
                id="cc-resp"
                className={inputCls}
                value={form.responsavel}
                onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
              >
                {usuarios.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="cc-rat">
                Rateio padrão (%)
              </label>
              <input
                id="cc-rat"
                type="number"
                min={0}
                max={100}
                className={inputCls}
                value={form.rateio}
                onChange={(e) => setForm((f) => ({ ...f, rateio: Number(e.target.value) }))}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-outline-variant pt-md">
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-lg border border-outline px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!form.codigo.trim() || !form.descricao.trim()}
                onClick={salvar}
                className="rounded-lg bg-secondary px-5 py-2 font-label-md text-label-md text-on-secondary shadow-sm transition-colors hover:bg-on-secondary-container disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
