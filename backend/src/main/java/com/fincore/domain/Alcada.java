package com.fincore.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Nível da escada de aprovação: até o limite, o titular decide. Cadastro em /alcadas. */
@Entity
public class Alcada {
    @Id
    private String id;
    private String perfil;
    private String titular;
    private double limite;
    private String substituto;

    /** Exigido pelo JPA. */
    protected Alcada() {
    }

    public Alcada(String perfil, String titular, double limite) {
        this.perfil = perfil;
        this.titular = titular;
        this.limite = limite;
    }

    public String getId() {
        return id;
    }

    public String getPerfil() {
        return perfil;
    }

    public String getTitular() {
        return titular;
    }

    public double getLimite() {
        return limite;
    }

    public String getSubstituto() {
        return substituto;
    }

    /** Valores acima do limite precisam de um nível mais alto. */
    public boolean exigeAprovacao(double valor) {
        return valor > limite;
    }
}
