package com.fincore.domain;

import jakarta.persistence.Embeddable;

/** Parte de um rateio: percentual do título destinado a um centro de custo. */
@Embeddable
public class LinhaRateio {
    private String centroId;
    private double percentual;

    /** Exigido pelo JPA. */
    protected LinhaRateio() {
    }

    public LinhaRateio(String centroId, double percentual) {
        this.centroId = centroId;
        this.percentual = percentual;
    }

    public String getCentroId() {
        return centroId;
    }

    public double getPercentual() {
        return percentual;
    }
}
