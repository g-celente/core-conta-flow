import { createFileRoute } from "@tanstack/react-router";
import { TelaCadastro } from "@/components/app/TelaCadastro";
import type { Usuario } from "@/lib/mock-data";

export const Route = createFileRoute("/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — FinCore" }] }),
  component: Usuarios,
});

function Usuarios() {
  return (
    <TelaCadastro<Usuario>
      titulo="Usuários"
      descricao="Pessoas que respondem por centros de custo e alçadas de aprovação."
      recurso="usuarios"
      campos={[
        { nome: "nome", rotulo: "Nome", tipo: "texto" },
        { nome: "email", rotulo: "E-mail", tipo: "texto" },
        {
          nome: "perfil",
          rotulo: "Perfil de acesso",
          tipo: "opcoes",
          opcoes: ["operador", "aprovador", "contador", "implantador"],
        },
        { nome: "ativo", rotulo: "Ativo", tipo: "ativo" },
      ]}
      novo={() => ({
        id: crypto.randomUUID(),
        nome: "",
        email: "",
        perfil: "operador",
        ativo: true,
      })}
    />
  );
}
