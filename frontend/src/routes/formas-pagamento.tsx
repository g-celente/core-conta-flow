import { createFileRoute } from "@tanstack/react-router";
import { TelaCadastro } from "@/components/app/TelaCadastro";
import type { FormaPagamento } from "@/lib/mock-data";

export const Route = createFileRoute("/formas-pagamento")({
  head: () => ({ meta: [{ title: "Formas de pagamento — FinCore" }] }),
  component: FormasPagamento,
});

function FormasPagamento() {
  return (
    <TelaCadastro<FormaPagamento>
      titulo="Formas de pagamento"
      descricao="Formas oferecidas na baixa de pagamento."
      recurso="formas-pagamento"
      campos={[
        { nome: "nome", rotulo: "Nome", tipo: "texto" },
        { nome: "ativa", rotulo: "Ativa", tipo: "ativo" },
      ]}
      novo={() => ({ id: crypto.randomUUID(), nome: "", ativa: true })}
    />
  );
}
