package com.fincore.pattern.baixa;

import com.fincore.domain.Moeda;
import java.util.ArrayList;
import java.util.List;

/** Decorator — ConcreteDecorator: subtrai um desconto do valor envolvido. */
public class AbatimentoDesconto extends AjusteDeValor {
    private final double desconto;

    public AbatimentoDesconto(ValorAPagar componente, double desconto) {
        super(componente);
        this.desconto = desconto;
    }

    @Override
    public double valor() {
        return arredondar(super.valor() - desconto);
    }

    @Override
    public List<String> composicao() {
        List<String> linhas = new ArrayList<>(super.composicao());
        linhas.add("(−) Desconto: " + Moeda.brl(desconto));
        return linhas;
    }
}
