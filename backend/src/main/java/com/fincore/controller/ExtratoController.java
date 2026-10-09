package com.fincore.controller;

import com.fincore.domain.LinhaExtrato;
import com.fincore.pattern.extrato.LeitorExtrato;
import com.fincore.service.ExtratoService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Importação de extrato; o Factory Method é usado no ExtratoService. */
@RestController
@RequestMapping("/api/extrato")
@CrossOrigin(originPatterns = "http://localhost:*")
public class ExtratoController {
    private final ExtratoService extrato;

    public ExtratoController(ExtratoService extrato) {
        this.extrato = extrato;
    }

    public record Formato(String formato, String extensao, String descricao, String amostra) {}

    public record PedidoImportacao(String adaptador, String nomeArquivo) {}

    public record Importacao(String arquivo, String formato, List<LinhaExtrato> linhas) {}

    @GetMapping("/formato/{adaptador}")
    public Formato formato(@PathVariable String adaptador) {
        LeitorExtrato leitor = extrato.leitor(adaptador);
        return new Formato(leitor.formato(), leitor.extensao(), leitor.descricao(),
                extrato.amostra(adaptador).getNome());
    }

    @PostMapping("/importar")
    public Importacao importar(@RequestBody PedidoImportacao pedido) {
        List<LinhaExtrato> linhas = extrato.importar(pedido.adaptador(), pedido.nomeArquivo());
        return new Importacao(pedido.nomeArquivo(), extrato.leitor(pedido.adaptador()).formato(), linhas);
    }
}
