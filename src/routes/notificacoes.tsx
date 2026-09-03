import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Mail, Save, Send, Smartphone, SmartphoneNfc } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — FinCore" },
      {
        name: "description",
        content: "Preferências de canal e antecedência de aviso de vencimento e aprovação.",
      },
      { property: "og:title", content: "Notificações — FinCore" },
      {
        property: "og:description",
        content: "Configure e-mail, in-app e push por tipo de evento.",
      },
    ],
  }),
  component: Notificacoes,
});

type Canal = "email" | "inapp" | "push";

type Evento = {
  id: string;
  nome: string;
  descricao: string;
  /** Quando definida, o evento só aparece se a feature estiver ativa. */
  requer?: "alcada" | "conciliacao" | "centro_custo";
};

const EVENTOS: Evento[] = [
  {
    id: "venc",
    nome: "Vencimento próximo",
    descricao: "Aviso antes do vencimento de títulos a pagar e a receber.",
  },
  {
    id: "atraso",
    nome: "Título em atraso",
    descricao: "Disparado no dia seguinte ao vencimento sem baixa.",
  },
  {
    id: "aprov",
    nome: "Título aguardando aprovação",
    descricao: "Enviado ao aprovador quando um título entra na fila.",
    requer: "alcada",
  },
  {
    id: "devol",
    nome: "Título devolvido",
    descricao: "Enviado a quem lançou o título, com a justificativa.",
    requer: "alcada",
  },
  {
    id: "concil",
    nome: "Extrato importado",
    descricao: "Resumo das linhas lidas e das divergências encontradas.",
    requer: "conciliacao",
  },
  {
    id: "rateio",
    nome: "Rateio incompleto",
    descricao: "Alerta quando um título é salvo com rateio fora de 100%.",
    requer: "centro_custo",
  },
  {
    id: "fecha",
    nome: "Fechamento mensal",
    descricao: "Lembrete de conferência no último dia útil do mês.",
  },
];

const CANAIS: { id: Canal; nome: string; icone: typeof Mail; requer?: "notificacoes_push" }[] = [
  { id: "email", nome: "E-mail", icone: Mail },
  { id: "inapp", nome: "In-app", icone: Bell },
  { id: "push", nome: "Push", icone: Smartphone, requer: "notificacoes_push" },
];

function Notificacoes() {
  const { has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();

  const eventos = EVENTOS.filter((e) => (e.requer ? has(e.requer) : true));
  const canais = CANAIS.filter((c) => (c.requer ? has(c.requer) : true));

  const [prefs, setPrefs] = useState<Record<string, Record<Canal, boolean>>>(() =>
    Object.fromEntries(
      EVENTOS.map((e) => [e.id, { email: true, inapp: true, push: e.id !== "fecha" }]),
    ),
  );
  const [antecedencia, setAntecedencia] = useState(3);
  const [horario, setHorario] = useState("08:00");
  const [resumoDiario, setResumoDiario] = useState(true);

  const alternar = (eventoId: string, canal: Canal) =>
    setPrefs((p) => ({ ...p, [eventoId]: { ...p[eventoId]!, [canal]: !p[eventoId]![canal] } }));

  const salvar = () => {
    const ativos = eventos.reduce(
      (s, e) => s + canais.filter((c) => prefs[e.id]?.[c.id]).length,
      0,
    );
    registrar({
      tipo: "feature",
      entidade: "Notificações",
      operacao: "Salvar preferências",
      detalhe: `${ativos} combinações evento×canal ativas · antecedência ${antecedencia} dia(s) · envio às ${horario}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Preferências de notificação salvas");
  };

  return (
    <>
      <PageHeader
        titulo="Notificações"
        descricao="Escolha os canais e a antecedência de cada tipo de aviso."
        variabilidade={[
          {
            o_que: "A coluna Push só existe quando a feature de notificações push está contratada.",
            por: "feature notificacoes_push",
            pv: "PV5",
          },
          {
            o_que: "Os eventos de aprovação e devolução só aparecem com a feature de alçada.",
            por: "feature alcada",
            pv: "PV3",
          },
          {
            o_que:
              "Os eventos de extrato importado e rateio incompleto dependem de conciliação e centro de custo.",
            por: "features conciliacao e centro_custo",
            pv: "PV6 / PV7",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <Button onClick={salvar} className="gap-1.5">
              <Save className="size-4" /> Salvar preferências
            </Button>
          )
        }
      />

      {!has("notificacoes_push") ? (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
          <SmartphoneNfc className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            O canal <strong>Push</strong> não está contratado neste tenant (PV5). Ative a feature{" "}
            <code className="num">notificacoes_push</code> em{" "}
            <Link to="/configuracoes" className="text-primary underline decoration-dotted">
              Features do tenant
            </Link>{" "}
            para exibir a coluna.
          </p>
        </div>
      ) : null}

      <Card className="mb-6 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Canais por evento</CardTitle>
          <p className="text-sm text-muted-foreground">
            {eventos.length} eventos disponíveis · {canais.length} canais contratados.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[36rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                {canais.map((c) => {
                  const Icone = c.icone;
                  return (
                    <TableHead key={c.id} className="w-28 text-center">
                      <span className="flex flex-col items-center gap-1">
                        <Icone className="size-4" />
                        {c.nome}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventos.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {e.nome}
                      {e.requer ? (
                        <code className="num rounded bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                          {e.requer}
                        </code>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {e.descricao}
                    </span>
                  </TableCell>
                  {canais.map((c) => (
                    <TableCell key={c.id} className="text-center">
                      <Switch
                        disabled={leitura}
                        checked={prefs[e.id]?.[c.id] ?? false}
                        onCheckedChange={() => alternar(e.id, c.id)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="space-y-2 pt-6">
            <Label htmlFor="n-ant">Antecedência do aviso de vencimento</Label>
            <div className="flex items-center gap-3">
              <input
                id="n-ant"
                type="range"
                min={1}
                max={15}
                disabled={leitura}
                value={antecedencia}
                onChange={(e) => setAntecedencia(Number(e.target.value))}
                className="flex-1 accent-[var(--primary)]"
              />
              <span className="num w-20 shrink-0 text-sm">
                {antecedencia} dia{antecedencia === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Títulos que vencem em até {antecedencia} dia{antecedencia === 1 ? "" : "s"} geram
              aviso.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-2 pt-6">
            <Label htmlFor="n-hora">Horário de envio</Label>
            <Input
              id="n-hora"
              type="time"
              className="num"
              disabled={leitura}
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Horário de Brasília. Avisos críticos são enviados imediatamente.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-2 pt-6">
            <Label>Resumo diário consolidado</Label>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Agrupar todos os avisos do dia em um único e-mail
              </span>
              <Switch disabled={leitura} checked={resumoDiario} onCheckedChange={setResumoDiario} />
            </div>
            <p className="text-xs text-muted-foreground">
              {resumoDiario
                ? "Um e-mail por dia com todos os eventos."
                : "Um e-mail por evento, no momento em que ocorre."}
            </p>
          </CardContent>
        </Card>
      </div>

      {!leitura ? (
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              toast.info("Notificação de teste enviada", {
                description: `Canais ativos: ${canais.map((c) => c.nome).join(", ")}.`,
              })
            }
          >
            <Send className="size-4" /> Enviar notificação de teste
          </Button>
        </div>
      ) : null}
    </>
  );
}
