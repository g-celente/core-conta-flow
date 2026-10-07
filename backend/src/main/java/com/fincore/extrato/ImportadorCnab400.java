package com.fincore.extrato;

/** Factory Method — ConcreteCreator: importador dos tenants com adaptador CNAB 400. */
public class ImportadorCnab400 extends ImportadorExtrato {

    @Override
    protected LeitorExtrato criarLeitor() {
        return new LeitorCnab400();
    }
}
