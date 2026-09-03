import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PERFIS, perfilPorEmail, usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso ao sistema — FinCore ERP" },
      {
        name: "description",
        content: "Autenticação corporativa com verificação em duas etapas no FinCore ERP.",
      },
      { property: "og:title", content: "Acesso ao sistema — FinCore ERP" },
      {
        property: "og:description",
        content: "Entre com as credenciais mock e escolha o perfil de acesso.",
      },
    ],
  }),
  component: AuthPage,
});

const SENHA_MOCK = "fincore123";

function AuthPage() {
  const router = useRouter();
  const { setPerfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();

  const [email, setEmail] = useState("marina@fincore.app");
  const [senha, setSenha] = useState(SENHA_MOCK);
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mfaAtivo, setMfaAtivo] = useState(false);
  const [codigo, setCodigo] = useState<string[]>(["", "", "", "", "", ""]);
  const [esqueci, setEsqueci] = useState(false);

  const perfilEncontrado = perfilPorEmail(email);
  const codigoCompleto = codigo.every((c) => c !== "");

  const setDigito = (i: number, v: string) => {
    const limpo = v.replace(/\D/g, "").slice(-1);
    setCodigo((c) => c.map((x, idx) => (idx === i ? limpo : x)));
  };

  const entrar = () => {
    setErro(null);

    if (!perfilEncontrado) {
      setErro("E-mail não cadastrado. Use um dos acessos mock listados ao lado.");
      return;
    }
    if (senha !== SENHA_MOCK) {
      setErro("Credencial inválida. A senha de todos os acessos mock é fincore123.");
      return;
    }
    if (mfaAtivo && !codigoCompleto) {
      setErro("Informe os 6 dígitos do aplicativo autenticador.");
      return;
    }

    setPerfil(perfilEncontrado.id);
    registrar({
      tipo: "acesso",
      entidade: "Sessão",
      operacao: "Login",
      detalhe: `${perfilEncontrado.usuario} autenticado como ${perfilEncontrado.nome}${
        mfaAtivo ? " (com MFA)" : ""
      }`,
      usuario: perfilEncontrado.usuario,
      empresa: nomeAtual,
    });
    toast.success(`Bem-vindo, ${perfilEncontrado.usuario}`, {
      description: `Perfil ativo: ${perfilEncontrado.nome}`,
    });
    void router.navigate({ to: "/" });
  };

  const recuperar = () => {
    setEsqueci(false);
    toast.info("Link de redefinição enviado", {
      description: `Em um ambiente real, um e-mail seria enviado para ${email}.`,
    });
  };

  const inputBase =
    "w-full rounded-lg border bg-surface-container-lowest py-2.5 pl-10 font-body-md text-on-surface transition-all focus:outline-none focus:ring-2";

  return (
    <div className="flex min-h-screen bg-background font-body-md text-on-background antialiased">
      {/* Formulário */}
      <main className="relative z-10 flex w-full flex-col items-center justify-center overflow-y-auto bg-surface-container-lowest px-6 py-12 lg:w-[48%] lg:px-16">
        <div className="flex w-full max-w-[28rem] flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="mb-4 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined filled text-[32px]">account_balance</span>
              <span className="font-headline-md text-headline-md font-bold">FinCore ERP</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary">Acesso ao sistema</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Insira suas credenciais corporativas para prosseguir.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Etapa 1: credenciais */}
            <div
              className={`relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-surface p-6 shadow-sm ${
                erro ? "border-error" : "border-outline-variant"
              }`}
            >
              {erro ? <div className="absolute left-0 top-0 h-full w-1 bg-error" /> : null}
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-label-md text-label-md text-on-surface">1. Credenciais</h2>
                <span
                  className={`material-symbols-outlined text-[20px] ${erro ? "text-error" : "text-secondary"}`}
                >
                  {erro ? "error" : "badge"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="font-label-md text-label-md text-on-surface-variant"
                >
                  E-mail corporativo
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErro(null);
                    }}
                    className={`${inputBase} pr-4 ${
                      erro
                        ? "border-error focus:ring-error/20"
                        : "border-outline-variant focus:border-secondary focus:ring-secondary/20"
                    }`}
                  />
                </div>
                {perfilEncontrado ? (
                  <p className="mt-0.5 flex items-center gap-1 font-body-sm text-body-sm text-secondary">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Perfil reconhecido: {perfilEncontrado.nome} · {perfilEncontrado.usuario}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="senha"
                  className="font-label-md text-label-md text-on-surface-variant"
                >
                  Senha
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                    lock
                  </span>
                  <input
                    id="senha"
                    type={verSenha ? "text" : "password"}
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setErro(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") entrar();
                    }}
                    className={`${inputBase} pr-10 ${
                      erro
                        ? "border-error focus:ring-error/20"
                        : "border-outline-variant focus:border-secondary focus:ring-secondary/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha((v) => !v)}
                    aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                    className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  >
                    {verSenha ? "visibility" : "visibility_off"}
                  </button>
                </div>
                {erro ? (
                  <p className="mt-1 font-body-sm text-body-sm font-medium text-error">{erro}</p>
                ) : null}
              </div>

              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setEsqueci((v) => !v)}
                  className="font-label-md text-label-md text-secondary transition-colors hover:text-on-secondary-container"
                >
                  Esqueci minha senha
                </button>
              </div>

              {esqueci ? (
                <div className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container p-3">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Enviaremos um link de redefinição para <strong>{email}</strong>. No protótipo
                    nenhum e-mail é disparado.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={recuperar}
                      className="rounded-lg bg-secondary px-3 py-1.5 font-label-md text-label-md text-on-secondary"
                    >
                      Enviar link
                    </button>
                    <button
                      type="button"
                      onClick={() => setEsqueci(false)}
                      className="rounded-lg border border-outline px-3 py-1.5 font-label-md text-label-md text-on-surface"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Etapa 2: MFA opcional */}
            <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="font-label-md text-label-md text-on-surface">
                  2. Verificação em duas etapas
                </h2>
                <label className="flex shrink-0 cursor-pointer items-center gap-2">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {mfaAtivo ? "Ativado" : "Opcional"}
                  </span>
                  <span className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={mfaAtivo}
                      onChange={(e) => setMfaAtivo(e.target.checked)}
                    />
                    <span className="h-6 w-11 rounded-full bg-surface-variant transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-outline-variant after:bg-white after:transition-all after:content-[''] peer-checked:bg-secondary peer-checked:after:translate-x-full" />
                  </span>
                </label>
              </div>

              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Insira o código de 6 dígitos gerado pelo seu aplicativo autenticador.
              </p>

              <div className="flex items-center justify-between gap-1.5">
                {codigo.map((d, i) => (
                  <input
                    key={i}
                    inputMode="numeric"
                    maxLength={1}
                    disabled={!mfaAtivo}
                    value={d}
                    placeholder="·"
                    onChange={(e) => setDigito(i, e.target.value)}
                    className="h-14 w-full min-w-0 rounded-lg border border-outline bg-surface text-center font-data-mono text-headline-sm text-on-surface transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20 disabled:bg-surface-container disabled:text-outline"
                  />
                ))}
              </div>

              <div className="mt-2 flex items-start gap-2 rounded-lg bg-surface-container p-3">
                <span className="material-symbols-outlined mt-0.5 text-[18px] text-on-surface-variant">
                  info
                </span>
                <span className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                  O MFA é <strong>obrigatório</strong> para perfis com alçada de aprovação
                  financeira superior a R$ 10.000,00. Neste protótipo qualquer código de 6 dígitos é
                  aceito.
                </span>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-3">
              <button
                type="button"
                onClick={entrar}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-label-md text-label-md text-on-primary shadow-sm transition-all hover:bg-primary-container"
              >
                Autenticar acesso
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  toast.info("Suporte acionado", {
                    description: "Um analista de TI entraria em contato em até 4 horas úteis.",
                  })
                }
                className="w-full rounded-lg border border-outline bg-transparent py-3.5 font-label-md text-label-md text-on-surface transition-all hover:bg-surface-variant"
              >
                Solicitar suporte TI
              </button>
            </div>
          </div>

          <p className="text-center font-body-sm text-body-sm text-outline">
            © 2026 FinCore Sistemas. Ambiente seguro.
          </p>
        </div>
      </main>

      {/* Painel de valor + acessos mock */}
      <aside className="relative hidden w-[52%] flex-col justify-center overflow-hidden bg-primary-container px-16 lg:flex xl:px-24">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />
        <div className="relative z-10 flex max-w-2xl flex-col gap-8">
          <div className="mb-2 h-1 w-16 rounded-full bg-secondary" />
          <h2 className="font-display-lg text-display-lg leading-tight text-on-primary">
            FinCore: o coração financeiro da sua PME
          </h2>
          <p className="font-body-lg text-body-lg leading-relaxed text-inverse-primary">
            Gestão unificada, conciliação inteligente e controle absoluto de alçadas. Simplifique
            operações complexas com a segurança que seu negócio exige.
          </p>

          <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 bg-surface/5 p-6 backdrop-blur-md">
            <div className="absolute -right-12 -top-12 size-32 rounded-full bg-secondary/20 blur-3xl" />
            <span className="material-symbols-outlined text-[28px] text-secondary-fixed">key</span>
            <p className="font-headline-sm text-headline-sm text-secondary-fixed">
              Acessos mock do protótipo
            </p>
            <p className="font-body-sm text-body-sm text-inverse-primary">
              Senha única: <code className="font-data-mono text-secondary-fixed">fincore123</code>.
              O e-mail define o perfil de acesso carregado na sessão.
            </p>
            <ul className="mt-2 flex flex-col divide-y divide-white/10">
              {PERFIS.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(p.email);
                      setSenha(SENHA_MOCK);
                      setErro(null);
                    }}
                    className="min-w-0 text-left"
                  >
                    <span className="block truncate font-data-mono text-body-sm text-secondary-fixed underline decoration-dotted">
                      {p.email}
                    </span>
                    <span className="block font-body-sm text-body-sm text-inverse-primary">
                      {p.nome} · {p.usuario}
                    </span>
                  </button>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 font-label-md text-[10px] uppercase tracking-wider text-secondary-fixed">
                    {p.somenteLeitura ? "leitura" : "escrita"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 z-0 size-96 translate-x-1/3 translate-y-1/3 rounded-tl-full bg-primary opacity-50 blur-2xl" />
      </aside>
    </div>
  );
}
