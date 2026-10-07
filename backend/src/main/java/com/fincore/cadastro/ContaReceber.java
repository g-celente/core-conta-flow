package com.fincore.cadastro;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Título a receber, com os dias de atraso usados no aging. */
@Entity
public class ContaReceber {
    @Id
    private String id;
    private String documento;
    private String cliente;
    private String categoria;
    private String vencimento;
    private double valor;
    private int atraso;
    private String status;

    /** Exigido pelo JPA. */
    protected ContaReceber() {
    }

    public String getId() {
        return id;
    }

    public String getDocumento() {
        return documento;
    }

    public String getCliente() {
        return cliente;
    }

    public String getCategoria() {
        return categoria;
    }

    public String getVencimento() {
        return vencimento;
    }

    public double getValor() {
        return valor;
    }

    public int getAtraso() {
        return atraso;
    }

    public String getStatus() {
        return status;
    }
}
