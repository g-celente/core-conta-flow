import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Split, ToggleLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
import { FormularioCadastro } from "@/components/app/FormularioCadastro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, type CentroCusto, type Usuario } from "@/lib/mock-data";
import { useCadastro } from "@/lib/use-cadastro";

export const Route = createFileRoute("/centros-de-custo")({
  head: () => ({
    meta: [
      { title: "Centros de custo — FinCore" },
      {
        name: "description",
        content: "Cadastre centros de custo com responsável, rateio padrão e total do mês.",
      },
      { property: "og:title", content: "Centros de custo — FinCore" },
      { property: "og:description", content: "Cadastro e acompanhamento de centros de custo." },
    ],
  }),
  component: CentrosDeCusto,
});

function CentrosDeCusto() {
  const { has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { titulos } = useDados();
  const { registros: lista, criar, editar, excluir } = useCadastro<CentroCusto>("centros-custo");
  const { registros: usuarios } = useCadastro<Usuario>("usuarios");

  const [editando, setEditando] = useState<CentroCusto | null>(null);
  const [ehNovo, setEhNovo] = useState(false);
  const [filtro, setFiltro] = useState("");

  if (!has("centro_custo")) {
    return (
      <>
        <PageHeader
          titulo="Centro de custo"
          descricao="Estrutura de custos usada no rateio de títulos."
          variabilidade={[
            {
              o_que: "A tela e o grupo Custos no menu só existem com a feature contratada.",
              por: "feature centro_custo",
              pv: "PV7",
            },
          ]}
        />
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 pt-6">
            <ToggleLeft className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Centro de custo não contratado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ative a feature <code className="num">centro_custo</code> em{" "}
                <Link to="/configuracoes" className="text-primary underline decoration-dotted">
                  Features do tenant
                </Link>{" "}
                (PV7) para habilitar o rateio por departamento.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  /** Valor efetivamente rateado em cada centro, a partir dos títulos gravados. */
  const lancadoNoCentro = (id: string) =>
    titulos
      .filter((t) => t.status !== "Cancelado")
      .reduce((s, t) => {
        const linha = t.rateio.find((r) => r.centroId === id);
        return s + (linha ? (t.valor * linha.percentual) / 100 : 0);
      }, 0);

  const filtrada = lista.filter((c) =>
    `${c.codigo} ${c.descricao} ${c.responsavel}`.toLowerCase().includes(filtro.toLowerCase()),
  );
  const total = lista.reduce((s, c) => s + lancadoNoCentro(c.id), 0);
  const somaRateioPadrao = lista.reduce((s, c) => s + c.rateio, 0);
  const responsaveis = usuarios.filter((u) => u.ativo).map((u) => u.nome);

  const novo = () => {
    setEhNovo(true);
    setEditando({
      id: crypto.randomUUID(),
      codigo: "",
      descricao: "",
      responsavel: responsaveis[0] ?? "",
      rateio: 0,
      mes: 0,
    });
  };

  const salvar = async (c: CentroCusto) => {
    if (!(await (ehNovo ? criar(c) : editar(c)))) return;
    registrar({
      tipo: "crud",
      entidade: "Centro de custo",
      operacao: ehNovo ? "Criar" : "Editar",
      detalhe: `${c.codigo} — ${c.descricao} (${c.rateio}% padrão)`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success(ehNovo ? "Centro de custo cadastrado" : "Centro de custo atualizado");
    setEditando(null);
  };

  const remover = async (c: CentroCusto) => {
    if (!(await excluir(c.id))) return;
    registrar({
      tipo: "crud",
      entidade: "Centro de custo",
      operacao: "Excluir",
      detalhe: `${c.codigo} — ${c.descricao}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Centro de custo excluído");
  };

  return (
    <>
      <PageHeader
        titulo="Centro de custo"
        descricao="Estrutura de custos usada no rateio de títulos e nos relatórios gerenciais."
        variabilidade={[
          {
            o_que:
              "A tela e o grupo Custos no menu só existem com a feature centro_custo contratada.",
            por: "feature centro_custo",
            pv: "PV7",
          },
          {
            o_que: "A coluna Lançado no mês é calculada sobre o rateio real dos títulos gravados.",
            por: "núcleo",
            pv: "núcleo",
          },
          {
            o_que: "Os botões de cadastro ficam ocultos no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <Button className="gap-1.5" onClick={novo}>
              <Plus className="size-4" /> Novo centro de custo
            </Button>
          )
        }
      />

      <Card className="shadow-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">
            {lista.length} centros · <span className="num">{brl(total)}</span> rateados
          </CardTitle>
          <Input
            placeholder="Filtrar por código, descrição ou responsável"
            className="sm:max-w-xs"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[44rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Rateio padrão</TableHead>
                <TableHead className="text-right">Lançado no mês</TableHead>
                {leitura ? null : <TableHead className="w-24 text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrada.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="num font-semibold">{c.codigo}</TableCell>
                  <TableCell>{c.descricao}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.responsavel}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${c.rateio}%` }}
                        />
                      </div>
                      <span className="num w-10 text-sm">{c.rateio}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="num text-right">{brl(lancadoNoCentro(c.id))}</TableCell>
                  {leitura ? null : (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Editar"
                          onClick={() => {
                            setEhNovo(false);
                            setEditando(c);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Excluir"
                          className="hover:text-destructive"
                          onClick={() => remover(c)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtrada.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={leitura ? 5 : 6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum centro de custo encontrado.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <StatusBadge tone={somaRateioPadrao === 100 ? "success" : "warning"}>
              Rateio padrão soma {somaRateioPadrao}%
            </StatusBadge>
            <Link
              to="/rateio"
              className="flex items-center gap-1.5 text-sm font-medium text-primary underline decoration-dotted"
            >
              <Split className="size-4" /> Ratear um título específico
            </Link>
          </div>
        </CardContent>
      </Card>

      {editando ? (
        <FormularioCadastro
          titulo={ehNovo ? "Novo centro de custo" : `Editar ${editando.codigo}`}
          campos={[
            { nome: "codigo", rotulo: "Código", tipo: "texto" },
            { nome: "descricao", rotulo: "Descrição", tipo: "texto" },
            { nome: "responsavel", rotulo: "Responsável", tipo: "opcoes", opcoes: responsaveis },
            { nome: "rateio", rotulo: "Rateio padrão (%)", tipo: "numero" },
          ]}
          registro={editando}
          aoSalvar={salvar}
          aoFechar={() => setEditando(null)}
        />
      ) : null}
    </>
  );
}
