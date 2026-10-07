package com.fincore.planodecontas;

/** Factory Method — ConcreteCreator: plano de contas dos tenants do Simples Nacional. */
public class MontadorPlanoSimplesNacional extends MontadorPlanoDeContas {

    @Override
    protected EnquadramentoTributario criarEnquadramento() {
        return new EnquadramentoSimplesNacional();
    }
}
