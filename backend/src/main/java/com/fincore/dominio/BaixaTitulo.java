package com.fincore.dominio;

import jakarta.persistence.Embeddable;

/** Baixa de um título: quando, quanto, com quais ajustes e por qual conta. */
@Embeddable
public class BaixaTitulo {
    private String data;
    private Double valorPago;
    private Double juros;
    private Double desconto;
    private String conta;

    /** Exigido pelo JPA. */
    protected BaixaTitulo() {
    }

    /** Baixa conhecida só pelos ajustes (é o que o cálculo do valor devido usa). */
    public BaixaTitulo(double juros, double desconto) {
        this.juros = juros;
        this.desconto = desconto;
    }

    public String getData() {
        return data;
    }

    public Double getValorPago() {
        return valorPago;
    }

    public Double getJuros() {
        return juros;
    }

    public Double getDesconto() {
        return desconto;
    }

    public String getConta() {
        return conta;
    }

    public boolean temJuros() {
        return juros > 0;
    }

    public boolean temDesconto() {
        return desconto > 0;
    }
}
