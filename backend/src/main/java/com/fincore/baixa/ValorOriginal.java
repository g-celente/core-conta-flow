package com.fincore.baixa;

import com.fincore.Moeda;
import com.fincore.dominio.TituloPagar;
import java.util.List;

/** Decorator — ConcreteComponent: valor original do título, sem acréscimos nem abatimentos. */
public class ValorOriginal implements ValorAPagar {
    private final TituloPagar titulo;

    public ValorOriginal(TituloPagar titulo) {
        this.titulo = titulo;
    }

    public double valor() {
        return titulo.getValor();
    }

    public List<String> composicao() {
        return List.of("Valor original do título " + titulo.getDocumento() + ": " + Moeda.brl(titulo.getValor()));
    }
}
