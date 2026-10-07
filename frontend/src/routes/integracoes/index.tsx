import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Ban, Eye, EyeOff, FlaskConical, KeyRound, Link2, Sliders, ToggleLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/integracoes/")({
  head: () => ({
    meta: [
      { title: "Central de integrações — FinCore" },
      {
        name: "description",
        content: "Tokens de API, ambiente de sandbox e webhooks para integrar sistemas externos.",
      },
      { property: "og:title", content: "Central de integrações — FinCore" },
      { property: "og:description", content: "Gestão de credenciais da API pública do FinCore." },
    ],
  }),
  component: Integracoes,
});

type Token = {
  id: string;
  nome: string;
  ambiente: "Produção" | "Sandbox";
  escopo: string;
  chave: string;
  criadoEm: string;
  ativo: boolean;
};

const tokensIniciais: Token[] = [
  {
    id: "tk-1",
    nome: "ERP de vendas — leitura de títulos",
    ambiente: "Produção",
    escopo: "titulos:read parceiros:read",
    chave: "fc_live_8f2a41c7d90b4e6ab1c3",
    criadoEm: "12/03/2026",
    ativo: true,
  },
  {
    id: "tk-2",
    nome: "Integração contábil — balancetes",
    ambiente: "Produção",
    escopo: "plano:read relatorios:read",
    chave: "fc_live_3d70b8e5a2f14c9d6072",
    criadoEm: "28/04/2026",
    ativo: true,
  },
  {
    id: "tk-3",
    nome: "Testes do time de integração",
    ambiente: "Sandbox",
    escopo: "titulos:write parceiros:write",
    chave: "fc_test_5b1e93a7c4d02f8e6135",
    criadoEm: "05/06/2026",
    ativo: false,
  },
];

const ENDPOINTS = [
  { metodo: "GET", rota: "/v1/titulos", descricao: "Lista títulos a pagar e a receber" },
  { metodo: "POST", rota: "/v1/titulos", descricao: "Lança um novo título a pagar" },
  { metodo: "GET", rota: "/v1/parceiros", descricao: "Lista clientes e fornecedores" },
  { metodo: "POST", rota: "/v1/parceiros", descricao: "Cadastra um parceiro" },
  { metodo: "GET", rota: "/v1/plano-de-contas", descricao: "Retorna a árvore contábil" },
  { metodo: "POST", rota: "/v1/webhooks", descricao: "Registra um webhook de eventos" },
];

