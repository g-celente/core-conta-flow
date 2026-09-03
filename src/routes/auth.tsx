import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Landmark,
  Lock,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PERFIS, perfilPorEmail, usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso ao sistema — FinCore" },
      {
        name: "description",
        content: "Autenticação corporativa com verificação em duas etapas no FinCore ERP.",
      },
      { property: "og:title", content: "Acesso ao sistema — FinCore" },
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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Formulário */}
      <main className="flex w-full flex-col justify-center overflow-y-auto bg-card px-6 py-12 lg:w-[48%] lg:px-16">
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
                <Landmark className="size-5" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                FinCore ERP
              </span>
            </div>
            <h1 className="text-2xl font-bold sm:text-[1.7rem]">Acesso ao sistema</h1>
            <p className="text-sm text-muted-foreground">
              Insira suas credenciais corporativas para prosseguir.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Etapa 1 */}
            <section
              className={cn(
                "relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-background p-5 shadow-card",
                erro ? "border-destructive/50" : "border-border",
              )}
            >
              {erro ? <div className="absolute inset-y-0 left-0 w-1 bg-destructive" /> : null}
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">1. Credenciais</h2>
                {erro ? (
                  <TriangleAlert className="size-4 text-destructive" />
                ) : (
                  <BadgeCheck className="size-4 text-success" />
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail corporativo</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    className={cn("pl-9", erro && "border-destructive")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErro(null);
                    }}
                  />
                </div>
                {perfilEncontrado ? (
                  <p className="flex items-center gap-1.5 text-xs text-success">
                    <BadgeCheck className="size-3.5" />
                    Perfil reconhecido: {perfilEncontrado.nome} · {perfilEncontrado.usuario}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="senha"
                    type={verSenha ? "text" : "password"}
                    autoComplete="current-password"
                    className={cn("pl-9 pr-9", erro && "border-destructive")}
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setErro(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") entrar();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha((v) => !v)}
                    aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {verSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {erro ? <p className="text-xs font-medium text-destructive">{erro}</p> : null}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEsqueci((v) => !v)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>

              {esqueci ? (
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Enviaremos um link de redefinição para <strong>{email}</strong>. No protótipo
                    nenhum e-mail é disparado.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setEsqueci(false);
                        toast.info("Link de redefinição enviado", {
                          description: `Em um ambiente real, um e-mail seria enviado para ${email}.`,
                        });
                      }}
                    >
                      Enviar link
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEsqueci(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : null}
            </section>

            {/* Etapa 2 */}
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-primary" />
                  2. Verificação em duas etapas
                </h2>
                <label className="flex shrink-0 cursor-pointer items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {mfaAtivo ? "Ativado" : "Opcional"}
                  </span>
                  <Switch checked={mfaAtivo} onCheckedChange={setMfaAtivo} />
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                Insira o código de 6 dígitos gerado pelo seu aplicativo autenticador.
              </p>

              <div className="flex items-center justify-between gap-1.5">
                {codigo.map((d, i) => (
                  <Input
                    key={i}
                    inputMode="numeric"
                    maxLength={1}
                    disabled={!mfaAtivo}
                    value={d}
                    placeholder="·"
                    onChange={(e) => setDigito(i, e.target.value)}
                    className="num h-12 w-full min-w-0 px-0 text-center text-base"
                  />
                ))}
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  O MFA é <strong>obrigatório</strong> para perfis com alçada de aprovação
                  financeira superior a R$ 10.000,00. Neste protótipo qualquer código de 6 dígitos é
                  aceito.
                </span>
              </div>
            </section>

            <div className="flex flex-col gap-2">
              <Button onClick={entrar} className="w-full gap-2 py-5">
                Autenticar acesso
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full py-5"
                onClick={() =>
                  toast.info("Suporte acionado", {
                    description: "Um analista de TI entraria em contato em até 4 horas úteis.",
                  })
                }
              >
                Solicitar suporte TI
              </Button>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            © 2026 FinCore Sistemas. Ambiente seguro.
          </p>
        </div>
      </main>

      {/* Painel lateral */}
      <aside className="relative hidden w-[52%] flex-col justify-center overflow-hidden bg-sidebar px-16 lg:flex xl:px-24">
        <div className="relative z-10 flex max-w-2xl flex-col gap-6">
          <div className="h-1 w-16 rounded-full bg-sidebar-primary" />
          <h2 className="text-3xl font-extrabold leading-tight text-sidebar-accent-foreground xl:text-4xl">
            FinCore: o coração financeiro da sua PME
          </h2>
          <p className="text-base leading-relaxed text-sidebar-foreground/80">
            Gestão unificada, conciliação inteligente e controle absoluto de alçadas. Simplifique
            operações complexas com a segurança que seu negócio exige.
          </p>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-6">
            <KeyRound className="size-6 text-sidebar-primary" />
            <p className="text-lg font-bold text-sidebar-accent-foreground">
              Acessos mock do protótipo
            </p>
            <p className="text-sm text-sidebar-foreground/80">
              Senha única: <code className="num text-sidebar-primary">fincore123</code>. O e-mail
              define o perfil de acesso carregado na sessão.
            </p>
            <ul className="mt-2 flex flex-col divide-y divide-sidebar-border">
              {PERFIS.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(p.email);
                      setSenha(SENHA_MOCK);
                      setErro(null);
                    }}
                    className="min-w-0 text-left"
                  >
                    <span className="num block truncate text-sm text-sidebar-primary underline decoration-dotted">
                      {p.email}
                    </span>
                    <span className="block text-xs text-sidebar-foreground/70">
                      {p.nome} · {p.usuario}
                    </span>
                  </button>
                  <span className="shrink-0 rounded-full bg-sidebar-accent px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-sidebar-accent-foreground">
                    {p.somenteLeitura ? "leitura" : "escrita"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
