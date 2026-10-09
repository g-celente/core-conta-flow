package com.fincore.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

/** Conta do plano de contas. */
@Entity
public class ContaPlano {
    @Id
    private String id;
    private String codigo;
    private String descricao;
    private int nivel;
    private String tipo;
    private double saldo;
    private String grupo;

    /** Exigido pelo JPA. */
    protected ContaPlano() {
    }

    public ContaPlano(String codigo, String descricao, int nivel, String tipo, double saldo, String grupo) {
        this.codigo = codigo;
        this.descricao = descricao;
        this.nivel = nivel;
        this.tipo = tipo;
        this.saldo = saldo;
        this.grupo = grupo;
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

    public int getNivel() {
        return nivel;
    }

    public String getTipo() {
        return tipo;
    }

    public double getSaldo() {
        return saldo;
    }

    public String getGrupo() {
        return grupo;
    }
}
