package com.fincore.aprovacao;

import com.fincore.Moeda;
import com.fincore.dominio.Alcada;
import com.fincore.dominio.PedidoAprovacao;

/** Chain of Responsibility — ConcreteHandler: um nível da escada; assume se o valor cabe no limite. */
public class AprovadorPorAlcada extends AprovadorDeTitulo {
    private final Alcada alcada;

    public AprovadorPorAlcada(Alcada alcada) {
        this.alcada = alcada;
    }

    @Override
    protected boolean assume(PedidoAprovacao pedido) {
        return !alcada.exigeAprovacao(pedido.getValor());
    }

    @Override
    protected DecisaoAprovacao decidir(PedidoAprovacao pedido) {
        boolean propria = pedido.foiLancadoPor(alcada.getTitular());
        String motivo = propria
                ? "dentro da alçada de " + Moeda.brl(alcada.getLimite()) + " de " + alcada.getTitular()
                : Moeda.brl(pedido.getValor()) + " acima da alçada de quem lançou — encaminhado a "
                        + alcada.getTitular() + " (" + alcada.getPerfil() + ", limite "
                        + Moeda.brl(alcada.getLimite()) + ")";
        return new DecisaoAprovacao(alcada.getPerfil(), alcada.getTitular(), !propria, motivo);
    }
}
