import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useFeatures, type Regime } from "@/components/app/FeaturesContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { brl, contasPorRegime, planoDeContas } from "@/lib/mock-data";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — FinCore ERP" },
      {
        name: "description",
        content:
          "Configure empresa, plano de contas sugerido por regime e a primeira conta bancária.",
      },
      { property: "og:title", content: "Onboarding — FinCore ERP" },
      {
        property: "og:description",
        content: "Assistente de três passos para inicializar o ambiente do tenant.",
      },
    ],
  }),
  component: OnboardingPage,
});

const REGIMES: Regime[] = ["Simples Nacional", "Lucro Presumido", "Lucro Real"];

const BANCOS = [
  "001 — Banco do Brasil S.A.",
  "033 — Banco Santander (Brasil) S.A.",
  "104 — Caixa Econômica Federal",
  "237 — Banco Bradesco S.A.",
  "341 — Itaú Unibanco S.A.",
];

const PASSOS = ["Empresa", "Plano de contas", "Banco"] as const;

const inputCls =
  "w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md transition-shadow focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary";
const monoCls =
  "w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 font-data-mono text-data-mono transition-shadow focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary";
const labelCls = "mb-2 block font-label-md text-label-md text-on-surface-variant";

function OnboardingPage() {
  const router = useRouter();
  const { config, setRegime } = useFeatures();
  const { registrar } = useAuditoria();
  const { perfil } = usePerfil();
  const { nomeAtual } = useEmpresa();

  const [passo, setPasso] = useState(0);
  const [empresa, setEmpresa] = useState({
    razaoSocial: "",
    cnpj: "",
    regime: config.regime as Regime,
  });
  const [planoAplicado, setPlanoAplicado] = useState(false);
  const [busca, setBusca] = useState("");
  const [banco, setBanco] = useState({ instituicao: "", agencia: "", conta: "" });

  /** PV1: o plano sugerido muda conforme o regime tributário escolhido. */
  const contasSugeridas = useMemo(() => {
    const extras = contasPorRegime[empresa.regime] ?? [];
    return [...planoDeContas.filter((c) => c.nivel <= 2), ...extras].filter((c) =>
      `${c.codigo} ${c.descricao}`.toLowerCase().includes(busca.toLowerCase()),
    );
  }, [empresa.regime, busca]);

  const extrasDoRegime = contasPorRegime[empresa.regime] ?? [];

  const passo1Ok = empresa.razaoSocial.trim().length > 2 && empresa.cnpj.trim().length >= 14;
  const passo3Ok = banco.instituicao !== "" && banco.agencia !== "" && banco.conta !== "";
  const podeAvancar = passo === 0 ? passo1Ok : passo === 1 ? planoAplicado : passo3Ok;

  const avancar = () => {
    if (passo < 2) {
      if (passo === 0) setRegime(empresa.regime);
      setPasso((p) => p + 1);
      return;
    }
    registrar({
      tipo: "feature",
      entidade: "Onboarding",
      operacao: "Concluído",
      detalhe: `Regime ${empresa.regime} · ${contasSugeridas.length} contas aplicadas · banco ${banco.instituicao}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Ambiente configurado", {
      description: "Empresa, plano de contas e conta bancária cadastrados.",
    });
    void router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface font-body-md text-on-surface antialiased">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-center border-b border-outline-variant bg-surface-container-lowest">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded bg-primary text-on-primary">
            <span className="material-symbols-outlined filled text-[20px]">analytics</span>
          </div>
          <span className="font-headline-sm text-headline-sm tracking-tight text-primary">
            FinCore ERP
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-2 font-headline-md text-headline-md text-primary">
            Bem-vindo ao FinCore
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Vamos configurar seu ambiente em poucos passos.
          </p>
        </div>

        {/* Indicador do wizard */}
        <div className="relative mb-8 w-full max-w-2xl">
          <div className="absolute left-[16%] right-[16%] top-5 -z-10 h-[2px] rounded-full bg-outline-variant" />
          <div className="relative z-0 flex justify-between">
            {PASSOS.map((nome, i) => {
              const feito = i < passo;
              const ativo = i === passo;
              return (
                <div key={nome} className="flex flex-col items-center gap-3 bg-surface px-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full font-label-md text-label-md shadow-sm transition-all duration-300 ${
                      feito
                        ? "bg-secondary text-on-secondary"
                        : ativo
                          ? "bg-primary text-on-primary ring-4 ring-primary-fixed"
                          : "border-2 border-outline-variant bg-surface-container-lowest text-on-surface-variant"
                    }`}
                  >
                    {feito ? (
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-center font-label-md text-label-md ${
                      ativo ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {nome}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex min-h-[480px] w-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          {passo === 0 ? (
            <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">Dados da empresa</h2>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                  Informe os dados fiscais básicos para inicializar o sistema.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelCls} htmlFor="razao">
                    Razão social
                  </label>
                  <input
                    id="razao"
                    className={inputCls}
                    placeholder="Ex.: Acme Tecnologia Ltda"
                    value={empresa.razaoSocial}
                    onChange={(e) => setEmpresa((s) => ({ ...s, razaoSocial: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="cnpj">
                    CNPJ
                  </label>
                  <input
                    id="cnpj"
                    className={monoCls}
                    placeholder="00.000.000/0001-00"
                    value={empresa.cnpj}
                    onChange={(e) => setEmpresa((s) => ({ ...s, cnpj: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="regime">
                    Regime tributário <span className="text-secondary">(PV1)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="regime"
                      className={`${inputCls} appearance-none pr-10`}
                      value={empresa.regime}
                      onChange={(e) => {
                        setEmpresa((s) => ({ ...s, regime: e.target.value as Regime }));
                        setPlanoAplicado(false);
                      }}
                    >
                      {REGIMES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-auto flex items-start gap-3 rounded-lg border border-primary-fixed-dim bg-primary-fixed/30 p-4">
                <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  O regime escolhido é o <strong>ponto de variação PV1</strong>: ele define quais
                  contas tributárias entram no plano sugerido no próximo passo.
                </p>
              </div>
            </div>
          ) : null}

          {passo === 1 ? (
            <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="flex flex-wrap items-center gap-2 font-headline-sm text-headline-sm text-primary">
                    Plano de contas
                    <span className="rounded-full bg-secondary-fixed px-2 py-0.5 font-label-md text-[10px] uppercase tracking-wider text-on-secondary-fixed-variant">
                      Recomendado
                    </span>
                  </h2>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                    Sugerimos esta estrutura inicial com base no regime{" "}
                    <strong>{empresa.regime}</strong>
                    {extrasDoRegime.length > 0
                      ? ` — inclui ${extrasDoRegime.length} conta(s) tributária(s) específica(s) deste regime.`
                      : "."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPlanoAplicado(true);
                    toast.success(`${contasSugeridas.length} contas aplicadas ao plano`);
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 font-label-md text-label-md shadow-sm transition-colors ${
                    planoAplicado
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-secondary text-on-secondary hover:bg-on-secondary-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {planoAplicado ? "check_circle" : "account_tree"}
                  </span>
                  {planoAplicado ? "Plano aplicado" : "Aplicar plano sugerido"}
                </button>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface">
                <div className="flex items-center gap-2 border-b border-outline-variant bg-surface-container-low px-4 py-2">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    search
                  </span>
                  <input
                    className="w-full border-none bg-transparent font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline"
                    placeholder="Buscar conta..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <div className="max-h-[300px] flex-1 overflow-y-auto p-2">
                  <div className="flex flex-col gap-0.5">
                    {contasSugeridas.map((c) => {
                      const sintetica = c.tipo === "SINTÉTICA";
                      const doRegime = extrasDoRegime.some((x) => x.codigo === c.codigo);
                      return (
                        <div
                          key={c.codigo}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-variant ${
                            doRegime ? "bg-secondary/5" : ""
                          }`}
                          style={{ paddingLeft: `${8 + c.nivel * 20}px` }}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${sintetica ? "text-secondary" : "text-outline"}`}
                            style={sintetica ? { fontVariationSettings: '"FILL" 1' } : undefined}
                          >
                            {sintetica ? "folder" : "description"}
                          </span>
                          <span className="w-24 shrink-0 font-data-mono text-data-mono text-on-surface-variant">
                            {c.codigo}
                          </span>
                          <span
                            className={
                              sintetica
                                ? "font-label-md text-label-md text-primary"
                                : "font-body-sm text-body-sm text-on-surface"
                            }
                          >
                            {c.descricao}
                          </span>
                          {doRegime ? (
                            <span className="ml-auto shrink-0 rounded-full bg-secondary/10 px-2 py-0.5 font-label-md text-[10px] text-secondary">
                              {empresa.regime}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {passo === 2 ? (
            <div className="flex flex-1 flex-col gap-6 p-6 sm:p-8">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Primeira conta bancária
                </h2>
                <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                  Adicione a conta principal para iniciar a conciliação. O adaptador de arquivo
                  configurado para este tenant é{" "}
                  <strong className="font-data-mono">{config.adaptador}</strong> (PV2).
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="md:col-span-3">
                  <label className={labelCls} htmlFor="inst">
                    Instituição financeira
                  </label>
                  <div className="relative">
                    <select
                      id="inst"
                      className={`${inputCls} appearance-none pr-10`}
                      value={banco.instituicao}
                      onChange={(e) => setBanco((s) => ({ ...s, instituicao: e.target.value }))}
                    >
                      <option value="">Selecione o banco</option>
                      {BANCOS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      account_balance
                    </span>
                  </div>
                </div>
                <div>
                  <label className={labelCls} htmlFor="ag">
                    Agência
                  </label>
                  <input
                    id="ag"
                    className={monoCls}
                    placeholder="0000"
                    value={banco.agencia}
                    onChange={(e) => setBanco((s) => ({ ...s, agencia: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls} htmlFor="cc">
                    Conta com dígito
                  </label>
                  <input
                    id="cc"
                    className={monoCls}
                    placeholder="00000-0"
                    value={banco.conta}
                    onChange={(e) => setBanco((s) => ({ ...s, conta: e.target.value }))}
                  />
                </div>
              </div>

              <div className="mt-auto grid gap-3 rounded-lg border border-outline-variant bg-surface p-4 sm:grid-cols-3">
                <div>
                  <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Empresa
                  </p>
                  <p className="font-body-md text-body-md text-on-surface">
                    {empresa.razaoSocial || "—"}
                  </p>
                </div>
                <div>
                  <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Regime
                  </p>
                  <p className="font-body-md text-body-md text-on-surface">{empresa.regime}</p>
                </div>
                <div>
                  <p className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">
                    Contas no plano
                  </p>
                  <p className="font-data-mono text-data-mono text-on-surface">
                    {contasSugeridas.length} · saldo{" "}
                    {brl(contasSugeridas.reduce((s, c) => s + c.saldo, 0))}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Rodapé do wizard */}
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-5 sm:px-8">
            <button
              type="button"
              disabled={passo === 0}
              onClick={() => setPasso((p) => Math.max(0, p - 1))}
              className="flex items-center gap-1 rounded-lg px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Voltar
            </button>
            <button
              type="button"
              disabled={!podeAvancar}
              onClick={avancar}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
            >
              {passo === 2 ? "Concluir configuração" : "Próximo passo"}
              <span className="material-symbols-outlined text-[18px]">
                {passo === 2 ? "check" : "arrow_forward"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 font-body-sm text-body-sm text-outline">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          Seus dados estão seguros e criptografados.
        </div>
      </main>
    </div>
  );
}
