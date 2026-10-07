import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, ToggleLeft, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { FormularioCadastro } from "@/components/app/FormularioCadastro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, type Alcada, type Usuario } from "@/lib/mock-data";
import { useCadastro } from "@/lib/use-cadastro";

export const Route = createFileRoute("/alcadas")({
  head: () => ({
    meta: [
      { title: "Configurar alçada de aprovação — FinCore" },
      {
        name: "description",
        content: "Defina limites de aprovação automática por perfil e aprovadores substitutos.",
      },
      { property: "og:title", content: "Configurar alçada de aprovação — FinCore" },
      { property: "og:description", content: "Limites por perfil e substituto em ausências." },
    ],
  }),
  component: Alcadas,
});

function Alcadas() {
  const { has } = useFeatures();
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const { registros, criar, editar, excluir } = useCadastro<Alcada>("alcadas");
  const { registros: usuarios } = useCadastro<Usuario>("usuarios");

  const [editando, setEditando] = useState<Alcada | null>(null);
  const [ehNovo, setEhNovo] = useState(false);
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
        <Card className="shadow-card">
          <CardContent className="flex items-start gap-3 pt-6">
            <ToggleLeft className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">Aprovação por alçada não contratada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ative a feature <code className="num">alcada</code> em{" "}
                <Link to="/configuracoes" className="text-primary underline decoration-dotted">
                  Features do tenant
                </Link>{" "}
                (PV3) para configurar limites por perfil.
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  /** A escada é exibida em ordem de limite, como a corrente de aprovação a percorre. */
  const escada = [...registros].sort((a, b) => a.limite - b.limite);
  const nomes = usuarios.filter((u) => u.ativo).map((u) => u.nome);

  const salvar = async (a: Alcada) => {
    if (!(await (ehNovo ? criar(a) : editar(a)))) return;
    registrar({
      tipo: "feature",
      entidade: "Alçada",
      operacao: ehNovo ? "Criar" : "Editar",
      detalhe: `${a.perfil} · ${a.titular} · limite ${brl(a.limite)}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Alçada salva", {
      description: "A corrente de aprovação passa a usar o novo valor imediatamente.",
    });
    setEditando(null);
  };

  const remover = async (a: Alcada) => {
    if (!(await excluir(a.id))) return;
    registrar({
      tipo: "feature",
      entidade: "Alçada",
      operacao: "Excluir",
      detalhe: `${a.perfil} · ${a.titular}`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    toast.success("Nível de alçada excluído");
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
            <Button
              className="gap-1.5"
              onClick={() => {
                setEhNovo(true);
                setEditando({
                  id: crypto.randomUUID(),
                  perfil: "",
                  titular: nomes[0] ?? "",
                  limite: 0,
                  substituto: nomes[0] ?? "",
                });
              }}
            >
              <Plus className="size-4" /> Novo nível
            </Button>
          )
        }
      />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Escada de aprovação</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[46rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead className="text-right">Limite de aprovação automática</TableHead>
                <TableHead>Aprovador substituto</TableHead>
                {leitura ? null : <TableHead className="w-24 text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {escada.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.perfil}</TableCell>
                  <TableCell className="text-sm">{a.titular}</TableCell>
                  <TableCell className="num text-right">{brl(a.limite)}</TableCell>
                  <TableCell className="text-sm">{a.substituto}</TableCell>
                  {leitura ? null : (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Editar"
                          onClick={() => {
                            setEhNovo(false);
                            setEditando(a);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Excluir"
                          className="hover:text-destructive"
                          onClick={() => remover(a)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {escada.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={leitura ? 4 : 5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum nível cadastrado: todo título acima de zero vai para o comitê.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-4 shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Regras gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-prazo">Prazo para aprovação (dias úteis)</Label>
              <Input
                id="a-prazo"
                type="number"
                min={1}
                disabled={leitura}
                className="num"
                value={prazo}
                onChange={(e) => setPrazo(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-horas">Acionar substituto após (horas sem ação)</Label>
              <Input
                id="a-horas"
                type="number"
                min={1}
                disabled={leitura}
                className="num"
                value={horas}
                onChange={(e) => setHoras(Number(e.target.value))}
              />
            </div>
          </div>
          <p className="border-t border-border pt-4 text-xs text-muted-foreground">
            Títulos sem ação por <strong>{horas}h</strong> são encaminhados ao substituto. Após{" "}
            <strong>{prazo} dias úteis</strong> o título retorna a quem o lançou com aviso
            {has("notificacoes_push") ? " por e-mail, in-app e push (PV5)" : " por e-mail e in-app"}
            .
          </p>
        </CardContent>
      </Card>

      {editando ? (
        <FormularioCadastro
          titulo={ehNovo ? "Novo nível de alçada" : `Editar ${editando.perfil}`}
          campos={[
            { nome: "perfil", rotulo: "Perfil", tipo: "texto" },
            { nome: "titular", rotulo: "Titular", tipo: "opcoes", opcoes: nomes },
            { nome: "limite", rotulo: "Limite (R$)", tipo: "numero" },
            { nome: "substituto", rotulo: "Aprovador substituto", tipo: "opcoes", opcoes: nomes },
          ]}
          registro={editando}
          aoSalvar={salvar}
          aoFechar={() => setEditando(null)}
        />
      ) : null}
    </>
  );
}
