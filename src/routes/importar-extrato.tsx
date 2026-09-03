import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { KpiCard } from "@/components/app/KpiCard";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { brl, linhasExtrato } from "@/lib/mock-data";

export const Route = createFileRoute("/importar-extrato")({
  head: () => ({
    meta: [
      { title: "Importar extrato bancário — FinCore ERP" },
      {
        name: "description",
        content: "Importe arquivos OFX e CNAB e revise as linhas lidas antes de confirmar.",
      },
      { property: "og:title", content: "Importar extrato bancário — FinCore ERP" },
      { property: "og:description", content: "Upload de OFX/CNAB com prévia e validação." },
    ],
  }),
  component: ImportarExtrato,
});

/** PV2: extensão e descrição do arquivo mudam com o adaptador bancário. */
const porAdaptador = {
  OFX: { ext: ".ofx", nome: "extrato-junho-2026.ofx", descricao: "OFX padrão (apenas extratos)" },
  CNAB240: {
    ext: ".ret",
    nome: "RETORNO-CNAB240-06-2026.ret",
    descricao: "Febraban CNAB 240 (remessa e retorno detalhado)",
  },
  CNAB400: {
    ext: ".txt",
    nome: "RETORNO-CNAB400-06-2026.txt",
    descricao: "Febraban CNAB 400 (remessa e retorno legado)",
  },
} as const;

