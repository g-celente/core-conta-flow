import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  FileUp,
  Landmark,
  ListChecks,
  Sliders,
  ToggleLeft,
  Undo2,
  UploadCloud,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { KpiCard } from "@/components/app/KpiCard";
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
import { brl, linhasExtrato } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/importar-extrato")({
  head: () => ({
    meta: [
      { title: "Importar extrato bancário — FinCore" },
      {
        name: "description",
        content: "Importe arquivos OFX e CNAB e revise as linhas lidas antes de confirmar.",
      },
      { property: "og:title", content: "Importar extrato bancário — FinCore" },
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
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 pt-6">
            <ToggleLeft className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Módulo de conciliação não contratado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ative a feature <code className="num">conciliacao</code> em{" "}
                <Link to="/configuracoes" className="text-primary underline decoration-dotted">
                  Features do tenant
                </Link>{" "}
                (PV6) para importar extratos.
              </p>
            </div>
          </CardContent>
        </Card>
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
            <Button variant="outline" onClick={() => setArquivo(null)}>
              Trocar arquivo
            </Button>
          ) : (
            <Button asChild variant="outline" className="gap-1.5">
              <Link to="/integracoes/adaptador">
                <Sliders className="size-4" /> Trocar adaptador
              </Link>
            </Button>
          )
        }
      />

      {!arquivo ? (
        <Card className="shadow-card">
          <CardContent className="pt-6">
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
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-14 text-center transition-colors",
                arrastando && "border-primary bg-accent/50",
              )}
            >
              <UploadCloud className="size-10 text-primary" />
              <p className="mt-4 text-base font-semibold">Arraste o arquivo aqui</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Formato aceito pelo adaptador {config.adaptador}:{" "}
                <strong className="num">{adaptador.ext}</strong> · até 10 MB
              </p>
              <label className="mt-5 inline-flex">
                <input
                  type="file"
                  accept=".ofx,.ret,.txt,.cnab"
                  className="sr-only"
                  onChange={(e) => carregar(e.target.files?.[0]?.name ?? adaptador.nome)}
                />
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  <FileUp className="size-4" /> Selecionar arquivo
                </span>
              </label>
              <button
                type="button"
                onClick={() => carregar(adaptador.nome)}
                className="num mt-3 text-xs text-primary underline decoration-dotted"
              >
                Ou use o arquivo de exemplo {adaptador.nome}
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              rotulo="Linhas lidas"
              icone={ListChecks}
              valor={String(linhasExtrato.length)}
              rodape={arquivo}
            />
            <KpiCard
              rotulo="Válidas"
              icone={CheckCircle2}
              corIcone="text-success"
              corValor="text-success"
              valor={String(validas.length)}
              rodape={
                ignoradas.length > 0
                  ? `${ignoradas.length} ignorada(s) manualmente`
                  : "Prontas para importar"
              }
            />
            <KpiCard
              rotulo="Com erro"
              icone={AlertCircle}
              corIcone="text-destructive"
              corValor="text-destructive"
              valor={String(comErro.length)}
              rodape="Rejeitadas pelo parser"
            />
            <KpiCard
              rotulo="Saldo do período"
              icone={Landmark}
              valor={brl(credito - debito)}
              rodape={`${brl(credito)} entradas · ${brl(debito)} saídas`}
            />
          </div>

          <Card className="shadow-card">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">
                Prévia de <span className="num">{arquivo}</span>
              </CardTitle>
              <div className="flex gap-2">
                <StatusBadge tone="success">{validas.length} válidas</StatusBadge>
                <StatusBadge tone="danger">{comErro.length} com erro</StatusBadge>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="min-w-[42rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Linha</TableHead>
                    <TableHead className="w-28">Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-28">Tipo</TableHead>
                    <TableHead className="w-36 text-right">Valor</TableHead>
                    <TableHead className="w-24 text-center">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhasExtrato.map((l) => {
                    const ignorada = ignoradas.includes(l.linha);
                    return (
                      <TableRow
                        key={l.linha}
                        className={cn(l.erro && "bg-destructive/8", ignorada && "opacity-50")}
                      >
                        <TableCell className="num align-top text-sm text-muted-foreground">
                          {l.linha}
                        </TableCell>
                        <TableCell className="num align-top text-sm">{l.data}</TableCell>
                        <TableCell className="align-top">
                          <span
                            className={cn(
                              "text-sm",
                              l.erro && "font-medium text-destructive",
                              ignorada && "line-through",
                            )}
                          >
                            {l.descricao}
                          </span>
                          {l.erro ? (
                            <p className="mt-1 text-xs text-destructive">{l.erro}</p>
                          ) : null}
                        </TableCell>
                        <TableCell className="align-top">
                          <StatusBadge tone={l.tipo === "Crédito" ? "success" : "neutral"}>
                            {l.tipo}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="num align-top text-right">
                          {l.erro ? "—" : brl(l.valor)}
                        </TableCell>
                        <TableCell className="text-center align-top">
                          {l.erro ? (
                            <span className="text-xs text-destructive">Rejeitada</span>
                          ) : leitura ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              title={ignorada ? "Reincluir linha" : "Ignorar linha"}
                              onClick={() =>
                                setIgnoradas((s) =>
                                  s.includes(l.linha)
                                    ? s.filter((x) => x !== l.linha)
                                    : [...s, l.linha],
                                )
                              }
                            >
                              {ignorada ? <Undo2 className="size-4" /> : <Ban className="size-4" />}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
                <span className="mr-auto text-xs text-muted-foreground">
                  Linhas rejeitadas não são importadas e podem ser corrigidas no internet banking.
                </span>
                <Button variant="outline" onClick={() => setArquivo(null)}>
                  Cancelar
                </Button>
                {leitura ? null : (
                  <Button disabled={validas.length === 0} onClick={confirmar} className="gap-1.5">
                    <CheckCircle2 className="size-4" /> Confirmar importação
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
