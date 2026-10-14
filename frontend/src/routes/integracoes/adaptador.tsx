import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Info, Settings, X } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures, type AdaptadorBancario } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/integracoes/adaptador")({
  head: () => ({
    meta: [
      { title: "Adaptador bancário — FinCore" },
      {
        name: "description",
        content: "Escolha o formato de arquivo bancário usado na importação e remessa do tenant.",
      },
      { property: "og:title", content: "Adaptador bancário — FinCore" },
      { property: "og:description", content: "OFX, CNAB 240 ou CNAB 400 — ponto de variação PV2." },
    ],
  }),
  component: Adaptador,
});

const OPCOES: {
  id: AdaptadorBancario;
  nome: string;
  descricao: string;
  extensao: string;
  recursos: { rotulo: string; ok: boolean }[];
  bancos: string;
}[] = [
  {
    id: "OFX",
    nome: "OFX Padrão",
    descricao:
      "Open Financial Exchange. Formato universal, suportado por praticamente todos os bancos, mas só cobre extratos.",
    extensao: ".ofx",
    recursos: [
      { rotulo: "Leitura de extrato", ok: true },
      { rotulo: "Remessa de pagamentos", ok: false },
      { rotulo: "Retorno com ocorrências", ok: false },
      { rotulo: "Conciliação automática", ok: true },
    ],
    bancos: "Todos os bancos de varejo",
  },
  {
    id: "CNAB240",
    nome: "Febraban CNAB 240",
    descricao:
      "Padrão Febraban de 240 posições. Suporta remessa de pagamentos e retorno detalhado com códigos de ocorrência.",
    extensao: ".ret",
    recursos: [
      { rotulo: "Leitura de extrato", ok: true },
      { rotulo: "Remessa de pagamentos", ok: true },
      { rotulo: "Retorno com ocorrências", ok: true },
      { rotulo: "Conciliação automática", ok: true },
    ],
    bancos: "Itaú, Bradesco, Banco do Brasil, Santander, Caixa",
  },
  {
    id: "CNAB400",
    nome: "Febraban CNAB 400",
    descricao:
      "Padrão legado de 400 posições. Mantido para bancos e convênios que ainda não migraram para o CNAB 240.",
    extensao: ".txt",
    recursos: [
      { rotulo: "Leitura de extrato", ok: true },
      { rotulo: "Remessa de pagamentos", ok: true },
      { rotulo: "Retorno com ocorrências", ok: false },
      { rotulo: "Conciliação automática", ok: false },
    ],
    bancos: "Convênios de cobrança legados",
  },
];

function Adaptador() {
  const { config, setAdaptador, has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();

  const escolher = (id: AdaptadorBancario, nome: string) => {
    setAdaptador(id);
    registrar({
      tipo: "feature",
      entidade: "Adaptador bancário",
      operacao: "Alterar",
      detalhe: `Adaptador definido como ${id} (${nome})`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success(`Adaptador ${id} selecionado`, {
      description: "A tela de importação de extrato passa a aceitar o novo formato.",
    });
  };

  return (
    <>
      <PageHeader
        titulo="Adaptador bancário"
        descricao="Formato de arquivo que o banco principal utiliza para remessa e retorno. É o mesmo dado configurado na tela de features do tenant."
        variabilidade={[
          {
            o_que: "O adaptador define a extensão aceita e o parser usado em Importar extrato.",
            por: "configuração do tenant",
            pv: "PV2",
          },
          {
            o_que:
              "A escolha só tem efeito prático quando o módulo de conciliação está contratado.",
            por: "feature conciliacao",
            pv: "PV6",
          },
          {
            o_que: "A alteração fica indisponível no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={<StatusBadge tone="info">Atual: {config.adaptador}</StatusBadge>}
      />

      {!has("conciliacao") ? (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/15 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
          <p className="text-sm text-warning-foreground">
            O módulo de conciliação não está contratado neste tenant, então o adaptador fica
            registrado mas não é exercitado. Ative <code className="num">conciliacao</code> em{" "}
            <Link to="/configuracoes" className="underline decoration-dotted">
              Features do tenant
            </Link>{" "}
            (PV6) para usá-lo.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {OPCOES.map((o) => {
          const ativo = config.adaptador === o.id;
          return (
            <Card
              key={o.id}
              className={cn(
                "flex flex-col shadow-card",
                ativo && "border-primary ring-1 ring-primary",
              )}
            >
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{o.nome}</CardTitle>
                  <code className="num text-xs text-muted-foreground">{o.extensao}</code>
                </div>
                {ativo ? <Check className="size-5 shrink-0 text-primary" /> : null}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="mb-4 text-sm text-muted-foreground">{o.descricao}</p>

                <ul className="mb-4 flex flex-col gap-1.5">
                  {o.recursos.map((r) => (
                    <li key={r.rotulo} className="flex items-center gap-2 text-xs">
                      {r.ok ? (
                        <Check className="size-3.5 shrink-0 text-success" />
                      ) : (
                        <X className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className={r.ok ? "" : "text-muted-foreground"}>{r.rotulo}</span>
                    </li>
                  ))}
                </ul>

                <p className="mb-4 mt-auto text-xs text-muted-foreground">
                  <strong className="text-foreground">Bancos:</strong> {o.bancos}
                </p>

                {leitura ? null : (
                  <Button
                    className="w-full"
                    variant={ativo ? "secondary" : "default"}
                    disabled={ativo}
                    onClick={() => escolher(o.id, o.nome)}
                  >
                    {ativo ? "Adaptador em uso" : `Usar ${o.id}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 shadow-card">
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Settings className="size-4 shrink-0 text-muted-foreground" />
          <p className="flex-1 text-sm text-muted-foreground">
            Este é o <strong>mesmo dado</strong> exibido no card “Adaptador bancário” da tela de
            features do tenant — as duas telas leem e gravam o{" "}
            <code className="num">FeaturesContext</code>.
          </p>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/configuracoes">
              <Settings className="size-3.5" /> Abrir features do tenant
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
