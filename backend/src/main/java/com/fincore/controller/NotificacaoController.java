package com.fincore.controller;

import com.fincore.domain.Notificacao;
import com.fincore.pattern.notificacao.EnvioNotificacao;
import com.fincore.service.NotificacaoService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Envio de aviso; o Chain of Responsibility é usado no NotificacaoService. */
@RestController
@RequestMapping("/api/notificacoes")
@CrossOrigin(originPatterns = "http://localhost:*")
public class NotificacaoController {
    private final NotificacaoService notificacao;

    public NotificacaoController(NotificacaoService notificacao) {
        this.notificacao = notificacao;
    }

    public record PedidoEnvio(List<String> features, String destinatario, String mensagem, String evento) {}

    @PostMapping("/enviar")
    public EnvioNotificacao enviar(@RequestBody PedidoEnvio pedido) {
        return notificacao.enviar(pedido.features(),
                new Notificacao(pedido.destinatario(), pedido.mensagem(), pedido.evento()));
    }
}
