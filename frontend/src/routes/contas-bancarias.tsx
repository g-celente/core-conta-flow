import { createFileRoute } from "@tanstack/react-router";
import { TelaCadastro } from "@/components/app/TelaCadastro";
import type { ContaBancaria } from "@/lib/mock-data";

export const Route = createFileRoute("/contas-bancarias")({
  head: () => ({ meta: [{ title: "Contas bancárias — FinCore" }] }),
  component: ContasBancarias,
});

function ContasBancarias() {
  return (
    <TelaCadastro<ContaBancaria>
      titulo="Contas bancárias"
      descricao="Contas de saída oferecidas na baixa de pagamento."
      recurso="contas-bancarias"
      campos={[
        { nome: "banco", rotulo: "Banco", tipo: "texto" },
        { nome: "agencia", rotulo: "Agência", tipo: "texto" },
        { nome: "conta", rotulo: "Conta", tipo: "texto" },
        { nome: "descricao", rotulo: "Descrição na baixa", tipo: "texto" },
        { nome: "ativa", rotulo: "Ativa", tipo: "ativo" },
      ]}
      novo={() => ({
        id: crypto.randomUUID(),
        banco: "",
        agencia: "",
        conta: "",
        descricao: "",
        ativa: true,
      })}
    />
  );
}
