package com.fincore.pattern.extrato;

import com.fincore.domain.ArquivoExtrato;
import com.fincore.domain.LinhaExtrato;
import java.util.ArrayList;
import java.util.List;

/**
 * Factory Method — ConcreteProduct: lê o retorno CNAB 240. Layout simplificado do detalhe:
 * "3E" · data DDMMAAAA · valor em centavos (15 dígitos) · natureza C/D · histórico.
 */
public class LeitorCnab240 implements LeitorExtrato {

    public String formato() {
        return "CNAB240";
    }

    public String extensao() {
        return ".ret";
    }

    public String descricao() {
        return "Febraban CNAB 240 (remessa e retorno detalhado)";
    }

    public List<LinhaExtrato> lerLinhas(ArquivoExtrato arquivo) {
        List<String> registros = arquivo.registros();
        List<LinhaExtrato> linhas = new ArrayList<>();
        for (int i = 0; i < registros.size(); i++) {
            if (registros.get(i).startsWith("3E")) {
                linhas.add(converter(registros.get(i), i + 1));
            }
        }
        return linhas;
    }

    private LinhaExtrato converter(String registro, int linha) {
        String valor = registro.substring(10, 25);
        boolean valido = valor.matches("\\d{15}");
        LinhaExtrato lida = new LinhaExtrato(
                linha,
                registro.substring(2, 4) + "/" + registro.substring(4, 6) + "/" + registro.substring(6, 10),
                registro.substring(26),
                valido ? Long.parseLong(valor) / 100.0 : 0,
                registro.charAt(25) == 'C' ? "Crédito" : "Débito");
        return valido ? lida : lida.rejeitar("Campo de valor inválido no segmento E.");
    }
}
