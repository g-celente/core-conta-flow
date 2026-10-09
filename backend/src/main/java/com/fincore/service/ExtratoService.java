package com.fincore.service;

import com.fincore.domain.ArquivoExtrato;
import com.fincore.domain.LinhaExtrato;
import com.fincore.pattern.extrato.AmostrasExtrato;
import com.fincore.pattern.extrato.ImportadorCnab240;
import com.fincore.pattern.extrato.ImportadorCnab400;
import com.fincore.pattern.extrato.ImportadorExtrato;
import com.fincore.pattern.extrato.ImportadorOfx;
import com.fincore.pattern.extrato.LeitorExtrato;
import java.util.List;
import org.springframework.stereotype.Service;

/** Factory Method — cliente: escolhe o importador (criador concreto) pelo adaptador do tenant. */
@Service
public class ExtratoService {

    public LeitorExtrato leitor(String adaptador) {
        return importadorDo(adaptador).getLeitor();
    }

    public ArquivoExtrato amostra(String adaptador) {
        return AmostrasExtrato.de(adaptador);
    }

    public List<LinhaExtrato> importar(String adaptador, String nomeArquivo) {
        // O nome do arquivo enviado decide a extensão; o conteúdo é a amostra do adaptador.
        ArquivoExtrato arquivo = new ArquivoExtrato(nomeArquivo, amostra(adaptador).getConteudo());
        return importadorDo(adaptador).importar(arquivo);
    }

    private ImportadorExtrato importadorDo(String adaptador) {
        return switch (adaptador) {
            case "OFX" -> new ImportadorOfx();
            case "CNAB240" -> new ImportadorCnab240();
            case "CNAB400" -> new ImportadorCnab400();
            default -> throw new IllegalArgumentException("Adaptador desconhecido: " + adaptador);
        };
    }
}
