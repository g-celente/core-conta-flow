import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures, type AdaptadorBancario } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";

export const Route = createFileRoute("/integracoes/adaptador")({
  head: () => ({
    meta: [
      { title: "Adaptador bancário — FinCore ERP" },
      {
        name: "description",
        content: "Escolha o formato de arquivo bancário usado na importação e remessa do tenant.",
      },
      { property: "og:title", content: "Adaptador bancário — FinCore ERP" },
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
        <div className="mb-md flex items-start gap-3 rounded-lg border border-tertiary-fixed-dim bg-tertiary-fixed p-4">
          <span className="material-symbols-outlined text-on-tertiary-fixed-variant">info</span>
          <p className="font-body-md text-body-md text-on-tertiary-fixed-variant">
            O módulo de conciliação não está contratado neste tenant, então o adaptador fica
            registrado mas não é exercitado. Ative{" "}
            <code className="font-data-mono">conciliacao</code> em{" "}
            <Link to="/configuracoes" className="underline decoration-dotted">
              Features do tenant
            </Link>{" "}
            (PV6) para usá-lo.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-md lg:grid-cols-3">
        {OPCOES.map((o) => {
          const ativo = config.adaptador === o.id;
          return (
            <div
              key={o.id}
              className={`flex flex-col rounded-xl border p-md shadow-sm transition-all ${
                ativo
                  ? "border-2 border-secondary bg-secondary/5"
                  : "border-outline-variant bg-surface-container-lowest"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">{o.nome}</h3>
                  <code className="font-data-mono text-body-sm text-on-surface-variant">
                    {o.extensao}
                  </code>
                </div>
                <span
                  className={`material-symbols-outlined shrink-0 ${ativo ? "text-secondary" : "text-outline-variant"}`}
                >
                  {ativo ? "check_circle" : "radio_button_unchecked"}
                </span>
              </div>

              <p className="mb-4 font-body-md text-body-md text-on-surface-variant">
                {o.descricao}
              </p>

              <ul className="mb-4 flex flex-col gap-1.5">
                {o.recursos.map((r) => (
                  <li key={r.rotulo} className="flex items-center gap-2 font-body-sm text-body-sm">
                    <span
                      className={`material-symbols-outlined text-[16px] ${r.ok ? "text-secondary" : "text-outline"}`}
                    >
                      {r.ok ? "check" : "close"}
                    </span>
                    <span className={r.ok ? "text-on-surface" : "text-outline"}>{r.rotulo}</span>
                  </li>
                ))}
              </ul>

              <p className="mb-4 mt-auto font-body-sm text-body-sm text-on-surface-variant">
                <strong className="text-on-surface">Bancos:</strong> {o.bancos}
              </p>

              {leitura ? null : (
                <button
                  type="button"
                  disabled={ativo}
                  onClick={() => escolher(o.id, o.nome)}
                  className={`w-full rounded-lg py-2.5 font-label-md text-label-md transition-colors ${
                    ativo
                      ? "cursor-default bg-secondary-container text-on-secondary-container"
                      : "bg-primary text-on-primary hover:bg-primary-container"
                  }`}
                >
                  {ativo ? "Adaptador em uso" : `Usar ${o.id}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-lg flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
        <span className="material-symbols-outlined text-on-surface-variant">sync_alt</span>
        <p className="flex-1 font-body-md text-body-md text-on-surface-variant">
          Este é o <strong>mesmo dado</strong> exibido no card “Adaptador bancário” da tela de
          features do tenant — as duas telas leem e gravam o{" "}
          <code className="font-data-mono">FeaturesContext</code>.
        </p>
        <Link
          to="/configuracoes"
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[16px]">settings</span>
          Abrir features do tenant
        </Link>
      </div>
    </>
  );
}
