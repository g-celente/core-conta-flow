import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";

export const Route = createFileRoute("/integracoes/")({
  head: () => ({
    meta: [
      { title: "Central de integrações — FinCore ERP" },
      {
        name: "description",
        content: "Tokens de API, ambiente de sandbox e webhooks para integrar sistemas externos.",
      },
      { property: "og:title", content: "Central de integrações — FinCore ERP" },
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

const corMetodo: Record<string, string> = {
  GET: "bg-secondary/10 text-secondary",
  POST: "bg-primary-fixed text-on-primary-fixed-variant",
};

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
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">toggle_off</span>
          <div>
            <p className="font-label-md text-label-md text-primary">API pública não contratada</p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              A central de integrações faz parte do perfil <strong>Corporativo</strong>. Ative a
              feature <code className="font-data-mono">api_publica</code> em{" "}
              <Link to="/configuracoes" className="text-secondary underline decoration-dotted">
                Features do tenant
              </Link>{" "}
              (PV7).
            </p>
          </div>
        </div>
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
              <button
                type="button"
                onClick={() => gerar("Sandbox")}
                className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[18px]">science</span>
                Token de sandbox
              </button>
              <button
                type="button"
                onClick={() => gerar("Produção")}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                Novo token
              </button>
            </>
          )
        }
      />

      <div className="mb-lg flex flex-wrap items-center gap-3 rounded-lg border border-primary-fixed-dim bg-primary-fixed/30 p-4">
        <span className="material-symbols-outlined text-secondary">link</span>
        <p className="flex-1 font-body-md text-body-md text-on-surface-variant">
          Base da API:{" "}
          <code className="rounded bg-surface-container px-1.5 py-0.5 font-data-mono text-body-sm">
            https://api.fincore.app/v1
          </code>{" "}
          · autenticação por header{" "}
          <code className="rounded bg-surface-container px-1.5 py-0.5 font-data-mono text-body-sm">
            Authorization: Bearer &lt;token&gt;
          </code>
        </p>
        <Link
          to="/integracoes/adaptador"
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[16px]">tune</span>
          Adaptador bancário: {config.adaptador}
        </Link>
      </div>

      {/* Tokens */}
      <div className="mb-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
          Tokens de acesso
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Nome</th>
                <th className="w-28 p-3 font-label-md text-label-md text-on-surface-variant">
                  Ambiente
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Chave</th>
                <th className="w-28 p-3 text-center font-label-md text-label-md text-on-surface-variant">
                  Status
                </th>
                <th className="w-28 p-3 text-right font-label-md text-label-md text-on-surface-variant">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {tokens.map((t) => {
                const visivel = revelados.includes(t.id);
                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-surface-container-low ${t.ativo ? "" : "opacity-55"}`}
                  >
                    <td className="p-3">
                      <span className="block font-label-md text-label-md text-primary">
                        {t.nome}
                      </span>
                      <span className="block font-data-mono text-[11px] text-on-surface-variant">
                        {t.escopo} · criado em {t.criadoEm}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge tone={t.ambiente === "Sandbox" ? "atencao" : "info"}>
                        {t.ambiente}
                      </StatusBadge>
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-2">
                        <code className="font-data-mono text-on-surface">
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
                          className="rounded p-0.5 text-on-surface-variant hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {visivel ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge tone={t.ativo ? "ok" : "neutro"}>
                        {t.ativo ? "Ativo" : "Revogado"}
                      </StatusBadge>
                    </td>
                    <td className="p-3 text-right">
                      {leitura || !t.ativo ? (
                        <span className="text-outline">—</span>
                      ) : (
                        <button
                          type="button"
                          title="Revogar token"
                          onClick={() => revogar(t)}
                          className="rounded p-1 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                        >
                          <span className="material-symbols-outlined text-[20px]">block</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Endpoints */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
          Endpoints disponíveis
        </h3>
        <ul className="flex flex-col divide-y divide-outline-variant">
          {ENDPOINTS.map((e) => (
            <li key={e.rota + e.metodo} className="flex flex-wrap items-center gap-3 px-md py-3">
              <span
                className={`w-14 shrink-0 rounded px-2 py-0.5 text-center font-label-md text-[11px] ${corMetodo[e.metodo]}`}
              >
                {e.metodo}
              </span>
              <code className="font-data-mono text-data-mono text-primary">{e.rota}</code>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {e.descricao}
              </span>
            </li>
          ))}
          {has("centro_custo") ? (
            <li className="flex flex-wrap items-center gap-3 bg-secondary/5 px-md py-3">
              <span
                className={`w-14 shrink-0 rounded px-2 py-0.5 text-center font-label-md text-[11px] ${corMetodo["GET"]}`}
              >
                GET
              </span>
              <code className="font-data-mono text-data-mono text-primary">/v1/rateios</code>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Rateio por centro de custo — disponível porque{" "}
                <code className="font-data-mono">centro_custo</code> está ativo (PV7)
              </span>
            </li>
          ) : null}
        </ul>
      </div>
    </>
  );
}
