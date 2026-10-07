package com.fincore.planodecontas;

/** Factory Method — ConcreteCreator: plano de contas dos tenants do Lucro Real. */
public class MontadorPlanoLucroReal extends MontadorPlanoDeContas {

    @Override
    protected EnquadramentoTributario criarEnquadramento() {
        return new EnquadramentoLucroReal();
    }
}
