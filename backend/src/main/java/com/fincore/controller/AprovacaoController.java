package com.fincore.controller;

import com.fincore.domain.PedidoAprovacao;
import com.fincore.pattern.aprovacao.DecisaoAprovacao;
import com.fincore.service.AprovacaoService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Aprovação por alçada; o Chain of Responsibility é usado no AprovacaoService. */
@RestController
@RequestMapping("/api/aprovacoes")
@CrossOrigin(originPatterns = "http://localhost:*")
public class AprovacaoController {
    private final AprovacaoService aprovacao;

    public AprovacaoController(AprovacaoService aprovacao) {
        this.aprovacao = aprovacao;
    }

    public record PedidoDados(String documento, double valor, String solicitante) {}

    @PostMapping("/responsaveis")
    public List<DecisaoAprovacao> responsaveis(@RequestBody List<PedidoDados> pedidos) {
        return aprovacao.responsaveis(pedidos.stream()
                .map(p -> new PedidoAprovacao(p.documento(), p.valor(), p.solicitante()))
                .toList());
    }
}
