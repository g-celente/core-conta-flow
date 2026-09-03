import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Gavel, Landmark, Save, Sparkles, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import {
  TODAS_FEATURES,
  useFeatures,
  type AdaptadorBancario,
  type Feature,
  type PerfilProduto,
  type Regime,
} from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Features do tenant — FinCore" },
      {
        name: "description",
        content:
          "Configure as funcionalidades contratadas, o adaptador bancário e o regime tributário do tenant.",
      },
      { property: "og:title", content: "Features do tenant — FinCore" },
      {
        property: "og:description",
        content: "Personalização dinâmica de interface a partir das features ativas.",
      },
    ],
  }),
  component: Configuracoes,
});

const ADAPTADORES: { id: AdaptadorBancario; nome: string; descricao: string }[] = [
  { id: "OFX", nome: "OFX Padrão", descricao: "Formato universal (apenas extratos)" },
  { id: "CNAB240", nome: "Febraban CNAB 240", descricao: "Remessa e retorno detalhado" },
  { id: "CNAB400", nome: "Febraban CNAB 400", descricao: "Remessa e retorno legado" },
];

const REGIMES: Regime[] = ["Simples Nacional", "Lucro Presumido", "Lucro Real"];

/** Matriz Telas × Perfis de produto (Parte III, ponto 4). */
type Grau = "Comum" | "Comum+" | "Opcional" | "Ausente" | "Somente leitura" | "Exclusivo";

const PERFIS_PRODUTO: PerfilProduto[] = ["Essencial", "Profissional", "Corporativo", "Contábil"];

