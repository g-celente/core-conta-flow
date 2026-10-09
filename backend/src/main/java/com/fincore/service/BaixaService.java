package com.fincore.service;

import com.fincore.domain.BaixaTitulo;
import com.fincore.domain.TituloPagar;
import com.fincore.pattern.baixa.AbatimentoDesconto;
import com.fincore.pattern.baixa.AcrescimoJurosMulta;
import com.fincore.pattern.baixa.ValorAPagar;
import com.fincore.pattern.baixa.ValorOriginal;
import org.springframework.stereotype.Service;

/** Decorator — cliente: envolve o valor original com um decorador para cada ajuste informado. */
@Service
public class BaixaService {

    public ValorAPagar valorDevido(TituloPagar titulo, BaixaTitulo baixa) {
        ValorAPagar valor = new ValorOriginal(titulo);
        if (baixa.temJuros()) {
            valor = new AcrescimoJurosMulta(valor, baixa.getJuros());
        }
        if (baixa.temDesconto()) {
            valor = new AbatimentoDesconto(valor, baixa.getDesconto());
        }
        return valor;
    }
}
