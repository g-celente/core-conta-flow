package com.fincore.baixa;

import java.util.List;

/**
 * Decorator — Decorator: envolve outro ValorAPagar com a mesma interface e repassa as chamadas;
 * cada ajuste concreto acrescenta o seu efeito sobre o valor envolvido.
 */
public abstract class AjusteDeValor implements ValorAPagar {
    protected final ValorAPagar componente;

    protected AjusteDeValor(ValorAPagar componente) {
        this.componente = componente;
    }

    public double valor() {
        return componente.valor();
    }

    public List<String> composicao() {
        return componente.composicao();
    }

    /** Arredonda para centavos, evitando resíduos de ponto flutuante entre as camadas. */
    protected double arredondar(double valor) {
        return Math.round(valor * 100) / 100.0;
    }
}
