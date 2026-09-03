import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeftRight,
  Ban,
  BadgeCheck,
  History,
  Info,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Store,
  TriangleAlert,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { usePerfil } from "@/components/app/PerfilContext";
import { useAuditoria } from "@/components/app/AuditoriaContext";
import { useEmpresa } from "@/components/app/EmpresaContext";
import { useDados, type NovoParceiro } from "@/components/app/DadosContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { baseCnpj, brl, cnpjSugeridos, type Parceiro, type TipoParceiro } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Clientes e fornecedores — FinCore" },
      {
        name: "description",
        content: "Cadastro de clientes e fornecedores com histórico de alterações e inativação.",
      },
      { property: "og:title", content: "Clientes e fornecedores — FinCore" },
      {
        property: "og:description",
        content: "Criar, listar, editar e inativar parceiros com validação de títulos em aberto.",
      },
    ],
  }),
  component: Parceiros,
});

const TIPOS: TipoParceiro[] = ["Cliente", "Fornecedor", "Ambos"];

const iconePorTipo: Record<TipoParceiro, typeof User> = {
  Cliente: User,
  Fornecedor: Store,
  Ambos: ArrowLeftRight,
};

const formVazio = (): NovoParceiro => ({
  documento: "",
  razaoSocial: "",
  nomeFantasia: "",
  tipo: "Fornecedor",
  email: "",
  telefone: "",
  cidade: "",
  uf: "",
});

