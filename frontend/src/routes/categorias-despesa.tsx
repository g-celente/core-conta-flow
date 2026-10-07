import { createFileRoute } from "@tanstack/react-router";
import { TelaCadastro } from "@/components/app/TelaCadastro";
import type { CategoriaDespesa } from "@/lib/mock-data";

export const Route = createFileRoute("/categorias-despesa")({
  head: () => ({ meta: [{ title: "Categorias de despesa — FinCore" }] }),
  component: CategoriasDespesa,
});

function CategoriasDespesa() {
  return (
    <TelaCadastro<CategoriaDespesa>
      titulo="Categorias de despesa"
      descricao="Categorias oferecidas no lançamento de contas a pagar."
      recurso="categorias-despesa"
      campos={[
        { nome: "nome", rotulo: "Nome", tipo: "texto" },
        { nome: "ativa", rotulo: "Ativa", tipo: "ativo" },
      ]}
      novo={() => ({ id: crypto.randomUUID(), nome: "", ativa: true })}
    />
  );
}
