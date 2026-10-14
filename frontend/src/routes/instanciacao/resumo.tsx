import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  Circle,
  CircleCheck,
  Settings,
  ToggleRight,
  UserCheck,
  UserX,
  Workflow,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { TODAS_FEATURES, useFeatures } from "@/components/app/FeaturesContext";
import { PERFIS, usePerfil } from "@/components/app/PerfilContext";
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
import { empresas } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/instanciacao/resumo")({
  head: () => ({
    meta: [
      { title: "Ficha de configuração do tenant — FinCore" },
      {
        name: "description",
        content: "Resumo dos pontos de variação PV1–PV7 com o valor configurado para o tenant.",
      },
      { property: "og:title", content: "Ficha de configuração do tenant — FinCore" },
      {
        property: "og:description",
        content: "Perfil de produto, features ativas e decisões de variabilidade.",
      },
    ],
  }),
  component: Resumo,
});

function Resumo() {
  const { config, has, todas } = useFeatures();
  const { perfil } = usePerfil();
  const { nomeAtual, empresaId, consolidado } = useEmpresa();

  const empresa = empresas.find((e) => e.id === empresaId);
  const ativas = TODAS_FEATURES.filter((f) => has(f.id));

  /** Tabela PV1–PV7 gerada a partir do FeaturesContext. */
  const PVS = [
    {
      pv: "PV1",
      nome: "Regime tributário",
      tipo: "Parâmetro",
      valor: config.regime,
      efeito: "Define as contas tributárias sugeridas no plano de contas e a estrutura da DRE.",
      telas: "/onboarding, /plano-de-contas, /relatorios",
    },
    {
      pv: "PV2",
      nome: "Adaptador bancário",
      tipo: "Parâmetro",
      valor: config.adaptador,
      efeito: "Define a extensão aceita e o parser usado na leitura do arquivo bancário.",
      telas: "/importar-extrato, /integracoes/adaptador",
    },
    {
      pv: "PV3",
      nome: "Aprovação por alçada",
      tipo: "Feature",
      valor: has("alcada") ? "Ativa" : "Inativa",
      efeito: has("alcada")
        ? "Títulos acima de R$ 10.000 vão para a fila de aprovação."
        : "Todo título é salvo direto como “Em aberto”; grupo Aprovações oculto no menu.",
      telas: "/aprovacoes, /alcadas, /contas-a-pagar",
    },
    {
      pv: "PV4",
      nome: "Portal do contador",
      tipo: "Feature",
      valor: has("portal_contador") ? "Ativa" : "Inativa",
      efeito: has("portal_contador")
        ? "Perfil Contador externo disponível no seletor e layout de exportação contábil habilitado."
        : "Perfil Contador externo oculto no seletor de perfil.",
      telas: "/relatorios, /exportacoes, seletor de perfil",
    },
    {
      pv: "PV5",
      nome: "Notificações push",
      tipo: "Feature",
      valor: has("notificacoes_push") ? "Ativa" : "Inativa",
      efeito: has("notificacoes_push")
        ? "Canal Push nas preferências e cobrança por push em Contas a receber."
        : "Apenas e-mail e in-app; coluna Push ausente.",
      telas: "/notificacoes, /contas-a-receber",
    },
    {
      pv: "PV6",
      nome: "Conciliação bancária",
      tipo: "Feature",
      valor: has("conciliacao") ? "Ativa" : "Inativa",
      efeito: has("conciliacao")
        ? "Importação de extrato e conciliação disponíveis; relatório Extrato conciliado habilitado."
        : "Grupo Conciliação oculto no menu; adaptador registrado mas inativo.",
      telas: "/importar-extrato, /conciliacao, /relatorios",
    },
    {
      pv: "PV7",
      nome: "Escala e extensões",
      tipo: "Composto",
      valor:
        [
          has("centro_custo") ? "centro_custo" : null,
          has("multiempresa") ? "multiempresa" : null,
          has("api_publica") ? "api_publica" : null,
          has("mod_comissoes") ? "mod_comissoes" : null,
        ]
          .filter(Boolean)
          .join(", ") || "nenhuma",
      efeito:
        "Centro de custo adiciona coluna, filtro e rateio; multiempresa habilita o seletor e a visão consolidada; API pública abre a central de integrações; mod_comissoes registra o módulo exclusivo.",
      telas: "/centros-de-custo, /rateio, /integracoes, /comissoes, dashboard",
    },
  ];

  const tomTipo: Record<string, "info" | "success" | "warning"> = {
    Parâmetro: "info",
    Feature: "success",
    Composto: "warning",
  };

  const cards = [
    {
      rotulo: "Tenant",
      valor: consolidado ? "Visão consolidada" : (empresa?.nome ?? nomeAtual),
      icone: Building2,
    },
    {
      rotulo: "CNPJ",
      valor: consolidado ? "múltiplos" : (empresa?.cnpj ?? "—"),
      icone: BadgeCheck,
      mono: true,
    },
    { rotulo: "Perfil de produto", valor: config.perfilProduto, icone: Workflow },
    {
      rotulo: "Features ativas",
      valor: `${ativas.length} de ${TODAS_FEATURES.length}`,
      icone: ToggleRight,
      mono: true,
    },
  ];

  return (
    <>
      <PageHeader
        titulo="Ficha de configuração do tenant"
        descricao={`Documento gerado a partir do FeaturesContext em tempo real para ${nomeAtual}.`}
        variabilidade={[
          {
            o_que:
              "Toda a ficha é derivada do FeaturesContext — mudar uma flag na tela 13 muda esta página.",
            por: "FeaturesContext do tenant",
            pv: "PV1–PV7",
          },
          {
            o_que:
              "A coluna Valor configurado mostra parâmetros (regime, adaptador) e features (ativa/inativa).",
            por: "configuração do tenant",
            pv: "PV1–PV7",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone="info">{config.perfilProduto}</StatusBadge>
            <Button asChild variant="outline" className="gap-1.5">
              <Link to="/configuracoes">
                <Settings className="size-4" /> Editar features
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icone = c.icone;
          return (
            <Card key={c.rotulo} className="shadow-card">
              <CardContent className="pt-6">
                <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Icone className="size-4 shrink-0" />
                  {c.rotulo}
                </p>
                <p className={cn("text-base font-semibold", c.mono && "num")}>{c.valor}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mb-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Pontos de variação PV1–PV7</CardTitle>
          <p className="text-sm text-muted-foreground">
            Valor configurado e efeito prático na instância deste tenant.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[52rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">PV</TableHead>
                <TableHead className="w-44">Ponto de variação</TableHead>
                <TableHead className="w-28">Tipo</TableHead>
                <TableHead className="w-44">Valor configurado</TableHead>
                <TableHead>Efeito na instância</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PVS.map((p) => (
                <TableRow key={p.pv}>
                  <TableCell className="num font-bold text-primary">{p.pv}</TableCell>
                  <TableCell className="text-sm font-medium">{p.nome}</TableCell>
                  <TableCell>
                    <StatusBadge tone={tomTipo[p.tipo] ?? "neutral"}>{p.tipo}</StatusBadge>
                  </TableCell>
                  <TableCell className="num text-sm">{p.valor}</TableCell>
                  <TableCell>
                    <span className="block text-xs text-muted-foreground">{p.efeito}</span>
                    <span className="num mt-1 block text-[0.7rem] text-muted-foreground/70">
                      {p.telas}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Features contratadas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border p-0">
            {TODAS_FEATURES.map((f) => {
              const ativo = has(f.id);
              return (
                <div key={f.id} className="flex items-center gap-3 px-6 py-2.5">
                  {ativo ? (
                    <CircleCheck className="size-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn("block text-sm font-medium", !ativo && "text-muted-foreground")}
                    >
                      {f.nome}
                    </span>
                    <code className="num block text-[0.7rem] text-muted-foreground">{f.id}</code>
                  </span>
                  <StatusBadge tone="info">{f.pv}</StatusBadge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Perfis de acesso habilitados</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {PERFIS.map((p) => {
                const habilitado = p.id !== "contador" || has("portal_contador");
                return (
                  <div key={p.id} className="flex items-start gap-3 px-6 py-2.5">
                    {habilitado ? (
                      <UserCheck className="mt-0.5 size-4 shrink-0 text-success" />
                    ) : (
                      <UserX className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "flex flex-wrap items-center gap-2 text-sm font-medium",
                          !habilitado && "text-muted-foreground",
                        )}
                      >
                        {p.nome}
                        {p.id === perfil.id ? (
                          <StatusBadge tone="info">sessão atual</StatusBadge>
                        ) : null}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {habilitado
                          ? `${p.usuario} · ${p.rotas === null ? "acesso total" : `${p.rotas.length} rotas`}${p.somenteLeitura ? " · somente leitura" : ""}`
                          : "Indisponível — requer portal_contador (PV4)"}
                      </span>
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Perfis de produto do grupo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {empresas.map((e) => {
                const c = todas[e.id];
                const atual = e.id === empresaId;
                return (
                  <div
                    key={e.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-2 px-6 py-2.5",
                      atual && "bg-primary/5",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{e.nome}</span>
                      <span className="num block text-[0.7rem] text-muted-foreground">
                        {c ? Object.values(c.features).filter(Boolean).length : 0} features ·{" "}
                        {c?.adaptador} · {c?.regime}
                      </span>
                    </span>
                    <StatusBadge tone={atual ? "success" : "neutral"}>
                      {c?.perfilProduto ?? "—"}
                    </StatusBadge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
