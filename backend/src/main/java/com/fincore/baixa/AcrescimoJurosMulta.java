package com.fincore.baixa;

import com.fincore.Moeda;
import java.util.ArrayList;
import java.util.List;

/** Decorator — ConcreteDecorator: soma juros ou multa ao valor envolvido. */
public class AcrescimoJurosMulta extends AjusteDeValor {
    private final double acrescimo;

    public AcrescimoJurosMulta(ValorAPagar componente, double acrescimo) {
        super(componente);
        this.acrescimo = acrescimo;
    }

    @Override
    public double valor() {
        return arredondar(super.valor() + acrescimo);
    }

    @Override
    public List<String> composicao() {
        List<String> linhas = new ArrayList<>(super.composicao());
        linhas.add("(+) Juros / multa: " + Moeda.brl(acrescimo));
        return linhas;
    }
}
