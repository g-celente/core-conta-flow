package com.fincore.planodecontas;

/** Factory Method — ConcreteCreator: plano de contas dos tenants do Lucro Presumido. */
public class MontadorPlanoLucroPresumido extends MontadorPlanoDeContas {

    @Override
    protected EnquadramentoTributario criarEnquadramento() {
        return new EnquadramentoLucroPresumido();
    }
}
