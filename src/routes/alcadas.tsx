import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { brl, usuarios } from "@/lib/mock-data";

export const Route = createFileRoute("/alcadas")({
  head: () => ({
    meta: [
      { title: "Configurar alçada de aprovação — FinCore ERP" },
      {
        name: "description",
        content: "Defina limites de aprovação automática por perfil e aprovadores substitutos.",
      },
      { property: "og:title", content: "Configurar alçada de aprovação — FinCore ERP" },
      { property: "og:description", content: "Limites por perfil e substituto em ausências." },
    ],
  }),
  component: Alcadas,
});

type PerfilAlcada = {
  id: string;
  nome: string;
  titular: string;
  limite: number;
  substituto: string;
};

const iniciais: PerfilAlcada[] = [
  {
    id: "p1",
    nome: "Operador financeiro",
    titular: "Marina Duarte",
    limite: 10000,
    substituto: "Renata Oliveira",
  },
  {
    id: "p2",
    nome: "Analista financeiro",
    titular: "Renata Oliveira",
    limite: 25000,
    substituto: "Roberto Tanaka",
  },
  {
    id: "p3",
    nome: "Coordenador",
    titular: "Roberto Tanaka",
    limite: 80000,
    substituto: "Carlos Eduardo Menezes",
  },
  {
    id: "p4",
    nome: "Diretor financeiro",
    titular: "Carlos Eduardo Menezes",
    limite: 500000,
    substituto: "Paula Nunes",
  },
];

const inputCls =
  "w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-data-mono text-data-mono focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary";

function Alcadas() {
  const { has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();

  const [perfis, setPerfis] = useState(iniciais);
  const [prazo, setPrazo] = useState(2);
  const [horas, setHoras] = useState(24);

  if (!has("alcada")) {
    return (
      <>
        <PageHeader
          titulo="Configurar alçada"
          descricao="Limites de aprovação automática por perfil."
          variabilidade={[
            {
              o_que:
                "A tela e o grupo Aprovações no menu só existem com a feature de alçada ativa.",
              por: "feature alcada",
              pv: "PV3",
            },
          ]}
        />
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">toggle_off</span>
          <div>
            <p className="font-label-md text-label-md text-primary">
              Aprovação por alçada não contratada
            </p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Ative a feature <code className="font-data-mono">alcada</code> em{" "}
              <Link to="/configuracoes" className="text-secondary underline decoration-dotted">
                Features do tenant
              </Link>{" "}
              (PV3) para configurar limites por perfil.
            </p>
          </div>
        </div>
      </>
    );
  }

  const atualizar = (id: string, campo: keyof PerfilAlcada, valor: string | number) =>
    setPerfis((p) => p.map((x) => (x.id === id ? { ...x, [campo]: valor } : x)));

  const salvar = () => {
    registrar({
      tipo: "feature",
      entidade: "Alçada",
      operacao: "Salvar",
      detalhe: `Limites atualizados: ${perfis.map((p) => `${p.nome} ${brl(p.limite)}`).join(" · ")}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Alçadas atualizadas", {
      description: "As novas faixas passam a valer para os próximos lançamentos.",
    });
  };

  return (
    <>
      <PageHeader
        titulo="Configurar alçada"
        descricao="Valores acima do limite do perfil vão automaticamente para a fila de aprovação."
        variabilidade={[
          {
            o_que: "A tela inteira depende da feature de alçada contratada pelo tenant.",
            por: "feature alcada",
            pv: "PV3",
          },
          {
            o_que: "Somente os perfis Operador e Implantador conseguem alterar os limites.",
            por: "perfil de acesso",
            pv: "PV4",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <button
              type="button"
              onClick={salvar}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary shadow-sm transition-colors hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Salvar alterações
            </button>
          )
        }
      />

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
          Perfis de usuário
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Perfil</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant">Titular</th>
                <th className="w-56 p-3 font-label-md text-label-md text-on-surface-variant">
                  Limite de aprovação automática
                </th>
                <th className="w-64 p-3 font-label-md text-label-md text-on-surface-variant">
                  Aprovador substituto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {perfis.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low">
                  <td className="p-3">
                    <span className="block font-label-md text-label-md text-primary">{p.nome}</span>
                    <span className="block font-data-mono text-body-sm text-on-surface-variant">
                      Limite atual {brl(p.limite)}
                    </span>
                  </td>
                  <td className="p-3 font-body-md text-body-md text-on-surface">{p.titular}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-data-mono text-on-surface-variant">R$</span>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        disabled={leitura}
                        className={`${inputCls} disabled:opacity-60`}
                        value={p.limite}
                        onChange={(e) => atualizar(p.id, "limite", Number(e.target.value))}
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <select
                      disabled={leitura}
                      className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary disabled:opacity-60"
                      value={p.substituto}
                      onChange={(e) => atualizar(p.id, "substituto", e.target.value)}
                    >
                      {usuarios.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-md overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <h3 className="border-b border-outline-variant bg-surface px-md py-3 font-headline-sm text-headline-sm text-primary">
          Regras gerais
        </h3>
        <div className="grid gap-md p-md sm:grid-cols-2">
          <div>
            <label
              htmlFor="a-prazo"
              className="mb-1.5 block font-label-md text-label-md text-on-surface-variant"
            >
              Prazo para aprovação (dias úteis)
            </label>
            <input
              id="a-prazo"
              type="number"
              min={1}
              disabled={leitura}
              className={`${inputCls} disabled:opacity-60`}
              value={prazo}
              onChange={(e) => setPrazo(Number(e.target.value))}
            />
          </div>
          <div>
            <label
              htmlFor="a-horas"
              className="mb-1.5 block font-label-md text-label-md text-on-surface-variant"
            >
              Acionar substituto após (horas sem ação)
            </label>
            <input
              id="a-horas"
              type="number"
              min={1}
              disabled={leitura}
              className={`${inputCls} disabled:opacity-60`}
              value={horas}
              onChange={(e) => setHoras(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="border-t border-outline-variant bg-surface-container-low p-md">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Títulos sem ação por <strong>{horas}h</strong> são encaminhados ao substituto. Após{" "}
            <strong>{prazo} dias úteis</strong> o título retorna a quem o lançou com aviso
            {has("notificacoes_push") ? " por e-mail, in-app e push (PV5)" : " por e-mail e in-app"}
            .
          </p>
        </div>
      </div>
    </>
  );
}
