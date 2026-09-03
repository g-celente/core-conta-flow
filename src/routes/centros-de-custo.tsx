import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Split, ToggleLeft } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useFeatures } from "@/components/app/FeaturesContext";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados } from "@/components/app/DadosContext";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { brl, centrosDeCusto, usuarios, type CentroCusto } from "@/lib/mock-data";

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

  const [lista, setLista] = useState<CentroCusto[]>(centrosDeCusto);
  const [aberto, setAberto] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    responsavel: usuarios[0]!,
    rateio: 0,
  });

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

  /** Valor efetivamente rateado em cada centro, a partir dos títulos da sessão. */
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

  const salvar = () => {
    if (!form.codigo.trim() || !form.descricao.trim()) return;
    setLista((l) => [...l, { id: `cc-${Date.now()}`, ...form, mes: 0 }]);
    registrar({
      tipo: "crud",
      entidade: "Centro de custo",
      operacao: "Criar",
      detalhe: `${form.codigo} — ${form.descricao} (${form.rateio}% padrão)`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    setAberto(false);
    setForm({ codigo: "", descricao: "", responsavel: usuarios[0]!, rateio: 0 });
    toast.success("Centro de custo cadastrado");
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
            o_que: "A coluna Lançado no mês é calculada sobre o rateio real dos títulos da sessão.",
            por: "núcleo",
            pv: "núcleo",
          },
          {
            o_que: "O botão Novo centro de custo fica oculto no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <Button className="gap-1.5" onClick={() => setAberto(true)}>
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
                </TableRow>
              ))}
              {filtrada.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
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

      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Novo centro de custo</SheetTitle>
            <SheetDescription>
              O rateio padrão é a sugestão inicial aplicada no formulário de títulos.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cc-cod">Código *</Label>
              <Input
                id="cc-cod"
                className="num"
                placeholder="CC-500"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc-desc">Descrição *</Label>
              <Input
                id="cc-desc"
                placeholder="Ex.: Tecnologia"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc-resp">Responsável</Label>
              <Select
                value={form.responsavel}
                onValueChange={(v) => setForm((f) => ({ ...f, responsavel: v }))}
              >
                <SelectTrigger id="cc-resp">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc-rat">Rateio padrão (%)</Label>
              <Input
                id="cc-rat"
                type="number"
                min={0}
                max={100}
                className="num"
                value={form.rateio}
                onChange={(e) => setForm((f) => ({ ...f, rateio: Number(e.target.value) }))}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button disabled={!form.codigo.trim() || !form.descricao.trim()} onClick={salvar}>
                Cadastrar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
