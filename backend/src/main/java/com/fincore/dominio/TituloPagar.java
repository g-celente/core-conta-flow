package com.fincore.dominio;

import java.util.List;

/** Título a pagar, com os campos que os fluxos de validação e de baixa usam. */
public class TituloPagar {
    private final String documento;
    private final String parceiroId;
    private final String vencimento;
    private final double valor;
    private final Rateio rateio;

    public TituloPagar(String documento, String parceiroId, String vencimento, double valor, Rateio rateio) {
        this.documento = documento;
        this.parceiroId = parceiroId;
        this.vencimento = vencimento;
        this.valor = valor;
        this.rateio = rateio;
    }

    /** Título conhecido só pelo documento e pelo valor (é o que a baixa usa). */
    public TituloPagar(String documento, double valor) {
        this(documento, "", "", valor, new Rateio(List.of()));
    }

    public String getDocumento() {
        return documento;
    }

    public String getParceiroId() {
        return parceiroId;
    }

    public String getVencimento() {
        return vencimento;
    }

    public double getValor() {
        return valor;
    }

    public Rateio getRateio() {
        return rateio;
    }

    public boolean temValorPositivo() {
        return valor > 0;
    }
}
