package com.fincore.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import java.util.ArrayList;
import java.util.List;

/** Cliente ou fornecedor. Inativar é uma edição (o histórico guarda o motivo). */
@Entity
public class Parceiro {
    @Id
    private String id;
    private String documento;
    private String razaoSocial;
    private String nomeFantasia;
    private String tipo;
    private String email;
    private String telefone;
    private String cidade;
    private String uf;
    private double emAberto;
    private boolean ativo;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "parceiro_historico", joinColumns = @JoinColumn(name = "parceiro_id"))
    @OrderColumn(name = "ordem")
    private List<Alteracao> historico = new ArrayList<>();

    /** Exigido pelo JPA. */
    protected Parceiro() {
    }

    public String getId() {
        return id;
    }

    public String getDocumento() {
        return documento;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public String getTipo() {
        return tipo;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefone() {
        return telefone;
    }

    public String getCidade() {
        return cidade;
    }

    public String getUf() {
        return uf;
    }

    public double getEmAberto() {
        return emAberto;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public List<Alteracao> getHistorico() {
        return historico;
    }
}
