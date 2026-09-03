import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Download,
  History,
  Landmark,
  Loader2,
  Lock,
  Receipt,
  Split,
  BookOpen,
} from "lucide-react";
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

export const Route = createFileRoute("/exportacoes")({
  head: () => ({
    meta: [
      { title: "Exportar dados — FinCore" },
      {
        name: "description",
        content:
          "Gere arquivos de títulos, extratos e balancetes nos formatos aceitos pela contabilidade.",
      },
      { property: "og:title", content: "Exportar dados — FinCore" },
      { property: "og:description", content: "Fila de exportações com histórico da sessão." },
    ],
  }),
  component: Exportacoes,
});

type Pacote = {
  id: string;
  nome: string;
  descricao: string;
  icone: typeof Receipt;
  formatos: string[];
  requer?: "conciliacao" | "centro_custo" | "portal_contador" | "multiempresa";
};

const PACOTES: Pacote[] = [
  {
    id: "titulos",
    nome: "Títulos a pagar e a receber",
    descricao: "Todos os títulos do período com status, parceiro, categoria e valores.",
    icone: Receipt,
    formatos: ["CSV", "XLSX"],
  },
  {
    id: "extrato",
    nome: "Extrato conciliado",
    descricao: "Linhas do extrato com o título conciliado correspondente.",
    icone: Landmark,
    formatos: ["CSV", "OFX"],
    requer: "conciliacao",
  },
  {
    id: "rateio",
    nome: "Rateio por centro de custo",
    descricao: "Distribuição do valor de cada título entre os centros de custo.",
    icone: Split,
    formatos: ["CSV", "XLSX"],
    requer: "centro_custo",
  },
  {
    id: "balancete",
    nome: "Balancete contábil",
    descricao: "Saldos por conta do plano de contas no padrão exigido pela contabilidade.",
    icone: BookOpen,
    formatos: ["TXT", "XLSX"],
    requer: "portal_contador",
  },
  {
    id: "consolidado",
    nome: "Consolidado do grupo",
    descricao: "Somatório de todas as empresas sob a mesma conta raiz.",
    icone: Building2,
    formatos: ["XLSX"],
    requer: "multiempresa",
  },
  {
    id: "auditoria",
    nome: "Trilha de auditoria",
    descricao: "Log de operações da sessão com usuário, data e detalhe.",
    icone: History,
    formatos: ["CSV"],
  },
];

type Job = { id: string; pacote: string; formato: string; hora: string; status: "Concluído" };

function Exportacoes() {
  const { has, config } = useFeatures();
  const { perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual, consolidado } = useEmpresa();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [processando, setProcessando] = useState<string | null>(null);

  const disponiveis = PACOTES.filter((p) => (p.requer ? has(p.requer) : true));
  const bloqueados = PACOTES.filter((p) => p.requer && !has(p.requer));

  const exportar = (p: Pacote, formato: string) => {
    setProcessando(p.id);
    registrar({
      tipo: "crud",
      entidade: "Exportação",
      operacao: "Gerar arquivo",
      detalhe: `${p.nome} em ${formato}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    window.setTimeout(() => {
      setProcessando(null);
      setJobs((l) => [
        {
          id: `job-${Date.now()}`,
          pacote: p.nome,
          formato,
          hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          status: "Concluído",
        },
        ...l,
      ]);
      toast.success(`${p.nome} exportado`, {
        description: `Arquivo ${formato} pronto para download.`,
      });
    }, 900);
  };

  return (
    <>
      <PageHeader
        titulo="Exportar dados"
        descricao={`Escopo: ${consolidado && has("multiempresa") ? "todas as empresas do grupo" : nomeAtual} · perfil de produto ${config.perfilProduto}.`}
        variabilidade={[
          {
            o_que: "O pacote Extrato conciliado exige o módulo de conciliação bancária.",
            por: "feature conciliacao",
            pv: "PV6",
          },
          {
            o_que: "O pacote Rateio por centro de custo exige a feature centro_custo.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "O Balancete contábil no layout da contabilidade exige portal do contador.",
            por: "feature portal_contador",
            pv: "PV4",
          },
          {
            o_que:
              "O Consolidado do grupo exige multiempresa; o formato do extrato segue o adaptador.",
            por: "features multiempresa e adaptador",
            pv: "PV7 / PV2",
          },
        ]}
        acoes={
          <StatusBadge tone="info">
            {disponiveis.length} de {PACOTES.length} pacotes disponíveis
          </StatusBadge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {disponiveis.map((p) => {
          const Icone = p.icone;
          return (
            <Card key={p.id} className="shadow-card">
              <CardContent className="flex h-full flex-col gap-2 pt-6">
                <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Icone className="size-5" />
                </span>
                <h3 className="text-sm font-semibold">{p.nome}</h3>
                <p className="text-xs text-muted-foreground">{p.descricao}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  {p.formatos.map((f) => (
                    <Button
                      key={f}
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={processando === p.id}
                      onClick={() => exportar(p, f)}
                    >
                      {processando === p.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Download className="size-3.5" />
                      )}
                      {f}
                    </Button>
                  ))}
                </div>
                {p.requer ? (
                  <StatusBadge tone="info" className="mt-2 w-fit">
                    requer {p.requer}
                  </StatusBadge>
                ) : null}
              </CardContent>
            </Card>
          );
        })}

        {bloqueados.map((p) => (
          <Card key={p.id} className="border-dashed opacity-60">
            <CardContent className="flex h-full flex-col gap-2 pt-6">
              <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Lock className="size-5" />
              </span>
              <h3 className="text-sm font-semibold text-muted-foreground">{p.nome}</h3>
              <p className="text-xs text-muted-foreground">
                Não contratado neste tenant — depende da feature{" "}
                <code className="num">{p.requer}</code>.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Exportações desta sessão</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma exportação gerada ainda. Escolha um pacote acima.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Hora</TableHead>
                  <TableHead>Pacote</TableHead>
                  <TableHead className="w-28">Formato</TableHead>
                  <TableHead className="w-32 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell className="num text-sm text-muted-foreground">{j.hora}</TableCell>
                    <TableCell className="text-sm">{j.pacote}</TableCell>
                    <TableCell className="num text-sm text-muted-foreground">{j.formato}</TableCell>
                    <TableCell className="text-right">
                      <StatusBadge tone="success">{j.status}</StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
