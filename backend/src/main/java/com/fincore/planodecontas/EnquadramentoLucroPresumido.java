package com.fincore.planodecontas;

import com.fincore.dominio.ContaPlano;
import java.util.List;

/** Factory Method — ConcreteProduct: Lucro Presumido (IRPJ/CSLL presumidos e PIS/COFINS cumulativo). */
public class EnquadramentoLucroPresumido implements EnquadramentoTributario {

    public String regime() {
        return "Lucro Presumido";
    }

    public List<ContaPlano> contasTributarias() {
        return List.of(
                new ContaPlano("2.1.2.1.03", "IRPJ/CSLL sobre Presunção a Recolher", 2, "ANALÍTICA", 118400.0, "Passivo"),
                new ContaPlano("2.1.2.1.04", "PIS/COFINS Cumulativo a Recolher", 2, "ANALÍTICA", 64200.0, "Passivo"));
    }

    public String descricaoApuracao() {
        return "IRPJ/CSLL sobre base presumida da receita e PIS/COFINS no regime cumulativo.";
    }
}