function Integracoes() {
  const { has, config } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();

  const [tokens, setTokens] = useState(tokensIniciais);
  const [revelados, setRevelados] = useState<string[]>([]);

  if (!has("api_publica")) {
    return (
      <>
        <PageHeader
          titulo="Central de integrações"
          descricao="Tokens de API e ambiente de sandbox."
          variabilidade={[
            {
              o_que: "A tela e o item no menu só existem quando a API pública está contratada.",
              por: "feature api_publica",
              pv: "PV7",
            },
          ]}
        />
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 pt-6">
            <ToggleLeft className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">API pública não contratada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                A central de integrações faz parte do perfil <strong>Corporativo</strong>. Ative a
                feature <code className="num">api_publica</code> em{" "}
                <Link to="/configuracoes" className="text-primary underline decoration-dotted">
                  Features do tenant
                </Link>{" "}
                (PV7).
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const gerar = (ambiente: Token["ambiente"]) => {
    const sufixo = Math.abs(
      Array.from(`${ambiente}${tokens.length}${perfil.usuario}`).reduce(
        (a, c) => a * 31 + c.charCodeAt(0),
        7,
      ),
    )
      .toString(16)
      .padStart(20, "0")
      .slice(0, 20);
    const novo: Token = {
      id: `tk-${tokens.length + 1}`,
      nome: `Token gerado por ${perfil.usuario}`,
      ambiente,
      escopo: ambiente === "Sandbox" ? "titulos:write parceiros:write" : "titulos:read",
      chave: `${ambiente === "Sandbox" ? "fc_test_" : "fc_live_"}${sufixo}`,
      criadoEm: new Date().toLocaleDateString("pt-BR"),
      ativo: true,
    };
    setTokens((l) => [novo, ...l]);
    setRevelados((r) => [...r, novo.id]);
    registrar({
      tipo: "feature",
      entidade: "Token de API",
      operacao: "Gerar",
      detalhe: `${novo.nome} · ambiente ${ambiente} · escopo ${novo.escopo}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success(`Token de ${ambiente} gerado`, {
      description: "Copie agora — a chave completa não é exibida novamente após sair da tela.",
    });
  };

  const revogar = (t: Token) => {
    setTokens((l) => l.map((x) => (x.id === t.id ? { ...x, ativo: false } : x)));
    registrar({
      tipo: "feature",
      entidade: "Token de API",
      operacao: "Revogar",
      detalhe: `${t.nome} (${t.chave.slice(0, 12)}…) revogado`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.warning("Token revogado", {
      description: "Chamadas com esta chave passam a retornar 401.",
    });
  };

  return (
    <>
      <PageHeader
        titulo="Central de integrações"
        descricao={`API REST v1 · tenant ${nomeAtual} · perfil de produto ${config.perfilProduto}.`}
        variabilidade={[
          {
            o_que:
              "A tela e o item Central de integrações no menu só existem com api_publica ativa.",
            por: "feature api_publica",
            pv: "PV7",
          },
          {
            o_que:
              "Os escopos oferecidos refletem as features contratadas: sem centro de custo não há escopo de rateio.",
            por: "features do tenant",
            pv: "PV7",
          },
          {
            o_que: "Gerar e revogar tokens fica indisponível no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <>
              <Button variant="outline" className="gap-1.5" onClick={() => gerar("Sandbox")}>
                <FlaskConical className="size-4" /> Token de sandbox
              </Button>
              <Button className="gap-1.5" onClick={() => gerar("Produção")}>
                <KeyRound className="size-4" /> Novo token
              </Button>
            </>
          )
        }
      />

      <Card className="mb-6 shadow-card">
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Link2 className="size-4 shrink-0 text-primary" />
          <p className="flex-1 text-sm text-muted-foreground">
            Base da API:{" "}
            <code className="num rounded bg-muted px-1.5 py-0.5">https://api.fincore.app/v1</code> ·
            autenticação por header{" "}
            <code className="num rounded bg-muted px-1.5 py-0.5">
              Authorization: Bearer &lt;token&gt;
            </code>
          </p>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/integracoes/adaptador">
              <Sliders className="size-3.5" /> Adaptador bancário: {config.adaptador}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Tokens de acesso</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[48rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-28">Ambiente</TableHead>
                <TableHead>Chave</TableHead>
                <TableHead className="w-28 text-center">Status</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((t) => {
                const visivel = revelados.includes(t.id);
                return (
                  <TableRow key={t.id} className={cn(!t.ativo && "opacity-55")}>
                    <TableCell>
                      <span className="block text-sm font-medium">{t.nome}</span>
                      <span className="num block text-[0.7rem] text-muted-foreground">
                        {t.escopo} · criado em {t.criadoEm}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={t.ambiente === "Sandbox" ? "warning" : "info"}>
                        {t.ambiente}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <code className="num text-sm">
                          {visivel ? t.chave : `${t.chave.slice(0, 12)}${"•".repeat(8)}`}
                        </code>
                        <button
                          type="button"
                          aria-label={visivel ? "Ocultar chave" : "Revelar chave"}
                          onClick={() =>
                            setRevelados((r) =>
                              r.includes(t.id) ? r.filter((x) => x !== t.id) : [...r, t.id],
                            )
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {visivel ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge tone={t.ativo ? "success" : "neutral"}>
                        {t.ativo ? "Ativo" : "Revogado"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {leitura || !t.ativo ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Revogar token"
                          className="hover:text-destructive"
                          onClick={() => revogar(t)}
                        >
                          <Ban className="size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Endpoints disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {ENDPOINTS.map((e) => (
            <div key={e.rota + e.metodo} className="flex flex-wrap items-center gap-3 px-6 py-3">
              <StatusBadge
                tone={e.metodo === "GET" ? "success" : "info"}
                className="w-16 justify-center"
              >
                {e.metodo}
              </StatusBadge>
              <code className="num text-sm font-medium">{e.rota}</code>
              <span className="text-xs text-muted-foreground">{e.descricao}</span>
            </div>
          ))}
          {has("centro_custo") ? (
            <div className="flex flex-wrap items-center gap-3 bg-primary/5 px-6 py-3">
              <StatusBadge tone="success" className="w-16 justify-center">
                GET
              </StatusBadge>
              <code className="num text-sm font-medium">/v1/rateios</code>
              <span className="text-xs text-muted-foreground">
                Rateio por centro de custo — disponível porque{" "}
                <code className="num">centro_custo</code> está ativo (PV7)
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
