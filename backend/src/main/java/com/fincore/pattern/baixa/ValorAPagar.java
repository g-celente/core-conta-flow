package com.fincore.pattern.baixa;

import java.util.List;

/** Decorator — Component: valor devido de um título, que pode receber ajustes em camadas. */
public interface ValorAPagar {
    double valor();

    /** Uma linha por camada, explicando como o valor foi composto. */
    List<String> composicao();
}
