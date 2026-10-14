package com.fincore.domain;

/** Pedido de aprovação de um título: o que a escada de alçadas precisa para decidir. */
public class PedidoAprovacao {
    private final String documento;
    private final double valor;
    private final String solicitante;

    public PedidoAprovacao(String documento, double valor, String solicitante) {
        this.documento = documento;
        this.valor = valor;
        this.solicitante = solicitante;
    }

    public String getDocumento() {
        return documento;
    }

    public double getValor() {
        return valor;
    }

    public String getSolicitante() {
        return solicitante;
    }

    public boolean foiLancadoPor(String usuario) {
        return solicitante.equals(usuario);
    }
}
