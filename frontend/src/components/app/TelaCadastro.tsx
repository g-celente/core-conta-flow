import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusBadge } from "@/components/app/StatusBadge";
import { usePerfil } from "@/components/app/PerfilContext";
import { FormularioCadastro, type Campo } from "@/components/app/FormularioCadastro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCadastro } from "@/lib/use-cadastro";

type Props<T> = {
  titulo: string;
  descricao: string;
  /** Final da rota da API, ex.: "formas-pagamento". */
  recurso: string;
  campos: Campo[];
  /** Registro em branco usado pelo botão "Novo". */
  novo: () => T;
};

const exibir = (campo: Campo, valor: unknown) =>
  campo.tipo === "ativo" ? (valor ? "Sim" : "Não") : String(valor ?? "");

/** Tela de cadastro genérica: lista, cria, edita e exclui registros de um recurso da API. */
export function TelaCadastro<T extends { id: string }>({
  titulo,
  descricao,
  recurso,
  campos,
  novo,
}: Props<T>) {
  const { leitura } = usePerfil();
  const { registros, criar, editar, excluir } = useCadastro<T>(recurso);
  const [editando, setEditando] = useState<T | null>(null);
  const [ehNovo, setEhNovo] = useState(false);

  const salvar = async (registro: T) => {
    if (!(await (ehNovo ? criar(registro) : editar(registro)))) return;
    toast.success(ehNovo ? "Registro criado" : "Registro atualizado");
    setEditando(null);
  };

  return (
    <>
      <PageHeader
        titulo={titulo}
        descricao={descricao}
        acoes={
          leitura ? (
            <StatusBadge tone="info">Somente leitura</StatusBadge>
          ) : (
            <Button
              className="gap-1.5"
              onClick={() => {
                setEhNovo(true);
                setEditando(novo());
              }}
            >
              <Plus className="size-4" /> Novo
            </Button>
          )
        }
      />

      <Card className="shadow-card">
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                {campos.map((c) => (
                  <TableHead key={c.nome}>{c.rotulo}</TableHead>
                ))}
                {leitura ? null : <TableHead className="w-24 text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((r) => (
                <TableRow key={r.id}>
                  {campos.map((c) => (
                    <TableCell key={c.nome}>{exibir(c, r[c.nome as keyof T])}</TableCell>
                  ))}
                  {leitura ? null : (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Editar"
                          onClick={() => {
                            setEhNovo(false);
                            setEditando(r);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Excluir"
                          className="hover:text-destructive"
                          onClick={async () => {
                            if (await excluir(r.id)) toast.success("Registro excluído");
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {registros.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={campos.length + 1}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum registro.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editando ? (
        <FormularioCadastro
          titulo={ehNovo ? `Novo registro — ${titulo}` : `Editar — ${titulo}`}
          campos={campos}
          registro={editando}
          aoSalvar={salvar}
          aoFechar={() => setEditando(null)}
        />
      ) : null}
    </>
  );
}
