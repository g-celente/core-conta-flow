package com.fincore.pattern.aprovacao;

import com.fincore.domain.Moeda;
import com.fincore.domain.PedidoAprovacao;
import java.util.List;

/** Chain of Responsibility — ConcreteHandler: elo final; assume o que nenhuma alçada cobre. */
public class ComiteFinanceiro extends AprovadorDeTitulo {
    private final List<String> assinaturas;

    public ComiteFinanceiro(List<String> assinaturas) {
        this.assinaturas = assinaturas;
    }

    @Override
    protected boolean assume(PedidoAprovacao pedido) {
        return true;
    }

    @Override
    protected DecisaoAprovacao decidir(PedidoAprovacao pedido) {
        return new DecisaoAprovacao("Comitê financeiro", String.join(" + ", assinaturas), true,
                Moeda.brl(pedido.getValor()) + " acima de todas as alçadas — exige "
                        + assinaturas.size() + " assinaturas em comitê");
    }
}
