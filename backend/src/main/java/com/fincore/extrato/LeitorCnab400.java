package com.fincore.extrato;

import com.fincore.dominio.ArquivoExtrato;
import com.fincore.dominio.LinhaExtrato;
import java.util.ArrayList;
import java.util.List;

/**
 * Factory Method — ConcreteProduct: lê o retorno CNAB 400 (padrão legado). Layout simplificado
 * do detalhe: "1" · data DDMMAA · natureza C/D · valor em centavos (13 dígitos) · histórico.
 */
public class LeitorCnab400 implements LeitorExtrato {

    public String formato() {
        return "CNAB400";
    }

    public String extensao() {
        return ".txt";
    }

    public String descricao() {
        return "Febraban CNAB 400 (remessa e retorno legado)";
    }

    public List<LinhaExtrato> lerLinhas(ArquivoExtrato arquivo) {
        List<String> registros = arquivo.registros();
        List<LinhaExtrato> linhas = new ArrayList<>();
        for (int i = 0; i < registros.size(); i++) {
            if (registros.get(i).startsWith("1")) {
                linhas.add(converter(registros.get(i), i + 1));
            }
        }
        return linhas;
    }

    private LinhaExtrato converter(String registro, int linha) {
        String valor = registro.substring(8, 21);
        boolean valido = valor.matches("\\d{13}");
        LinhaExtrato lida = new LinhaExtrato(
                linha,
                registro.substring(1, 3) + "/" + registro.substring(3, 5) + "/20" + registro.substring(5, 7),
                registro.substring(21),
                valido ? Long.parseLong(valor) / 100.0 : 0,
                registro.charAt(7) == 'C' ? "Crédito" : "Débito");
        return valido ? lida : lida.rejeitar("Campo de valor inválido no registro de detalhe.");
    }
}
