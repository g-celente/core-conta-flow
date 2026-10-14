package com.fincore.domain;

import java.text.NumberFormat;
import java.util.Locale;

/** Formata valores em reais, como o `brl` do frontend. */
public final class Moeda {

    public static String brl(double valor) {
        return NumberFormat.getCurrencyInstance(Locale.of("pt", "BR")).format(valor);
    }
}