function ImportarExtrato() {
  const { has, config } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();

  const [arquivo, setArquivo] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const [ignoradas, setIgnoradas] = useState<number[]>([]);

  const adaptador = porAdaptador[config.adaptador];
  const validas = linhasExtrato.filter((l) => !l.erro && !ignoradas.includes(l.linha));
  const comErro = linhasExtrato.filter((l) => l.erro);
  const credito = validas.filter((l) => l.tipo === "Crédito").reduce((s, l) => s + l.valor, 0);
  const debito = validas.filter((l) => l.tipo === "Débito").reduce((s, l) => s + l.valor, 0);

  if (!has("conciliacao")) {
    return (
      <>
        <PageHeader
          titulo="Importar extrato bancário"
          descricao="Leitura de arquivos bancários para conciliação."
          variabilidade={[
            {
              o_que: "A tela e o grupo Conciliação no menu só existem com o módulo contratado.",
              por: "feature conciliacao",
              pv: "PV6",
            },
          ]}
        />
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <span className="material-symbols-outlined text-on-surface-variant">toggle_off</span>
          <div>
            <p className="font-label-md text-label-md text-primary">
              Módulo de conciliação não contratado
            </p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Ative a feature <code className="font-data-mono">conciliacao</code> em{" "}
              <Link to="/configuracoes" className="text-secondary underline decoration-dotted">
                Features do tenant
              </Link>{" "}
              (PV6) para importar extratos.
            </p>
          </div>
        </div>
      </>
    );
  }

  const carregar = (nome: string) => {
    setArquivo(nome);
    setIgnoradas([]);
    toast.success(`Arquivo ${nome} lido com sucesso`, {
      description: `${linhasExtrato.length} linhas processadas pelo adaptador ${config.adaptador}.`,
    });
  };

  const confirmar = () => {
    registrar({
      tipo: "crud",
      entidade: "Extrato bancário",
      operacao: "Importar",
      detalhe: `${arquivo} · ${validas.length} linhas importadas · adaptador ${config.adaptador}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success(`${validas.length} lançamentos importados para conciliação`);
    setArquivo(null);
  };

  return (
    <>
      <PageHeader
        titulo="Importar extrato bancário"
        descricao={`Adaptador ativo: ${config.adaptador} — ${adaptador.descricao}. Aceita arquivos ${adaptador.ext}.`}
        variabilidade={[
          {
            o_que: `A extensão aceita e o parser mudam com o adaptador bancário (atual ${config.adaptador}, ${adaptador.ext}).`,
            por: "adaptador bancário do tenant",
            pv: "PV2",
          },
          {
            o_que: "A tela inteira depende do módulo de conciliação contratado.",
            por: "feature conciliacao",
            pv: "PV6",
          },
          {
            o_que: "O perfil Contador externo visualiza a prévia mas não confirma a importação.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          arquivo ? (
            <button
              type="button"
              onClick={() => setArquivo(null)}
              className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              Trocar arquivo
            </button>
          ) : (
            <Link
              to="/integracoes/adaptador"
              className="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Trocar adaptador
            </Link>
          )
        }
      />

      {!arquivo ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setArrastando(true);
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArrastando(false);
              carregar(e.dataTransfer.files?.[0]?.name ?? adaptador.nome);
            }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
              arrastando ? "border-secondary bg-secondary/5" : "border-outline-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[48px] text-secondary">
              cloud_upload
            </span>
            <p className="mt-4 font-headline-sm text-headline-sm text-primary">
              Arraste o arquivo aqui
            </p>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Formato aceito pelo adaptador {config.adaptador}:{" "}
              <strong className="font-data-mono">{adaptador.ext}</strong> · até 10 MB
            </p>
            <label className="mt-5 inline-flex">
              <input
                type="file"
                accept=".ofx,.ret,.txt,.cnab"
                className="sr-only"
                onChange={(e) => carregar(e.target.files?.[0]?.name ?? adaptador.nome)}
              />
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container">
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Selecionar arquivo
              </span>
            </label>
            <button
              type="button"
              onClick={() => carregar(adaptador.nome)}
              className="mt-3 font-label-md text-label-md text-secondary underline decoration-dotted"
            >
              Ou use o arquivo de exemplo {adaptador.nome}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Resumo da leitura */}
          <div className="mb-lg grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              rotulo="Linhas lidas"
              icone="list_alt"
              valor={String(linhasExtrato.length)}
              rodape={arquivo}
            />
            <KpiCard
              rotulo="Válidas"
              icone="check_circle"
              corIcone="text-secondary"
              corValor="text-secondary"
              valor={String(validas.length)}
              rodape={
                ignoradas.length > 0
                  ? `${ignoradas.length} ignorada(s) manualmente`
                  : "Prontas para importar"
              }
            />
            <KpiCard
              rotulo="Com erro"
              icone="error"
              corIcone="text-error"
              corValor="text-error"
              valor={String(comErro.length)}
              rodape="Rejeitadas pelo parser"
            />
            <KpiCard
              rotulo="Saldo do período"
              icone="account_balance"
              valor={brl(credito - debito)}
              rodape={`${brl(credito)} entradas · ${brl(debito)} saídas`}
            />
          </div>

          {/* Prévia */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant bg-surface px-md py-3">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Prévia de <span className="font-data-mono">{arquivo}</span>
              </h3>
              <div className="flex gap-2">
                <StatusBadge tone="ok">{validas.length} válidas</StatusBadge>
                <StatusBadge tone="erro">{comErro.length} com erro</StatusBadge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <thead className="border-b border-outline-variant bg-surface-container-low">
                  <tr>
                    <th className="w-16 p-3 font-label-md text-label-md text-on-surface-variant">
                      Linha
                    </th>
                    <th className="w-28 p-3 font-label-md text-label-md text-on-surface-variant">
                      Data
                    </th>
                    <th className="p-3 font-label-md text-label-md text-on-surface-variant">
                      Descrição
                    </th>
                    <th className="w-28 p-3 font-label-md text-label-md text-on-surface-variant">
                      Tipo
                    </th>
                    <th className="w-36 p-3 text-right font-label-md text-label-md text-on-surface-variant">
                      Valor
                    </th>
                    <th className="w-24 p-3 text-center font-label-md text-label-md text-on-surface-variant">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                  {linhasExtrato.map((l) => {
                    const ignorada = ignoradas.includes(l.linha);
                    return (
                      <tr
                        key={l.linha}
                        className={
                          l.erro
                            ? "bg-error-container/20"
                            : ignorada
                              ? "opacity-50"
                              : "hover:bg-surface-container-low"
                        }
                      >
                        <td className="p-3 align-top font-data-mono text-on-surface-variant">
                          {l.linha}
                        </td>
                        <td className="p-3 align-top font-data-mono">{l.data}</td>
                        <td className="p-3 align-top">
                          <span
                            className={
                              l.erro
                                ? "font-medium text-error"
                                : ignorada
                                  ? "line-through"
                                  : "text-on-surface"
                            }
                          >
                            {l.descricao}
                          </span>
                          {l.erro ? (
                            <p className="mt-1 font-body-sm text-body-sm text-error">{l.erro}</p>
                          ) : null}
                        </td>
                        <td className="p-3 align-top">
                          <StatusBadge tone={l.tipo === "Crédito" ? "ok" : "neutro"}>
                            {l.tipo}
                          </StatusBadge>
                        </td>
                        <td className="p-3 text-right align-top font-data-mono text-data-mono">
                          {l.erro ? "—" : brl(l.valor)}
                        </td>
                        <td className="p-3 text-center align-top">
                          {l.erro ? (
                            <span className="font-body-sm text-body-sm text-error">Rejeitada</span>
                          ) : leitura ? (
                            <span className="text-outline">—</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setIgnoradas((s) =>
                                  s.includes(l.linha)
                                    ? s.filter((x) => x !== l.linha)
                                    : [...s, l.linha],
                                )
                              }
                              title={ignorada ? "Reincluir linha" : "Ignorar linha"}
                              className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {ignorada ? "undo" : "block"}
                              </span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-low p-md sm:flex-row sm:items-center sm:justify-end">
              <span className="mr-auto font-body-sm text-body-sm text-on-surface-variant">
                Linhas rejeitadas não são importadas e podem ser corrigidas no internet banking.
              </span>
              <button
                type="button"
                onClick={() => setArquivo(null)}
                className="rounded-lg border border-outline px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
              >
                Cancelar
              </button>
              {leitura ? null : (
                <button
                  type="button"
                  disabled={validas.length === 0}
                  onClick={confirmar}
                  className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-5 py-2 font-label-md text-label-md text-on-secondary shadow-sm transition-colors hover:bg-on-secondary-container disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Confirmar importação
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
