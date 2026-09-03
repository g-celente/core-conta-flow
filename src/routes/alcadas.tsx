import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Save, ToggleLeft } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, usuarios } from "@/lib/mock-data";

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
            <Button onClick={salvar} className="gap-1.5">
              <Save className="size-4" /> Salvar alterações
            </Button>
          )
        }
      />

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Perfis de usuário</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[46rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Titular</TableHead>
                <TableHead className="w-56">Limite de aprovação automática</TableHead>
                <TableHead className="w-64">Aprovador substituto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perfis.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.nome}
                    <p className="num text-xs text-muted-foreground">
                      Limite atual {brl(p.limite)}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{p.titular}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <Input
                        type="number"
                        min={0}
                        step={500}
                        disabled={leitura}
                        className="num"
                        value={p.limite}
                        onChange={(e) => atualizar(p.id, "limite", Number(e.target.value))}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={p.substituto}
                      disabled={leitura}
                      onValueChange={(v) => atualizar(p.id, "substituto", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
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
    </>
  );
}
