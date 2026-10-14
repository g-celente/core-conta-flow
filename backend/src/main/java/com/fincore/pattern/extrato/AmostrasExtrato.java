package com.fincore.pattern.extrato;

import com.fincore.domain.ArquivoExtrato;

/**
 * Arquivo de exemplo de cada adaptador, com os mesmos lançamentos de junho/2026, inclusive dois
 * registros com erro (valor ilegível e data inexistente). O protótipo não lê o arquivo enviado:
 * importa sempre a amostra do adaptador.
 */
public final class AmostrasExtrato {

    private static final String OFX = String.join("\n",
            "OFXHEADER:100",
            "<OFX>",
            "<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20260601<TRNAMT>12450.00<MEMO>TED RECEBIDA - MERCADO CENTRAL LTDA</STMTTRN>",
            "<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260602<TRNAMT>-7350.00<MEMO>PIX ENVIADO - EMBALAGENS IPIRANGA ME</STMTTRN>",
            "<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260603<TRNAMT>-12760.35<MEMO>BOLETO PAGO - ENERGISA DISTRIBUICAO</STMTTRN>",
            "<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260604<TRNAMT><MEMO>REGISTRO TRUNCADO</STMTTRN>",
            "<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20260231<TRNAMT>3200.00<MEMO>DATA FORA DO PERIODO</STMTTRN>",
            "</OFX>");

    /** Detalhe: "3E" · data DDMMAAAA · valor em centavos (15 dígitos) · C/D · histórico. */
    private static final String CNAB240 = String.join("\n",
            "0 HEADER DE ARQUIVO - BANCO ITAU SA",
            "3E01062026000000001245000CTED RECEBIDA - MERCADO CENTRAL LTDA",
            "3E02062026000000000735000DPIX ENVIADO - EMBALAGENS IPIRANGA ME",
            "3E03062026000000001276035DBOLETO PAGO - ENERGISA DISTRIBUICAO",
            "3E04062026000000A1B2C3D00DREGISTRO TRUNCADO",
            "3E31022026000000000320000CDATA FORA DO PERIODO",
            "9 TRAILER DE ARQUIVO");

    /** Detalhe: "1" · data DDMMAA · C/D · valor em centavos (13 dígitos) · histórico. */
    private static final String CNAB400 = String.join("\n",
            "0 RETORNO COBRANCA",
            "1010626C0000001245000TED RECEBIDA - MERCADO CENTRAL LTDA",
            "1020626D0000000735000PIX ENVIADO - EMBALAGENS IPIRANGA ME",
            "1030626D0000001276035BOLETO PAGO - ENERGISA DISTRIBUICAO",
            "1040626D0000A1B2C3D00REGISTRO TRUNCADO",
            "1310226C0000000320000DATA FORA DO PERIODO",
            "9 TRAILER");

    public static ArquivoExtrato de(String adaptador) {
        return switch (adaptador) {
            case "OFX" -> new ArquivoExtrato("extrato-junho-2026.ofx", OFX);
            case "CNAB240" -> new ArquivoExtrato("RETORNO-CNAB240-06-2026.ret", CNAB240);
            case "CNAB400" -> new ArquivoExtrato("RETORNO-CNAB400-06-2026.txt", CNAB400);
            default -> throw new IllegalArgumentException("Adaptador desconhecido: " + adaptador);
        };
    }
}
