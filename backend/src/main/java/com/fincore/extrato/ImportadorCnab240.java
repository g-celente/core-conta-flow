package com.fincore.extrato;

/** Factory Method — ConcreteCreator: importador dos tenants com adaptador CNAB 240. */
public class ImportadorCnab240 extends ImportadorExtrato {

    @Override
    protected LeitorExtrato criarLeitor() {
        return new LeitorCnab240();
    }
}
