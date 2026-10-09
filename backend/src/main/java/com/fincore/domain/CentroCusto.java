package com.fincore.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Centro de custo, com o rateio padrão sugerido no formulário de títulos. */
@Entity
public class CentroCusto {
    @Id
    private String id;
    private String codigo;
    private String descricao;
    private String responsavel;
    private double rateio;
    private double mes;

    /** Exigido pelo JPA. */
    protected CentroCusto() {
    }

    public String getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getResponsavel() {
        return responsavel;
    }

    public double getRateio() {
        return rateio;
    }

    public double getMes() {
        return mes;
    }
}
