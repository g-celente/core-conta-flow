package com.fincore.service;

import com.fincore.domain.ConfiguracaoTenant;
import com.fincore.domain.Notificacao;
import com.fincore.pattern.notificacao.CanalEmail;
import com.fincore.pattern.notificacao.CanalNotificacao;
import com.fincore.pattern.notificacao.CanalPush;
import com.fincore.pattern.notificacao.EnvioNotificacao;
import java.util.List;
import org.springframework.stereotype.Service;

/** Chain of Responsibility — cliente: o aviso percorre Push → E-mail. */
@Service
public class NotificacaoService {

    public EnvioNotificacao enviar(List<String> features, Notificacao notificacao) {
        CanalNotificacao corrente = new CanalPush(new ConfiguracaoTenant(features));
        corrente.encadear(new CanalEmail());
        return corrente.enviar(notificacao);
    }
}
