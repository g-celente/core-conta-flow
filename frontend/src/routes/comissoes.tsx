import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { Ban, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
import { Card, CardContent } from "@/components/ui/card";
import { TelaComissoes } from "@/modules/comissoes/TelaComissoes";
import type { PortaNucleo } from "@/modules/comissoes/tipos";

export const Route = createFileRoute("/comissoes")({
  head: () => ({
    meta: [
      { title: "Comissões sobre recebimentos — FinCore" },
      {
        name: "description",
        content:
          "Módulo exclusivo: cálculo e aprovação de comissões sobre títulos recebidos no mês.",
      },
      { property: "og:title", content: "Comissões sobre recebimentos — FinCore" },
      {
        property: "og:description",
        content: "Extensão contratada por um único cliente, isolada do núcleo do produto.",
      },
    ],
  }),
  component: ComissoesRoute,
});

/**
 * Registro condicional do módulo exclusivo.
 * Esta rota é a única ponte entre o núcleo e src/modules/comissoes/: ela lê a
 * flag `mod_comissoes`, monta a porta `PortaNucleo` com as funções do núcleo e
 * renderiza a tela do módulo. Nenhum outro arquivo do núcleo importa da pasta.
 */
function ComissoesRoute() {
  const router = useRouter();
  const { has } = useFeatures();
  const { perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { lancarTituloDeModulo } = useDados();

  const contratado = has("mod_comissoes");

  // Em qualquer outro tenant, a rota redireciona para o dashboard.
  useEffect(() => {
    if (!contratado) {
      toast.error("Módulo não contratado", {
        description: "Comissões sobre recebimentos é exclusivo da TransLog Cargas ME.",
      });
      void router.navigate({ to: "/" });
    }
  }, [contratado, router]);

  if (!contratado) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex items-start gap-3 pt-6">
          <Ban className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold">Módulo não contratado</p>
            <p className="mt-1 text-sm text-muted-foreground">Redirecionando para o dashboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const porta: PortaNucleo = {
    lancarTitulo: (dados) => {
      const criado = lancarTituloDeModulo(dados);
      return { id: criado.id, documento: criado.documento };
    },
    usuario: perfil.usuario,
    auditar: (operacao, detalhe) =>
      registrar({
        tipo: "modulo",
        entidade: "Comissões (módulo exclusivo)",
        operacao,
        detalhe,
        usuario: perfil.usuario,
        empresa: nomeAtual,
      }),
  };

  return (
    <>
      <PageHeader
        titulo="Comissões sobre recebimentos"
        descricao="Cálculo de comissão por vendedor sobre os títulos efetivamente recebidos na competência."
        variabilidade={[
          {
            o_que:
              "A rota só é renderizada quando a flag mod_comissoes está ativa; nos outros tenants redireciona para o dashboard.",
            por: "feature mod_comissoes",
            pv: "PV7",
          },
          {
            o_que:
              "A flag está ativa apenas no tenant TransLog Cargas ME — é uma extensão de cliente único.",
            por: "contrato comercial do tenant",
            pv: "PV7",
          },
          {
            o_que:
              "O título gerado entra em Contas a pagar pela interface pública do núcleo, com origem marcada.",
            por: "porta PortaNucleo",
            pv: "PV7",
          },
        ]}
        selo={
          <StatusBadge tone="danger">
            <Sparkles className="size-3" />
            Módulo exclusivo
          </StatusBadge>
        }
        acoes={<StatusBadge tone="info">{nomeAtual}</StatusBadge>}
      />

      <TelaComissoes porta={porta} />
    </>
  );
}
