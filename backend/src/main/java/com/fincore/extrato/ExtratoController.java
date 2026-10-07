package com.fincore.extrato;

import com.fincore.dominio.ArquivoExtrato;
import com.fincore.dominio.LinhaExtrato;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Factory Method — cliente: escolhe o importador (criador concreto) pelo adaptador do tenant. */
@RestController
@RequestMapping("/api/extrato")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ExtratoController {

    public record Formato(String formato, String extensao, String descricao, String amostra) {}

    public record PedidoImportacao(String adaptador, String nomeArquivo) {}

    public record Importacao(String arquivo, String formato, List<LinhaExtrato> linhas) {}

    @GetMapping("/formato/{adaptador}")
    public Formato formato(@PathVariable String adaptador) {
        LeitorExtrato leitor = importadorDo(adaptador).getLeitor();
        return new Formato(leitor.formato(), leitor.extensao(), leitor.descricao(),
                AmostrasExtrato.de(adaptador).getNome());
    }

    @PostMapping("/importar")
    public Importacao importar(@RequestBody PedidoImportacao pedido) {
        ImportadorExtrato importador = importadorDo(pedido.adaptador());
        // O nome do arquivo enviado decide a extensão; o conteúdo é a amostra do adaptador.
        ArquivoExtrato arquivo = new ArquivoExtrato(pedido.nomeArquivo(),
                AmostrasExtrato.de(pedido.adaptador()).getConteudo());
        return new Importacao(arquivo.getNome(), importador.getLeitor().formato(), importador.importar(arquivo));
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
