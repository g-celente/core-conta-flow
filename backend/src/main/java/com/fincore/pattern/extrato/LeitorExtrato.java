package com.fincore.pattern.extrato;

import com.fincore.domain.ArquivoExtrato;
import com.fincore.domain.LinhaExtrato;
import java.util.List;

/** Factory Method — Product: contrato comum dos leitores de arquivo bancário. */
public interface LeitorExtrato {
    String formato();

    /** Extensão aceita pelo adaptador (exibida na tela de importação). */
    String extensao();

    String descricao();

    /** Converte o arquivo em linhas; problemas de layout vêm marcados em `erro`. */
    List<LinhaExtrato> lerLinhas(ArquivoExtrato arquivo);
}
