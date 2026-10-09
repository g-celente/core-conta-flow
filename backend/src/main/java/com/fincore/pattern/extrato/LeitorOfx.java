package com.fincore.pattern.extrato;

import com.fincore.domain.ArquivoExtrato;
import com.fincore.domain.LinhaExtrato;
import java.util.ArrayList;
import java.util.List;

/** Factory Method — ConcreteProduct: lê extratos OFX (uma transação <STMTTRN> por linha). */
public class LeitorOfx implements LeitorExtrato {

    public String formato() {
        return "OFX";
    }

    public String extensao() {
        return ".ofx";
    }

    public String descricao() {
        return "OFX padrão (apenas extratos)";
    }

    public List<LinhaExtrato> lerLinhas(ArquivoExtrato arquivo) {
        List<String> registros = arquivo.registros();
        List<LinhaExtrato> linhas = new ArrayList<>();
        for (int i = 0; i < registros.size(); i++) {
            if (registros.get(i).startsWith("<STMTTRN>")) {
                linhas.add(converter(registros.get(i), i + 1));
            }
        }
        return linhas;
    }

    private LinhaExtrato converter(String texto, int linha) {
        String data = campo(texto, "DTPOSTED"); // AAAAMMDD
        String valor = campo(texto, "TRNAMT");
        boolean valido = valor.matches("-?\\d+(\\.\\d+)?");
        LinhaExtrato lida = new LinhaExtrato(
                linha,
                data.substring(6, 8) + "/" + data.substring(4, 6) + "/" + data.substring(0, 4),
                campo(texto, "MEMO"),
                // No OFX os débitos vêm negativos; a linha guarda o valor absoluto e o tipo.
                valido ? Math.abs(Double.parseDouble(valor)) : 0,
                campo(texto, "TRNTYPE").equals("CREDIT") ? "Crédito" : "Débito");
        return valido ? lida : lida.rejeitar("Campo TRNAMT ausente ou inválido na transação.");
    }

    /** Texto entre <TAG> e a próxima marcação. */
    private String campo(String texto, String tag) {
        int inicio = texto.indexOf("<" + tag + ">");
        if (inicio < 0) {
            return "";
        }
        inicio += tag.length() + 2;
        int fim = texto.indexOf("<", inicio);
        return fim < 0 ? texto.substring(inicio) : texto.substring(inicio, fim);
    }
}
