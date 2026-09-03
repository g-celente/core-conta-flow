import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados, type NovoParceiro } from "@/components/app/DadosContext";
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
import { baseCnpj, brl, cnpjSugeridos, type Parceiro, type TipoParceiro } from "@/lib/mock-data";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Clientes e fornecedores — FinCore ERP" },
      {
        name: "description",
        content: "Cadastro de clientes e fornecedores com histórico de alterações e inativação.",
      },
      { property: "og:title", content: "Clientes e fornecedores — FinCore ERP" },
      {
        property: "og:description",
        content: "Criar, listar, editar e inativar parceiros com validação de títulos em aberto.",
      },
    ],
  }),
  component: Parceiros,
});

const TIPOS: TipoParceiro[] = ["Cliente", "Fornecedor", "Ambos"];

const inputCls =
  "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary";
const monoCls =
  "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-data-mono text-data-mono focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary";
const labelCls = "mb-1.5 block font-label-md text-label-md text-on-surface-variant";

const iconePorTipo: Record<TipoParceiro, string> = {
  Cliente: "person",
  Fornecedor: "store",
  Ambos: "swap_horiz",
};

const corPorTipo: Record<TipoParceiro, string> = {
  Cliente: "bg-primary-fixed/40 text-on-primary-fixed-variant",
  Fornecedor: "bg-surface-container text-surface-tint",
  Ambos: "bg-tertiary-fixed/50 text-on-tertiary-fixed-variant",
};

const formVazio = (): NovoParceiro => ({
  documento: "",
  razaoSocial: "",
  nomeFantasia: "",
  tipo: "Fornecedor",
  email: "",
  telefone: "",
  cidade: "",
  uf: "",
});

