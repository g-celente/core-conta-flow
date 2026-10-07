import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  ClipboardList,
  CloudUpload,
  Database,
  FileText,
  ListChecks,
  Loader2,
  Play,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { TODAS_FEATURES, useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/instanciacao/")({
  head: () => ({
    meta: [
      { title: "Assistente de instanciação — FinCore" },
      {
        name: "description",
        content:
          "Sete etapas para instanciar um tenant: necessidades, features, cobertura, provisão, carga, testes e homologação.",
      },
      { property: "og:title", content: "Assistente de instanciação — FinCore" },
      { property: "og:description", content: "Processo de derivação de uma instância do produto." },
    ],
  }),
  component: Instanciacao,
});

type Resultado = { ok: boolean; titulo: string; detalhes: string[] };

const ETAPAS = [
  {
    id: 1,
    nome: "Levantar necessidades",
    icone: ClipboardList,
    descricao: "Entrevista de escopo com o cliente e mapeamento dos processos financeiros.",
  },
  {
    id: 2,
    nome: "Selecionar features",
    icone: ListChecks,
    descricao: "Marcação das funcionalidades contratadas nos pontos de variação PV1–PV7.",
  },
  {
    id: 3,
    nome: "Verificar cobertura",
    icone: FileText,
    descricao: "Checagem de dependências entre features e das necessidades não cobertas.",
  },
  {
    id: 4,
    nome: "Provisionar tenant",
    icone: CloudUpload,
    descricao: "Criação do schema isolado, das chaves e do domínio do cliente.",
  },
  {
    id: 5,
    nome: "Carga inicial",
    icone: Database,
    descricao: "Importação do plano de contas, parceiros, centros de custo e saldos de abertura.",
  },
  {
    id: 6,
    nome: "Executar suíte de testes",
    icone: ShieldCheck,
    descricao: "Testes de fumaça sobre cada feature ativa e os fluxos críticos do núcleo.",
  },
  {
    id: 7,
    nome: "Homologar",
    icone: CheckCircle2,
    descricao: "Aceite formal do cliente e liberação do ambiente de produção.",
  },
] as const;