function Parceiros() {
  const { leitura, perfil } = usePerfil();
  const { registrar } = useAuditoria();
  const { nomeAtual } = useEmpresa();
  const {
    parceiros,
    criarParceiro,
    editarParceiro,
    inativarParceiro,
    reativarParceiro,
    emAbertoDoParceiro,
  } = useDados();

  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<"Ambos" | "Clientes" | "Fornecedores">("Ambos");
  const [soAtivos, setSoAtivos] = useState(false);

  const [sheetAberto, setSheetAberto] = useState(false);
  const [editando, setEditando] = useState<Parceiro | null>(null);
  const [form, setForm] = useState<NovoParceiro>(formVazio());
  const [cnpjBuscado, setCnpjBuscado] = useState<string | null>(null);
  const [inativando, setInativando] = useState<Parceiro | null>(null);

  const lista = useMemo(
    () =>
      parceiros.filter((p) => {
        if (
          busca &&
          !`${p.razaoSocial} ${p.nomeFantasia} ${p.documento} ${p.cidade}`
            .toLowerCase()
            .includes(busca.toLowerCase())
        )
          return false;
        if (aba === "Clientes" && p.tipo === "Fornecedor") return false;
        if (aba === "Fornecedores" && p.tipo === "Cliente") return false;
        if (soAtivos && !p.ativo) return false;
        return true;
      }),
    [parceiros, busca, aba, soAtivos],
  );

  const totalEmAberto = lista.reduce((s, p) => s + emAbertoDoParceiro(p.id), 0);

  const abrirNovo = () => {
    setEditando(null);
    setForm(formVazio());
    setCnpjBuscado(null);
    setSheetAberto(true);
  };

  const abrirEdicao = (p: Parceiro) => {
    setEditando(p);
    setForm({
      documento: p.documento,
      razaoSocial: p.razaoSocial,
      nomeFantasia: p.nomeFantasia,
      tipo: p.tipo,
      email: p.email,
      telefone: p.telefone,
      cidade: p.cidade,
      uf: p.uf,
    });
    setCnpjBuscado(null);
    setSheetAberto(true);
  };

  /** Ao informar o CNPJ, a razão social é preenchida a partir da base mock. */
  const consultarCnpj = (doc: string) => {
    const achado = baseCnpj[doc.trim()];
    if (!achado) {
      setCnpjBuscado(null);
      toast.error("CNPJ não encontrado na base", {
        description: "Use um dos CNPJs sugeridos ou preencha os dados manualmente.",
      });
      return;
    }
    setForm((f) => ({ ...f, ...achado }));
    setCnpjBuscado(doc.trim());
    toast.success("Dados preenchidos pelo CNPJ", { description: achado.razaoSocial });
  };

  const formOk =
    form.documento.trim() !== "" && form.razaoSocial.trim().length > 2 && form.email.includes("@");

  const salvar = () => {
    if (!formOk) return;
    if (editando) {
      editarParceiro(editando.id, form, perfil.usuario);
      registrar({
        tipo: "crud",
        entidade: "Parceiro",
        operacao: "Editar",
        detalhe: `${form.razaoSocial} (${form.documento})`,
        usuario: perfil.usuario,
        empresa: nomeAtual,
      });
      toast.success("Cadastro atualizado", {
        description: "A alteração foi registrada no histórico do parceiro.",
      });
    } else {
      criarParceiro(form, perfil.usuario);
      registrar({
        tipo: "crud",
        entidade: "Parceiro",
        operacao: "Criar",
        detalhe: `${form.razaoSocial} (${form.documento}) como ${form.tipo}`,
        usuario: perfil.usuario,
        empresa: nomeAtual,
      });
      toast.success("Parceiro cadastrado");
    }
    setSheetAberto(false);
  };

  const confirmarInativacao = () => {
    if (!inativando) return;
    const alvo = inativando;
    inativarParceiro(alvo.id, perfil.usuario);
    registrar({
      tipo: "crud",
      entidade: "Parceiro",
      operacao: "Inativar",
      detalhe: `${alvo.razaoSocial} inativado`,
      usuario: perfil.usuario,
      empresa: nomeAtual,
    });
    setInativando(null);
    toast.success(`${alvo.nomeFantasia} foi inativado`, {
      duration: 10000,
      description: "Você tem 10 segundos para desfazer esta ação.",
      action: {
        label: "Desfazer",
        onClick: () => {
          reativarParceiro(alvo.id, perfil.usuario);
          registrar({
            tipo: "crud",
            entidade: "Parceiro",
            operacao: "Desfazer inativação",
            detalhe: `${alvo.razaoSocial} reativado`,
            usuario: perfil.usuario,
            empresa: nomeAtual,
          });
          toast.info("Inativação desfeita");
        },
      },
    });
  };

  const bloqueio = inativando ? emAbertoDoParceiro(inativando.id) : 0;

  return (
    <>
      <PageHeader
        titulo="Clientes e fornecedores"
        descricao="Gerencie os cadastros e acompanhe os totais em aberto."
        variabilidade={[
          {
            o_que: "Botões Novo cadastro, Editar e Inativar desaparecem no perfil somente leitura.",
            por: "perfil Contador externo",
            pv: "PV4",
          },
          {
            o_que: "A coluna Total em aberto é calculada sobre os títulos do tenant selecionado.",
            por: "seletor de empresa · feature multiempresa",
            pv: "PV7",
          },
          {
            o_que: "A inativação é bloqueada quando o parceiro possui títulos em aberto.",
            por: "regra de negócio do núcleo",
            pv: "núcleo",
          },
        ]}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <Button onClick={abrirNovo} className="gap-1.5">
              <Plus className="size-4" /> Novo cadastro
            </Button>
          )
        }
      />

      <Card className="mb-4 shadow-card">
        <CardContent className="flex flex-col items-center justify-between gap-4 pt-6 lg:flex-row">
          <div className="relative w-full lg:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, documento ou cidade..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
            <div className="flex w-full rounded-lg bg-muted p-1 sm:w-auto">
              {(["Ambos", "Clientes", "Fornecedores"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAba(t)}
                  className={cn(
                    "flex-1 rounded-md px-4 py-1.5 text-sm font-medium transition-all sm:flex-none sm:px-5",
                    aba === t
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={soAtivos}
                onChange={(e) => setSoAtivos(e.target.checked)}
                className="size-4 rounded accent-[var(--primary)]"
              />
              Só ativos
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="overflow-x-auto pt-6">
          <Table className="min-w-[48rem]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Documento</TableHead>
                <TableHead>Nome fantasia</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Total em aberto</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((p) => {
                const aberto = emAbertoDoParceiro(p.id);
                const Icone = iconePorTipo[p.tipo];
                return (
                  <TableRow key={p.id} className={cn(!p.ativo && "opacity-60")}>
                    <TableCell className="num text-sm">{p.documento}</TableCell>
                    <TableCell>
                      <span className="block font-medium">{p.nomeFantasia}</span>
                      <span className="block max-w-[22rem] truncate text-xs text-muted-foreground">
                        {p.razaoSocial} · {p.cidade}/{p.uf}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        <Icone className="size-3.5" />
                        {p.tipo}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "num text-right font-medium",
                        aberto > 0 ? "text-destructive" : "text-muted-foreground",
                      )}
                    >
                      {brl(aberto)}
                    </TableCell>
                    <TableCell className="text-center">
                      {p.ativo ? (
                        aberto > 0 ? (
                          <StatusBadge tone="danger">Com pendência</StatusBadge>
                        ) : (
                          <StatusBadge tone="success">Ativo</StatusBadge>
                        )
                      ) : (
                        <StatusBadge tone="neutral">Inativo</StatusBadge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {leitura ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Editar"
                            onClick={() => abrirEdicao(p)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          {p.ativo ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Inativar"
                              className="hover:text-destructive"
                              onClick={() => setInativando(p)}
                            >
                              <Ban className="size-4" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Reativar"
                              className="hover:text-success"
                              onClick={() => {
                                reativarParceiro(p.id, perfil.usuario);
                                registrar({
                                  tipo: "crud",
                                  entidade: "Parceiro",
                                  operacao: "Reativar",
                                  detalhe: `${p.razaoSocial} reativado`,
                                  usuario: perfil.usuario,
                                  empresa: nomeAtual,
                                });
                                toast.success(`${p.nomeFantasia} reativado`);
                              }}
                            >
                              <RotateCcw className="size-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {lista.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum cadastro encontrado.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              Mostrando {lista.length} de {parceiros.length} registros
            </span>
            <span className="flex flex-col text-right">
              <span className="text-[0.68rem] font-bold uppercase tracking-wide text-muted-foreground">
                Total em aberto na visão
              </span>
              <span className="num font-bold">{brl(totalEmAberto)}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      <Sheet open={sheetAberto} onOpenChange={setSheetAberto}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {editando ? `Editar ${editando.nomeFantasia}` : "Novo cadastro"}
            </SheetTitle>
            <SheetDescription>
              Informe o CNPJ e use “Buscar” para preencher a razão social automaticamente.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-doc">CNPJ / CPF *</Label>
                <div className="flex gap-2">
                  <Input
                    id="p-doc"
                    className="num"
                    placeholder="00.000.000/0001-00"
                    value={form.documento}
                    onChange={(e) => setForm((f) => ({ ...f, documento: e.target.value }))}
                  />
                  <Button
                    variant="secondary"
                    className="shrink-0 gap-1.5"
                    onClick={() => consultarCnpj(form.documento)}
                  >
                    <Search className="size-4" /> Buscar
                  </Button>
                </div>
                {cnpjBuscado ? (
                  <p className="flex items-center gap-1.5 text-xs text-success">
                    <BadgeCheck className="size-3.5" />
                    Dados preenchidos a partir da base cadastral.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    CNPJs disponíveis na base mock:{" "}
                    {cnpjSugeridos.map((c, i) => (
                      <span key={c}>
                        {i > 0 ? ", " : ""}
                        <button
                          type="button"
                          onClick={() => {
                            setForm((f) => ({ ...f, documento: c }));
                            consultarCnpj(c);
                          }}
                          className="num text-primary underline decoration-dotted"
                        >
                          {c}
                        </button>
                      </span>
                    ))}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="p-razao">Razão social *</Label>
                <Input
                  id="p-razao"
                  value={form.razaoSocial}
                  onChange={(e) => setForm((f) => ({ ...f, razaoSocial: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-fantasia">Nome fantasia</Label>
                <Input
                  id="p-fantasia"
                  value={form.nomeFantasia}
                  onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-tipo">Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as TipoParceiro }))}
                >
                  <SelectTrigger id="p-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-email">E-mail *</Label>
                <Input
                  id="p-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-tel">Telefone</Label>
                <Input
                  id="p-tel"
                  className="num"
                  placeholder="(00) 0000-0000"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-cidade">Cidade</Label>
                <Input
                  id="p-cidade"
                  value={form.cidade}
                  onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="p-uf">UF</Label>
                <Input
                  id="p-uf"
                  maxLength={2}
                  className="num"
                  value={form.uf}
                  onChange={(e) => setForm((f) => ({ ...f, uf: e.target.value.toUpperCase() }))}
                />
              </div>
            </div>

            {editando ? (
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <History className="size-4 text-muted-foreground" />
                  Histórico de alterações
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {editando.historico.map((h, i) => (
                    <li key={i} className="flex flex-wrap gap-2 text-xs">
                      <span className="num shrink-0 text-muted-foreground">{h.data}</span>
                      <span>{h.descricao}</span>
                      <span className="ml-auto shrink-0 text-muted-foreground">{h.usuario}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setSheetAberto(false)}>
                Cancelar
              </Button>
              <Button disabled={!formOk} onClick={salvar} className="gap-1.5">
                <Save className="size-4" />
                {editando ? "Salvar alterações" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Inativação */}
      <Dialog open={!!inativando} onOpenChange={(o) => !o && setInativando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-destructive" />
              Inativar cadastro
            </DialogTitle>
            <DialogDescription>
              Você está prestes a inativar <strong>{inativando?.razaoSocial}</strong>.
            </DialogDescription>
          </DialogHeader>

          {bloqueio > 0 ? (
            <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/8 p-4">
              <Ban className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-destructive">
                  Inativação bloqueada — títulos em aberto
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Este parceiro possui{" "}
                  <strong className="num text-destructive">{brl(bloqueio)}</strong> em títulos não
                  liquidados. Liquide ou cancele os títulos antes de inativar o cadastro.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 rounded-lg border border-border bg-muted/50 p-4">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                O cadastro deixa de aparecer nos formulários de lançamento, mas continua visível na
                listagem. Você poderá desfazer a ação por 10 segundos.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setInativando(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={bloqueio > 0} onClick={confirmarInativacao}>
              Sim, inativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
