package com.fincore.pattern.notificacao;

import com.fincore.domain.Notificacao;

/** Chain of Responsibility — ConcreteHandler: elo final e garantia de entrega. */
public class CanalEmail extends CanalNotificacao {

    @Override
    public String nome() {
        return "E-mail";
    }

    @Override
    protected boolean disponivel() {
        return true;
    }

    @Override
    protected String formatar(Notificacao notificacao) {
        return "[FinCore · " + notificacao.getEvento() + "] " + notificacao.getMensagem();
    }
}
