package com.fincore.notificacao;

import com.fincore.dominio.ConfiguracaoTenant;
import com.fincore.dominio.Notificacao;
import java.util.List;
import org.springframework.web.bind.annotation.*;

/** Chain of Responsibility — cliente: o aviso percorre Push → E-mail. */
@RestController
@RequestMapping("/api/notificacoes")
@CrossOrigin(originPatterns = "http://localhost:*")
public class NotificacaoController {

    public record PedidoEnvio(List<String> features, String destinatario, String mensagem, String evento) {}

    @PostMapping("/enviar")
    public EnvioNotificacao enviar(@RequestBody PedidoEnvio pedido) {
        CanalNotificacao corrente = new CanalPush(new ConfiguracaoTenant(pedido.features()));
        corrente.encadear(new CanalEmail());
        return corrente.enviar(new Notificacao(pedido.destinatario(), pedido.mensagem(), pedido.evento()));
    }
}
