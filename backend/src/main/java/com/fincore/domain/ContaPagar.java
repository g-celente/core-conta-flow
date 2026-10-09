package com.fincore.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import java.util.ArrayList;
import java.util.List;

/** Título a pagar. Aprovar, devolver, cancelar e baixar são edições do mesmo registro. */
@Entity
public class ContaPagar {
    @Id
    private String id;
    private String documento;
    private String parceiroId;
    private String fornecedor;
    private String categoria;
    private String vencimento;
    private double valor;
    private String status;
    private String parcela;
    private String recorrencia;
    private String origem;
    private String lancadoPor;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "conta_pagar_rateio", joinColumns = @JoinColumn(name = "conta_pagar_id"))
    @OrderColumn(name = "ordem")
    private List<LinhaRateio> rateio = new ArrayList<>();

    /** Nula enquanto o título não tem baixa. */
    @Embedded
    private BaixaTitulo baixa;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "conta_pagar_historico", joinColumns = @JoinColumn(name = "conta_pagar_id"))
    @OrderColumn(name = "ordem")
    private List<Alteracao> historico = new ArrayList<>();

    /** Exigido pelo JPA. */
    protected ContaPagar() {
    }

    public String getId() {
        return id;
    }

    public String getDocumento() {
        return documento;
    }

    public String getParceiroId() {
        return parceiroId;
    }

    public String getFornecedor() {
        return fornecedor;
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

    public String getStatus() {
        return status;
    }

    public String getParcela() {
        return parcela;
    }

    public String getRecorrencia() {
        return recorrencia;
    }

    public String getOrigem() {
        return origem;
    }

    public String getLancadoPor() {
        return lancadoPor;
    }

    public List<LinhaRateio> getRateio() {
        return rateio;
    }

    public BaixaTitulo getBaixa() {
        return baixa;
    }

    public List<Alteracao> getHistorico() {
        return historico;
    }
}
