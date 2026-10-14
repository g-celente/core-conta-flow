package com.fincore.pattern.planodecontas;

import com.fincore.domain.ContaPlano;
import java.util.List;

/** Factory Method — ConcreteProduct: Lucro Real (PIS/COFINS não cumulativo, com créditos a recuperar). */
public class EnquadramentoLucroReal implements EnquadramentoTributario {

    public String regime() {
        return "Lucro Real";
    }

    public List<ContaPlano> contasTributarias() {
        return List.of(
                new ContaPlano("2.1.2.1.05", "IRPJ/CSLL sobre Lucro Real a Recolher", 2, "ANALÍTICA", 289400.0, "Passivo"),
                new ContaPlano("2.1.2.1.06", "PIS/COFINS Não Cumulativo a Recolher", 2, "ANALÍTICA", 176900.0, "Passivo"),
                new ContaPlano("1.1.3.1.01", "Créditos de PIS/COFINS a Recuperar", 2, "ANALÍTICA", 98300.0, "Ativo"));
    }

    public String descricaoApuracao() {
        return "IRPJ/CSLL sobre o lucro contábil ajustado e PIS/COFINS não cumulativo com créditos.";
    }
}