function Instanciacao() {
  const { config, has } = useFeatures();
  const { perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();

  const [concluidas, setConcluidas] = useState<number[]>([]);
  const [resultados, setResultados] = useState<Record<number, Resultado>>({});
  const [executando, setExecutando] = useState<number | null>(null);

  const ativas = TODAS_FEATURES.filter((f) => has(f.id));
  const progresso = Math.round((concluidas.length / ETAPAS.length) * 100);

  const gerarResultado = (etapa: number): Resultado => {
    switch (etapa) {
      case 1:
        return {
          ok: true,
          titulo: "12 necessidades levantadas, 12 mapeadas para pontos de variação",
          detalhes: [
            "Regime tributário identificado: " + config.regime + " (PV1)",
            "Banco principal com retorno " + config.adaptador + " (PV2)",
            has("alcada")
              ? "Exige aprovação hierárquica acima de R$ 10.000 (PV3)"
              : "Não exige aprovação hierárquica (PV3 dispensado)",
            has("multiempresa")
              ? "Grupo com múltiplos CNPJs (PV7)"
              : "CNPJ único (PV7 na escala mínima)",
          ],
        };
      case 2:
        return {
          ok: true,
          titulo: `${ativas.length} de ${TODAS_FEATURES.length} features selecionadas`,
          detalhes: ativas.map((f) => `${f.nome} — ${f.pv}`),
        };
      case 3: {
        const problemas: string[] = [];
        if (has("centro_custo") && !has("alcada"))
          problemas.push(
            "Rateio ativo sem alçada: títulos com rateio não passam por aprovação — confirmado pelo cliente.",
          );
        if (has("api_publica") && !has("multiempresa"))
          problemas.push(
            "API pública sem multiempresa: o escopo /v1/empresas retornará 1 registro.",
          );
        if (!has("conciliacao"))
          problemas.push("Sem conciliação: o adaptador bancário fica registrado mas inativo.");
        if (has("mod_comissoes") && !has("centro_custo"))
          problemas.push(
            "Módulo de comissões sem centro de custo: o título gerado não terá rateio departamental.",
          );
        return {
          ok: problemas.length === 0,
          titulo:
            problemas.length === 0
              ? "Cobertura completa — nenhuma dependência pendente"
              : `${problemas.length} observação(ões) de cobertura`,
          detalhes:
            problemas.length === 0
              ? ["Todas as features selecionadas têm suas dependências satisfeitas."]
              : problemas,
        };
      }
      case 4:
        return {
          ok: true,
          titulo: "Tenant provisionado",
          detalhes: [
            `Schema isolado tenant_${nomeAtual
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "_")
              .slice(0, 24)}`,
            "Domínio: " + nomeAtual.split(" ")[0]?.toLowerCase() + ".fincore.app",
            `Perfil de produto aplicado: ${config.perfilProduto}`,
            has("api_publica")
              ? "Chaves de API geradas (produção + sandbox)"
              : "API pública não provisionada",
          ],
        };
      case 5:
        return {
          ok: true,
          titulo: "Carga inicial concluída",
          detalhes: [
            "Plano de contas: 20 contas base + contas tributárias do regime " + config.regime,
            "Parceiros: 7 registros importados",
            has("centro_custo")
              ? "Centros de custo: 4 registros com rateio padrão"
              : "Centros de custo: não aplicável (feature inativa)",
            "Saldos de abertura conciliados com o balancete de 31/05/2026",
          ],
        };
      case 6: {
        const casos = [
          { nome: "Núcleo — CRUD de parceiro", ok: true },
          { nome: "Núcleo — CRUD de título a pagar", ok: true },
          { nome: "Núcleo — baixa com juros e desconto", ok: true },
          ...(has("alcada") ? [{ nome: "PV3 — título acima da alçada vai à fila", ok: true }] : []),
          ...(has("centro_custo")
            ? [{ nome: "PV7 — rateio bloqueia salvamento fora de 100%", ok: true }]
            : []),
          ...(has("conciliacao")
            ? [{ nome: `PV2/PV6 — parser ${config.adaptador} e conciliação`, ok: true }]
            : []),
          ...(has("multiempresa") ? [{ nome: "PV7 — visão consolidada do grupo", ok: true }] : []),
          ...(has("portal_contador")
            ? [{ nome: "PV4 — perfil contador em modo leitura", ok: true }]
            : []),
          ...(has("api_publica")
            ? [{ nome: "PV7 — autenticação por bearer token", ok: true }]
            : []),
          ...(has("notificacoes_push") ? [{ nome: "PV5 — canal push habilitado", ok: true }] : []),
          ...(has("mod_comissoes")
            ? [{ nome: "Exclusivo — comissão gera título a pagar", ok: true }]
            : []),
        ];
        return {
          ok: casos.every((c) => c.ok),
          titulo: `${casos.filter((c) => c.ok).length}/${casos.length} casos aprovados`,
          detalhes: casos.map((c) => `${c.ok ? "PASS" : "FAIL"} · ${c.nome}`),
        };
      }
      case 7:
        return {
          ok: true,
          titulo: "Tenant homologado",
          detalhes: [
            `Aceite registrado por ${perfil.usuario} (${perfil.nome})`,
            `Perfil de produto ${config.perfilProduto} com ${ativas.length} features ativas`,
            "Ficha de configuração disponível em /instanciacao/resumo",
            "Ambiente liberado para produção",
          ],
        };
      default:
        return { ok: true, titulo: "", detalhes: [] };
    }
  };

  const executar = (etapa: number) => {
    setExecutando(etapa);
    window.setTimeout(() => {
      const resultado = gerarResultado(etapa);
      setResultados((r) => ({ ...r, [etapa]: resultado }));
      setConcluidas((c) => (c.includes(etapa) ? c : [...c, etapa]));
      setExecutando(null);
      registrar({
        tipo: "feature",
        entidade: "Instanciação",
        operacao: `Etapa ${etapa}`,
        detalhe: `${ETAPAS[etapa - 1]?.nome}: ${resultado.titulo}`,
        usuario: perfil.usuario,
        empresa: nomeAtual,
      });
      toast[resultado.ok ? "success" : "warning"](`Etapa ${etapa} — ${ETAPAS[etapa - 1]?.nome}`, {
        description: resultado.titulo,
      });
    }, 700);
  };

  const executarTudo = () => {
    ETAPAS.forEach((e, i) => {
      window.setTimeout(() => executar(e.id), i * 850);
    });
  };

  return (
    <>
      <PageHeader
        titulo="Assistente de instanciação"
        descricao={`Derivação de uma instância do FinCore para ${nomeAtual}. Sete etapas, com resultado por etapa.`}
        variabilidade={[
          {
            o_que: "A etapa 2 lista exatamente as features ativas do tenant selecionado.",
            por: "FeaturesContext do tenant",
            pv: "PV1–PV7",
          },
          {
            o_que:
              "A etapa 3 acusa dependências entre features (ex.: rateio sem alçada, API sem multiempresa).",
            por: "combinação de features",
            pv: "PV7",
          },
          {
            o_que:
              "A suíte de testes da etapa 6 cresce com as features: só testa o que foi contratado.",
            por: "features do tenant",
            pv: "PV1–PV7",
          },
        ]}
        acoes={
          <>
            <StatusBadge tone={progresso === 100 ? "success" : "warning"}>
              {concluidas.length}/{ETAPAS.length} etapas
            </StatusBadge>
            <Button onClick={executarTudo} className="gap-1.5">
              <Play className="size-4" /> Executar todas
            </Button>
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                setConcluidas([]);
                setResultados({});
              }}
            >
              <RotateCcw className="size-4" /> Reiniciar
            </Button>
          </>
        }
      />

      <Card className="mb-6 shadow-card">
        <CardContent className="pt-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Progresso da instanciação
            </span>
            <span className="num font-bold text-success">{progresso}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
          {progresso === 100 ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-success/10 p-3">
              <CheckCircle2 className="size-4 shrink-0 text-success" />
              <p className="flex-1 text-sm">
                Instanciação concluída. A ficha de configuração já reflete todas as decisões
                tomadas.
              </p>
              <Button asChild size="sm" className="gap-1.5">
                <Link to="/instanciacao/resumo">
                  <ScrollText className="size-3.5" /> Ver ficha de configuração
                </Link>
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {ETAPAS.map((e) => {
          const feito = concluidas.includes(e.id);
          const rodando = executando === e.id;
          const resultado = resultados[e.id];
          const liberada = e.id === 1 || concluidas.includes(e.id - 1);
          const Icone = e.icone;

          return (
            <Card
              key={e.id}
              className={cn(
                "shadow-card transition-all",
                feito && (resultado?.ok ? "border-success/40" : "border-warning/50"),
                !liberada && "opacity-60",
              )}
            >
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold",
                      feito && "bg-success text-success-foreground",
                      rodando && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !feito && !rodando && "border-2 border-border text-muted-foreground",
                    )}
                  >
                    {feito ? (
                      <Check className="size-5" />
                    ) : rodando ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      e.id
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold">
                      <Icone className="size-4 shrink-0 text-muted-foreground" />
                      {e.nome}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{e.descricao}</p>
                  </div>

                  <div className="shrink-0">
                    {feito ? (
                      <StatusBadge tone={resultado?.ok ? "success" : "warning"}>
                        {resultado?.ok ? "Concluída" : "Com observações"}
                      </StatusBadge>
                    ) : (
                      <Button
                        size="sm"
                        className="gap-1.5"
                        disabled={!liberada || rodando}
                        onClick={() => executar(e.id)}
                      >
                        <Play className="size-3.5" /> Executar
                      </Button>
                    )}
                  </div>
                </div>

                {resultado ? (
                  <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
                    <p
                      className={cn(
                        "mb-2 flex items-center gap-2 text-sm font-semibold",
                        resultado.ok ? "text-success" : "text-warning-foreground",
                      )}
                    >
                      {resultado.ok ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <TriangleAlert className="size-4" />
                      )}
                      {resultado.titulo}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {resultado.detalhes.map((d) => (
                        <li
                          key={d}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border" />
                          <span
                            className={cn(
                              d.startsWith("PASS") && "num text-success",
                              d.startsWith("FAIL") && "num text-destructive",
                            )}
                          >
                            {d}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
