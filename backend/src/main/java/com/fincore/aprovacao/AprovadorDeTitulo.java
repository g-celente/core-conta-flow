package com.fincore.aprovacao;

import com.fincore.dominio.PedidoAprovacao;

/**
 * Chain of Responsibility — Handler: guarda o próximo elo. O primeiro elo que assumir o pedido
 * decide e encerra a corrente; os demais apenas repassam, sem saber quem vem depois.
 */
public abstract class AprovadorDeTitulo {
    private AprovadorDeTitulo proximo;

    /** Encadeia e devolve o elo recebido, para montar a corrente em sequência. */
    public AprovadorDeTitulo encadear(AprovadorDeTitulo proximo) {
        this.proximo = proximo;
        return proximo;
    }

    /** Percorre a corrente; devolve null se nenhum elo assumir o pedido. */
    public DecisaoAprovacao analisar(PedidoAprovacao pedido) {
        if (assume(pedido)) {
            return decidir(pedido);
        }
        return proximo == null ? null : proximo.analisar(pedido);
    }

    /** Este elo assume o pedido? */
    protected abstract boolean assume(PedidoAprovacao pedido);

    /** Decisão do elo que assumiu. */
    protected abstract DecisaoAprovacao decidir(PedidoAprovacao pedido);
}
