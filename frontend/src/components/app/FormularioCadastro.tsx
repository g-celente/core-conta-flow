import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/** Um campo do formulário: o nome do atributo, o rótulo e o tipo de entrada. */
export type Campo = {
  nome: string;
  rotulo: string;
  tipo: "texto" | "numero" | "opcoes" | "ativo";
  opcoes?: string[];
};

type Props<T> = {
  titulo: string;
  campos: Campo[];
  registro: T;
  aoSalvar: (registro: T) => void;
  aoFechar: () => void;
};

/** Formulário genérico de cadastro: uma entrada por item de `campos`. */
export function FormularioCadastro<T extends { id: string }>({
  titulo,
  campos,
  registro,
  aoSalvar,
  aoFechar,
}: Props<T>) {
  const [valores, setValores] = useState<Record<string, unknown>>({ ...registro });
  const mudar = (nome: string, valor: unknown) => setValores((v) => ({ ...v, [nome]: valor }));
  const incompleto = campos.some(
    (c) => c.tipo === "texto" && !String(valores[c.nome] ?? "").trim(),
  );

  return (
    <Dialog open onOpenChange={(aberto) => (aberto ? null : aoFechar())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {campos.map((c) => (
            <div key={c.nome} className="space-y-1.5">
              <Label htmlFor={`cad-${c.nome}`}>{c.rotulo}</Label>
              {c.tipo === "opcoes" ? (
                <Select
                  value={String(valores[c.nome] ?? "")}
                  onValueChange={(v) => mudar(c.nome, v)}
                >
                  <SelectTrigger id={`cad-${c.nome}`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(c.opcoes ?? []).map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : c.tipo === "ativo" ? (
                <Switch
                  id={`cad-${c.nome}`}
                  checked={Boolean(valores[c.nome])}
                  onCheckedChange={(v) => mudar(c.nome, v)}
                />
              ) : (
                <Input
                  id={`cad-${c.nome}`}
                  type={c.tipo === "numero" ? "number" : "text"}
                  value={String(valores[c.nome] ?? "")}
                  onChange={(e) =>
                    mudar(c.nome, c.tipo === "numero" ? Number(e.target.value) : e.target.value)
                  }
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button disabled={incompleto} onClick={() => aoSalvar({ ...registro, ...valores })}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
