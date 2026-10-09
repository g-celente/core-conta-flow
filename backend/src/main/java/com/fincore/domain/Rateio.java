package com.fincore.domain;

import java.util.List;

/** Distribuição de um título entre centros de custo. */
public class Rateio {
    private final List<LinhaRateio> linhas;

    public Rateio(List<LinhaRateio> linhas) {
        this.linhas = linhas;
    }

    public List<LinhaRateio> getLinhas() {
        return linhas;
    }

    public double somaPercentual() {
        return linhas.stream().mapToDouble(LinhaRateio::getPercentual).sum();
    }

    /** O rateio só pode ser salvo quando soma exatamente 100%. */
    public boolean estaCompleto() {
        return somaPercentual() == 100;
    }
}
