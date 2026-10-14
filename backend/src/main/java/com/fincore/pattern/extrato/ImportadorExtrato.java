package com.fincore.pattern.extrato;

import com.fincore.domain.ArquivoExtrato;
import com.fincore.domain.LinhaExtrato;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.List;

/**
 * Factory Method — Creator: concentra o fluxo de importação (aceitar o arquivo, ler as linhas e
 * rejeitar datas inexistentes). O leitor concreto é criado pelo método fábrica `criarLeitor()`.
 */
public abstract class ImportadorExtrato {
    private static final DateTimeFormatter DATA =
            DateTimeFormatter.ofPattern("dd/MM/uuuu").withResolverStyle(ResolverStyle.STRICT);

    private final LeitorExtrato leitor;

    protected ImportadorExtrato() {
        this.leitor = criarLeitor();
    }

    /** Factory Method: a subclasse decide qual leitor (produto concreto) criar. */
    protected abstract LeitorExtrato criarLeitor();

    public LeitorExtrato getLeitor() {
        return leitor;
    }

    public List<LinhaExtrato> importar(ArquivoExtrato arquivo) {
        if (!arquivo.temExtensao(leitor.extensao())) {
            throw new IllegalArgumentException("O adaptador " + leitor.formato() + " aceita apenas arquivos "
                    + leitor.extensao() + " (recebido: " + arquivo.getNome() + ").");
        }
        return leitor.lerLinhas(arquivo).stream().map(this::validarData).toList();
    }

    /** Regra comum a todos os formatos: a data do lançamento precisa existir no calendário. */
    private LinhaExtrato validarData(LinhaExtrato linha) {
        if (!linha.ehValida()) {
            return linha;
        }
        try {
            LocalDate.parse(linha.getData(), DATA);
            return linha;
        } catch (DateTimeParseException erro) {
            return linha.rejeitar("Data " + linha.getData() + " inexistente.");
        }
    }
}
