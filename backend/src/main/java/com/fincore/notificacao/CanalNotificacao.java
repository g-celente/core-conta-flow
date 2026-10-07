package com.fincore.notificacao;

import com.fincore.dominio.Notificacao;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * Chain of Responsibility — Handler: guarda o próximo canal. O primeiro canal disponível entrega
 * e encerra a corrente; os indisponíveis repassam o aviso adiante.
 */
public abstract class CanalNotificacao {
    private CanalNotificacao proximo;

    /** Encadeia e devolve o canal recebido, para montar a corrente em sequência. */
    public CanalNotificacao encadear(CanalNotificacao proximo) {
        this.proximo = proximo;
        return proximo;
    }

    /** Percorre a corrente; devolve null se nenhum canal puder entregar. */
    public EnvioNotificacao enviar(Notificacao notificacao) {
        if (!disponivel()) {
            return proximo == null ? null : proximo.enviar(notificacao);
        }
        return new EnvioNotificacao(nome(), notificacao.getDestinatario(), formatar(notificacao),
                LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
    }

    /** Nome do canal, como aparece na tela /notificacoes. */
    public abstract String nome();

    /** O canal pode entregar neste tenant? */
    protected abstract boolean disponivel();

    /** Cada canal entrega a mensagem no seu formato. */
    protected abstract String formatar(Notificacao notificacao);
}