function Parceiros() {
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const {
    parceiros,
    criarParceiro,
    editarParceiro,
    inativarParceiro,
    reativarParceiro,
    emAbertoDoParceiro,
  } = useDados();

  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<"Ambos" | "Clientes" | "Fornecedores">("Ambos");
  const [soAtivos, setSoAtivos] = useState(false);

  const [sheetAberto, setSheetAberto] = useState(false);
  const [editando, setEditando] = useState<Parceiro | null>(null);
  const [form, setForm] = useState<NovoParceiro>(formVazio());
  const [cnpjBuscado, setCnpjBuscado] = useState<string | null>(null);
  const [inativando, setInativando] = useState<Parceiro | null>(null);

  const lista = useMemo(
    () =>
      parceiros.filter((p) => {
        if (
          busca &&
          !`${p.razaoSocial} ${p.nomeFantasia} ${p.documento} ${p.cidade}`
            .toLowerCase()
            .includes(busca.toLowerCase())
        )
          return false;
        if (aba === "Clientes" && p.tipo === "Fornecedor") return false;
        if (aba === "Fornecedores" && p.tipo === "Cliente") return false;
        if (soAtivos && !p.ativo) return false;
        return true;
      }),
    [parceiros, busca, aba, soAtivos],
  );

  const totalEmAberto = lista.reduce((s, p) => s + emAbertoDoParceiro(p.id), 0);

  const abrirNovo = () => {
    setEditando(null);
    setForm(formVazio());
    setCnpjBuscado(null);
    setSheetAberto(true);
  };

  const abrirEdicao = (p: Parceiro) => {
    setEditando(p);
    setForm({
      documento: p.documento,
      razaoSocial: p.razaoSocial,
      nomeFantasia: p.nomeFantasia,
      tipo: p.tipo,
      email: p.email,
      telefone: p.telefone,
      cidade: p.cidade,
      uf: p.uf,
    });
    setCnpjBuscado(null);
    setSheetAberto(true);
  };

  /** Ao informar o CNPJ, a razão social é preenchida a partir da base mock. */
  const consultarCnpj = (doc: string) => {
    const achado = baseCnpj[doc.trim()];
    if (!achado) {
      setCnpjBuscado(null);
      toast.error("CNPJ não encontrado na base", {
        description: "Use um dos CNPJs sugeridos ou preencha os dados manualmente.",
      });
      return;
    }
    setForm((f) => ({ ...f, ...achado }));
    setCnpjBuscado(doc.trim());
    toast.success("Dados preenchidos pelo CNPJ", { description: achado.razaoSocial });
  };

  const formOk =
    form.documento.trim() !== "" && form.razaoSocial.trim().length > 2 && form.email.includes("@");

  const salvar = () => {
    if (!formOk) return;
    if (editando) {
      editarParceiro(editando.id, form, perfil.usuario);
      registrar({
        tipo: "crud",
        entidade: "Parceiro",
        operacao: "Editar",
        detalhe: `${form.razaoSocial} (${form.documento})`,
        usuario: perfil.usuario,
        empresa: nomeAtual,
      });
      toast.success("Cadastro atualizado", {
        description: "A alteração foi registrada no histórico do parceiro.",
      });
    } else {
      criarParceiro(form, perfil.usuario);
      registrar({
        tipo: "crud",
        entidade: "Parceiro",
        operacao: "Criar",
        detalhe: `${form.razaoSocial} (${form.documento}) como ${form.tipo}`,
        usuario: perfil.usuario,
        empresa: nomeAtual,
      });
      toast.success("Parceiro cadastrado");
    }
    setSheetAberto(false);
  };

  const confirmarInativacao = () => {
    if (!inativando) return;
    const alvo = inativando;
    inativarParceiro(alvo.id, perfil.usuario);
    registrar({
      tipo: "crud",
      entidade: "Parceiro",
      operacao: "Inativar",
      detalhe: `${alvo.razaoSocial} inativado`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    setInativando(null);
    toast.success(`${alvo.nomeFantasia} foi inativado`, {
      duration: 10000,
      description: "Você tem 10 segundos para desfazer esta ação.",
      action: {
        label: "Desfazer",
        onClick: () => {
          reativarParceiro(alvo.id, perfil.usuario);
          registrar({
            tipo: "crud",
            entidade: "Parceiro",
            operacao: "Desfazer inativação",
            detalhe: `${alvo.razaoSocial} reativado`,
            usuario: perfil.usuario,
            empresa: nomeAtual,
          });
          toast.info("Inativação desfeita");
        },
      },
    });
  };

  const bloqueio = inativando ? emAbertoDoParceiro(inativando.id) : 0;

  return (
    <>
      <PageHeader
        titulo="Clientes e fornecedores"
        descricao="Gerencie os cadastros e acompanhe os totais em aberto."
        variabilidade={[
          {
            o_que: "Botões Novo cadastro, Editar e Inativar desaparecem no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
          {
            o_que: "A coluna Total em aberto é calculada sobre os títulos do tenant selecionado.",
            por: "seletor de empresa · feature multiempresa",
            pv: "PV7",
          },
          {
            o_que: "A inativação é bloqueada quando o parceiro possui títulos em aberto.",
            por: "regra de negócio do núcleo",
            pv: "núcleo",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <button
              type="button"
              onClick={abrirNovo}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Novo cadastro
            </button>
          )
        }
      />

      {/* Filtros */}
      <div className="mb-md flex flex-col items-center justify-between gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm lg:flex-row">
        <div className="relative w-full lg:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
            search
          </span>
          <input
            className="w-full rounded-lg border border-outline-variant bg-surface py-2 pl-10 pr-4 font-body-md text-body-md text-on-surface transition-all placeholder:text-outline/70 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            placeholder="Buscar por nome, documento ou cidade..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <div className="flex w-full rounded-lg bg-surface-container p-1 sm:w-auto">
            {(["Ambos", "Clientes", "Fornecedores"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAba(t)}
                className={`flex-1 rounded-md px-4 py-1.5 font-label-md text-label-md transition-all sm:flex-none sm:px-6 ${
                  aba === t
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap font-label-md text-label-md text-on-surface-variant">
            <input
              type="checkbox"
              checked={soAtivos}
              onChange={(e) => setSoAtivos(e.target.checked)}
              className="size-4 rounded-sm accent-[var(--color-secondary)]"
            />
            Só ativos
          </label>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse whitespace-nowrap text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="w-48 px-4 py-3 font-label-md text-label-md text-on-surface-variant">
                  Documento
                </th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">
                  Nome fantasia
                </th>
                <th className="px-4 py-3 font-label-md text-label-md text-on-surface-variant">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Total em aberto
                </th>
                <th className="px-4 py-3 text-center font-label-md text-label-md text-on-surface-variant">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {lista.map((p) => {
                const aberto = emAbertoDoParceiro(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-surface-container-low/50 ${
                      p.ativo ? "" : "bg-surface-container-low/30"
                    }`}
                  >
                    <td
                      className={`px-4 py-3 font-data-mono text-data-mono ${p.ativo ? "text-on-surface" : "text-outline"}`}
                    >
                      {p.documento}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`block font-body-md text-body-md font-medium ${p.ativo ? "text-primary" : "text-outline"}`}
                      >
                        {p.nomeFantasia}
                      </span>
                      <span className="block max-w-[22rem] truncate font-body-sm text-body-sm text-on-surface-variant">
                        {p.razaoSocial} · {p.cidade}/{p.uf}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-label-md text-body-sm ${corPorTipo[p.tipo]} ${p.ativo ? "" : "opacity-60"}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {iconePorTipo[p.tipo]}
                        </span>
                        {p.tipo}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-data-mono text-data-mono font-medium ${
                        aberto > 0 ? "text-error" : "text-outline"
                      }`}
                    >
                      {brl(aberto)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {p.ativo ? (
                        aberto > 0 ? (
                          <StatusBadge tone="erro">Com pendência</StatusBadge>
                        ) : (
                          <StatusBadge tone="ok">Ativo</StatusBadge>
                        )
                      ) : (
                        <StatusBadge tone="neutro">Inativo</StatusBadge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {leitura ? (
                        <span className="font-body-sm text-body-sm text-outline">—</span>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Editar"
                            onClick={() => abrirEdicao(p)}
                            className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          {p.ativo ? (
                            <button
                              type="button"
                              title="Inativar"
                              onClick={() => setInativando(p)}
                              className="rounded p-1 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                            >
                              <span className="material-symbols-outlined text-[20px]">block</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Reativar"
                              onClick={() => {
                                reativarParceiro(p.id, perfil.usuario);
                                registrar({
                                  tipo: "crud",
                                  entidade: "Parceiro",
                                  operacao: "Reativar",
                                  detalhe: `${p.razaoSocial} reativado`,
                                  usuario: perfil.usuario,
                                  empresa: nomeAtual,
                                });
                                toast.success(`${p.nomeFantasia} reativado`);
                              }}
                              className="rounded p-1 text-on-surface-variant transition-colors hover:bg-secondary/10 hover:text-secondary"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                restart_alt
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center font-body-md text-body-md text-on-surface-variant"
                  >
                    Nenhum cadastro encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-low p-3">
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Mostrando {lista.length} de {parceiros.length} registros
          </span>
          <span className="flex flex-col text-right">
            <span className="font-body-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
              Total em aberto na visão
            </span>
            <span className="font-data-mono font-bold text-primary">{brl(totalEmAberto)}</span>
          </span>
        </div>
      </div>

      {/* Formulário */}
      <Sheet open={sheetAberto} onOpenChange={setSheetAberto}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-outline-variant bg-surface-container-lowest sm:max-w-[36rem]"
        >
          <SheetHeader>
            <SheetTitle className="font-headline-sm text-headline-sm text-primary">
              {editando ? `Editar ${editando.nomeFantasia}` : "Novo cadastro"}
            </SheetTitle>
            <SheetDescription className="font-body-sm text-body-sm text-on-surface-variant">
              Informe o CNPJ e use “Buscar” para preencher a razão social automaticamente.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-lg flex flex-col gap-md">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="p-doc">
                  CNPJ / CPF *
                </label>
                <div className="flex gap-2">
                  <input
                    id="p-doc"
                    className={monoCls}
                    placeholder="00.000.000/0001-00"
                    value={form.documento}
                    onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => consultarCnpj(form.documento)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-4 py-2 font-label-md text-label-md text-on-secondary transition-colors hover:bg-on-secondary-container"
                  >
                    <span className="material-symbols-outlined text-[18px]">travel_explore</span>
                    Buscar
                  </button>
                </div>
                {cnpjBuscado ? (
                  <p className="mt-1.5 flex items-center gap-1 font-body-sm text-body-sm text-secondary">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Dados preenchidos a partir da base cadastral.
                  </p>
                ) : (
                  <p className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
                    CNPJs disponíveis na base mock:{" "}
                    {cnpjSugeridos.map((c, i) => (
                      <span key={c}>
                        {i > 0 ? ", " : ""}
                        <button
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, documento: c }));
                            consultarCnpj(c);
                          }}
                          className="font-data-mono text-secondary underline decoration-dotted"
                        >
                          {c}
                        </button>
                      </span>
                    ))}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="p-razao">
                  Razão social *
                </label>
                <input
                  id="p-razao"
                  className={inputCls}
                  value={form.razaoSocial}
                  onChange={(e) => setForm((f) => ({ ...f, razaoSocial: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="p-fantasia">
                  Nome fantasia
                </label>
                <input
                  id="p-fantasia"
                  className={inputCls}
                  value={form.nomeFantasia}
                  onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="p-tipo">
                  Tipo
                </label>
                <select
                  id="p-tipo"
                  className={inputCls}
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoParceiro }))}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="p-email">
                  E-mail *
                </label>
                <input
                  id="p-email"
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="p-tel">
                  Telefone
                </label>
                <input
                  id="p-tel"
                  className={monoCls}
                  placeholder="(00) 0000-0000"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="p-cidade">
                  Cidade
                </label>
                <input
                  id="p-cidade"
                  className={inputCls}
                  value={form.cidade}
                  onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="p-uf">
                  UF
                </label>
                <input
                  id="p-uf"
                  maxLength={2}
                  className={monoCls}
                  value={form.uf}
                  onChange={(e) => setForm((f) => ({ ...f, uf: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>

            {editando ? (
              <div className="rounded-lg border border-outline-variant bg-surface p-md">
                <h3 className="mb-2 flex items-center gap-2 font-label-md text-label-md uppercase tracking-wider text-primary">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Histórico de alterações
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {editando.historico.map((h, i) => (
                    <li key={i} className="flex flex-wrap gap-2 font-body-sm text-body-sm">
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
                {editando ? "Salvar alterações" : "Cadastrar"}
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmação de inativação */}
      <Dialog open={!!inativando} onOpenChange={(o) => !o && setInativando(null)}>
        <DialogContent className="border-outline-variant bg-surface-container-lowest">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-headline-sm text-headline-sm text-primary">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-error-container/40">
                <span className="material-symbols-outlined text-error">warning</span>
              </span>
              Inativar cadastro
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              Você está prestes a inativar{" "}
              <strong className="text-primary">{inativando?.razaoSocial}</strong>.
            </DialogDescription>
          </DialogHeader>

          {bloqueio > 0 ? (
            <div className="flex gap-3 rounded-lg border border-error/30 bg-error-container/20 p-4">
              <span className="material-symbols-outlined text-[20px] text-error">block</span>
              <div>
                <p className="font-label-md text-label-md text-error">
                  Inativação bloqueada — títulos em aberto
                </p>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                  Este parceiro possui{" "}
                  <strong className="font-data-mono text-error">{brl(bloqueio)}</strong> em títulos
                  não liquidados. Liquide ou cancele os títulos antes de inativar o cadastro.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 rounded-lg border border-outline-variant bg-surface p-4">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                info
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                O cadastro deixa de aparecer nos formulários de lançamento, mas continua visível na
                listagem. Você poderá desfazer a ação por 10 segundos.
              </p>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setInativando(null)}
              className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={bloqueio > 0}
              onClick={confirmarInativacao}
              className="rounded-lg bg-error px-4 py-2 font-label-md text-label-md text-on-error shadow-sm transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sim, inativar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
