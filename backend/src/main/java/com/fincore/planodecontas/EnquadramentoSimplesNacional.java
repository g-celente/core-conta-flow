package com.fincore.planodecontas;

import com.fincore.dominio.ContaPlano;
import java.util.List;

/** Factory Method — ConcreteProduct: Simples Nacional, com guia única DAS. */
public class EnquadramentoSimplesNacional implements EnquadramentoTributario {

    public String regime() {
        return "Simples Nacional";
    }

    public List<ContaPlano> contasTributarias() {
        return List.of(
                new ContaPlano("2.1.2.1.02", "DAS — Simples Nacional a Recolher", 2, "ANALÍTICA", 42800.0, "Passivo"));
    }

    public String descricaoApuracao() {
        return "Tributos unificados na guia DAS, com alíquota sobre a receita bruta.";
    }
}
