package com.fincore.pattern.extrato;

/** Factory Method — ConcreteCreator: importador dos tenants com adaptador OFX. */
public class ImportadorOfx extends ImportadorExtrato {

    @Override
    protected LeitorExtrato criarLeitor() {
        return new LeitorOfx();
    }
}