const MATRIZ: { tela: string; graus: Record<PerfilProduto, Grau> }[] = [
  {
    tela: "Dashboard",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum+",
      Corporativo: "Comum+",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Contas a pagar",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum+",
      Corporativo: "Comum+",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Contas a receber",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Clientes e fornecedores",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Plano de contas",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Baixa de pagamento",
    graus: { Essencial: "Comum", Profissional: "Comum", Corporativo: "Comum", Contábil: "Ausente" },
  },
  {
    tela: "Relatórios",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum+",
      Corporativo: "Comum+",
      Contábil: "Comum+",
    },
  },
  {
    tela: "Importar extrato",
    graus: {
      Essencial: "Ausente",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Conciliação bancária",
    graus: {
      Essencial: "Ausente",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Somente leitura",
    },
  },
  {
    tela: "Fila de aprovação",
    graus: {
      Essencial: "Ausente",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Configurar alçada",
    graus: {
      Essencial: "Ausente",
      Profissional: "Comum",
      Corporativo: "Comum",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Centro de custo",
    graus: {
      Essencial: "Ausente",
      Profissional: "Opcional",
      Corporativo: "Comum",
      Contábil: "Opcional",
    },
  },
  {
    tela: "Rateio de título",
    graus: {
      Essencial: "Ausente",
      Profissional: "Opcional",
      Corporativo: "Comum",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Exportar dados",
    graus: { Essencial: "Comum", Profissional: "Comum", Corporativo: "Comum+", Contábil: "Comum+" },
  },
  {
    tela: "Notificações",
    graus: {
      Essencial: "Comum",
      Profissional: "Comum+",
      Corporativo: "Comum+",
      Contábil: "Opcional",
    },
  },
  {
    tela: "Central de integrações",
    graus: {
      Essencial: "Ausente",
      Profissional: "Ausente",
      Corporativo: "Comum",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Comissões",
    graus: {
      Essencial: "Ausente",
      Profissional: "Exclusivo",
      Corporativo: "Ausente",
      Contábil: "Ausente",
    },
  },
  {
    tela: "Assistente de instanciação",
    graus: { Essencial: "Comum", Profissional: "Comum", Corporativo: "Comum", Contábil: "Comum" },
  },
];

const corGrau: Record<Grau, string> = {
  Comum: "bg-success/12 text-success",
  "Comum+": "bg-success text-success-foreground",
  Opcional: "bg-warning/20 text-warning-foreground",
  Ausente: "bg-muted text-muted-foreground",
  "Somente leitura": "bg-primary/10 text-primary",
  Exclusivo: "bg-destructive/10 text-destructive",
};

function Configuracoes() {
  const { config, has, setFeature, setAdaptador, setRegime } = useFeatures();
  const { perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual, consolidado } = useEmpresa();

  const [aba, setAba] = useState<"features" | "matriz">("features");

  const alternar = (f: Feature, valor: boolean, nome: string, pv: string) => {
    setFeature(f, valor);
    registrar({
      tipo: "feature",
      entidade: "Feature",
      operacao: valor ? "Ativar" : "Desativar",
      detalhe: `${nome} (${f}) ${valor ? "ativada" : "desativada"} — ${pv}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast[valor ? "success" : "info"](`${nome} ${valor ? "ativada" : "desativada"}`, {
      description: "O menu, as colunas e os blocos de formulário reagem imediatamente.",
    });
  };

  const salvarPreferencias = () => {
    registrar({
      tipo: "feature",
      entidade: "Configuração do tenant",
      operacao: "Salvar preferências",
      detalhe: `Adaptador ${config.adaptador} · regime ${config.regime} · ${
        Object.values(config.features).filter(Boolean).length
      } features ativas`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Preferências salvas", {
      description: "Uma linha foi gravada na trilha de auditoria.",
    });
  };

  const ativas = TODAS_FEATURES.filter((f) => has(f.id));

  const efeitos = [
    {
      on: has("conciliacao"),
      texto:
        "Grupo “Conciliação” no menu (Importar extrato + Conciliação bancária) e o relatório Extrato conciliado",
    },
    {
      on: has("alcada"),
      texto: "Grupo “Aprovações” no menu; sem ele, o título salva direto como Em aberto",
    },
    {
      on: has("centro_custo"),
      texto:
        "Grupo “Custos”, coluna Centro de custo em Contas a pagar e bloco de rateio no formulário",
    },
    {
      on: has("multiempresa"),
      texto: "Seletor de empresas no topo e a visão consolidada do grupo",
    },
    {
      on: has("portal_contador"),
      texto: "Perfil “Contador externo” no seletor de perfil e o layout de exportação contábil",
    },
    {
      on: has("api_publica"),
      texto: "Item “Central de integrações” no menu com tokens de API e sandbox",
    },
    {
      on: has("notificacoes_push"),
      texto: "Canal push nas notificações e a cobrança por push em Contas a receber",
    },
    {
      on: has("mod_comissoes"),
      texto: "Item “Comissões” no menu — módulo exclusivo da TransLog Cargas",
    },
  ];

  return (
    <>
      <PageHeader
        titulo="Configurações e variabilidade"
        descricao={`Tenant: ${nomeAtual} · perfil de produto ${config.perfilProduto}. As mudanças valem só para este tenant.`}
        variabilidade={[
          {
            o_que:
              "Cada tenant tem seu próprio conjunto de flags — trocar de empresa troca todo o conjunto.",
            por: "seletor de empresa",
            pv: "PV7",
          },
          {
            o_que:
              "Adaptador bancário e regime tributário são pontos de variação de parâmetro, não de tela.",
            por: "configuração do tenant",
            pv: "PV2 / PV1",
          },
          {
            o_que:
              "Salvar registra uma linha na trilha de auditoria com o usuário e o detalhe da mudança.",
            por: "núcleo",
            pv: "núcleo",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone="info">{ativas.length} features ativas</StatusBadge>
            <Button onClick={salvarPreferencias} className="gap-1.5">
              <Save className="size-4" /> Salvar preferências
            </Button>
          </>
        }
      />

      {consolidado ? (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/15 p-4">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
          <p className="text-sm text-warning-foreground">
            Você está na <strong>visão consolidada do grupo</strong>. A configuração de features é
            por tenant — selecione uma empresa específica no topo para editar as flags.
          </p>
        </div>
      ) : null}

      <div className="mb-6 flex border-b border-border">
        {(
          [
            { id: "features", label: "Funcionalidades" },
            { id: "matriz", label: "Matriz Telas × Perfis de produto" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setAba(t.id)}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6",
              aba === t.id
                ? "border-primary font-semibold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {aba === "features" ? (
        <>
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/8 p-4">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <h4 className="text-sm font-semibold">Personalização Dinâmica de Interface</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Ao desligar uma funcionalidade abaixo, a interface do FinCore ERP reage
                instantaneamente ocultando os menus laterais, colunas de tabela, relatórios
                específicos e blocos de formulário relacionados. Isso mantém sua área de trabalho
                limpa e focada apenas nas operações que sua empresa utiliza.
              </p>
            </div>
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-8">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Módulos do sistema</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Ative ou desative grandes módulos operacionais do ERP.
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col divide-y divide-border p-0">
                  {TODAS_FEATURES.map((f) => {
                    const ativo = has(f.id);
                    const exclusiva = f.id === "mod_comissoes";
                    return (
                      <div
                        key={f.id}
                        className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="min-w-0">
                          <h4 className="mb-1 flex flex-wrap items-center gap-2 text-sm font-semibold">
                            {f.nome}
                            <StatusBadge tone="info">{f.pv}</StatusBadge>
                            <code className="num rounded bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                              {f.id}
                            </code>
                            {exclusiva ? (
                              <StatusBadge tone="danger">Módulo exclusivo</StatusBadge>
                            ) : null}
                          </h4>
                          <p className="text-xs text-muted-foreground">{f.descricao}</p>
                        </div>
                        <Switch
                          className="shrink-0"
                          disabled={consolidado}
                          checked={ativo}
                          onCheckedChange={(v) => alternar(f.id, v, f.nome, f.pv)}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">O que muda agora na interface</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col divide-y divide-border p-0">
                  {efeitos.map((l) => (
                    <div key={l.texto} className="flex items-start gap-3 px-6 py-3">
                      {l.on ? (
                        <Eye className="mt-0.5 size-4 shrink-0 text-success" />
                      ) : (
                        <EyeOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={cn("text-sm", l.on ? "" : "text-muted-foreground line-through")}
                      >
                        {l.texto}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-4">
              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Landmark className="size-4 text-primary" /> Adaptador bancário
                  </CardTitle>
                  <StatusBadge tone="info">PV2</StatusBadge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Formato de arquivo que o banco principal utiliza para remessa e retorno. Define
                    o parser usado em Importar extrato.
                  </p>
                  {ADAPTADORES.map((a) => {
                    const ativo = config.adaptador === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        disabled={consolidado}
                        onClick={() => {
                          setAdaptador(a.id);
                          registrar({
                            tipo: "feature",
                            entidade: "Adaptador bancário",
                            operacao: "Alterar",
                            detalhe: `Adaptador definido como ${a.id} (${a.nome})`,
                            usuario: perfil.usuario,
                            empresa: nomeAtual,
                          });
                          toast.success(`Adaptador ${a.id} selecionado`);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors disabled:opacity-50",
                          ativo ? "border-primary bg-primary/8" : "border-border hover:bg-muted/50",
                        )}
                      >
                        <span className="flex flex-col">
                          <span className={cn("text-sm font-semibold", ativo && "text-primary")}>
                            {a.nome}
                          </span>
                          <span className="text-xs text-muted-foreground">{a.descricao}</span>
                        </span>
                        {ativo ? <Check className="size-4 shrink-0 text-primary" /> : null}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Gavel className="size-4 text-primary" /> Regime tributário
                  </CardTitle>
                  <StatusBadge tone="info">PV1</StatusBadge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Define as contas tributárias sugeridas no plano de contas e a estrutura da DRE.
                  </p>
                  {REGIMES.map((r) => {
                    const ativo = config.regime === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        disabled={consolidado}
                        onClick={() => {
                          setRegime(r);
                          registrar({
                            tipo: "feature",
                            entidade: "Regime tributário",
                            operacao: "Alterar",
                            detalhe: `Regime definido como ${r}`,
                            usuario: perfil.usuario,
                            empresa: nomeAtual,
                          });
                          toast.success(`Regime ${r} selecionado`, {
                            description: "O plano de contas sugerido foi atualizado.",
                          });
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors disabled:opacity-50",
                          ativo
                            ? "border-primary bg-primary/8 text-primary"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        {r}
                        {ativo ? <Check className="size-4" /> : null}
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Resumo do tenant</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Perfil de produto</dt>
                      <dd className="font-semibold">{config.perfilProduto}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Adaptador</dt>
                      <dd className="num">{config.adaptador}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Regime</dt>
                      <dd>{config.regime}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Features ativas</dt>
                      <dd className="num">
                        {ativas.length}/{TODAS_FEATURES.length}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}

      {aba === "matriz" ? (
        <div className="flex flex-col gap-4">
          <Card className="shadow-card">
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              <span className="text-sm font-semibold text-muted-foreground">Legenda:</span>
              {(
                [
                  ["Comum", "presente em todas as instâncias do perfil"],
                  ["Comum+", "presente e enriquecida com blocos extras"],
                  ["Opcional", "contratável à parte"],
                  ["Ausente", "não faz parte do perfil"],
                  ["Somente leitura", "visível sem ações de escrita"],
                  ["Exclusivo", "desenvolvida para um único cliente"],
                ] as const
              ).map(([g, desc]) => (
                <span
                  key={g}
                  title={desc}
                  className={cn(
                    "rounded px-2 py-0.5 text-[0.68rem] font-semibold",
                    corGrau[g as Grau],
                  )}
                >
                  {g}
                </span>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">Matriz Telas × Perfis de produto</CardTitle>
              <p className="text-sm text-muted-foreground">
                Grau de presença de cada tela nos quatro perfis comerciais do FinCore. O tenant
                atual usa o perfil <strong className="text-primary">{config.perfilProduto}</strong>.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="min-w-[42rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Tela</TableHead>
                    {PERFIS_PRODUTO.map((p) => (
                      <TableHead
                        key={p}
                        className={cn(
                          "text-center",
                          p === config.perfilProduto && "bg-primary/8 text-primary",
                        )}
                      >
                        {p}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MATRIZ.map((l) => (
                    <TableRow key={l.tela}>
                      <TableCell className="text-sm">{l.tela}</TableCell>
                      {PERFIS_PRODUTO.map((p) => (
                        <TableCell
                          key={p}
                          className={cn(
                            "text-center",
                            p === config.perfilProduto && "bg-primary/5",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex whitespace-nowrap rounded px-2 py-0.5 text-[0.68rem] font-semibold",
                              corGrau[l.graus[p]],
                            )}
                          >
                            {l.graus[p]}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
