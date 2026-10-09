package com.fincore.pattern.notificacao;

import com.fincore.domain.ConfiguracaoTenant;
import com.fincore.domain.Notificacao;

/** Chain of Responsibility — ConcreteHandler: só entrega com a feature notificacoes_push. */
public class CanalPush extends CanalNotificacao {
    private static final int LIMITE = 120;

    private final ConfiguracaoTenant tenant;

    public CanalPush(ConfiguracaoTenant tenant) {
        this.tenant = tenant;
    }

    @Override
    public String nome() {
        return "Push";
    }

    @Override
    protected boolean disponivel() {
        return tenant.possui("notificacoes_push");
    }

    @Override
    protected String formatar(Notificacao notificacao) {
        return notificacao.resumo(LIMITE);
    }
}
