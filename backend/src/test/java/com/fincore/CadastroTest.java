package com.fincore;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

/** Integração: CRUD genérico pela API, com banco H2 e os dados iniciais do data.sql. */
@SpringBootTest
@AutoConfigureMockMvc
class CadastroTest {

    private static final String PEDIDO_600_MIL =
            "[{\"documento\":\"NF-1\",\"valor\":600000,\"solicitante\":\"Marina Duarte\"}]";

    @Autowired
    private MockMvc mvc;

    @Test
    void crudGenericoDeFormasDePagamento() throws Exception {
        mvc.perform(get("/api/formas-pagamento"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4));

        mvc.perform(post("/api/formas-pagamento").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"fp-teste\",\"nome\":\"Cheque\",\"ativa\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Cheque"));
        mvc.perform(get("/api/formas-pagamento")).andExpect(jsonPath("$.length()").value(5));

        mvc.perform(put("/api/formas-pagamento/fp-teste").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"fp-teste\",\"nome\":\"Cheque pré-datado\",\"ativa\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Cheque pré-datado"))
                .andExpect(jsonPath("$.ativa").value(false));

        mvc.perform(delete("/api/formas-pagamento/fp-teste")).andExpect(status().isOk());
        mvc.perform(get("/api/formas-pagamento")).andExpect(jsonPath("$.length()").value(4));
    }

    @Test
    void contaAPagarVoltaComRateioBaixaEHistorico() throws Exception {
        mvc.perform(get("/api/contas-pagar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == 'tp-5')].baixa.conta").value("Itaú — CC 12345-6"))
                .andExpect(jsonPath("$[?(@.id == 'tp-5')].rateio[0].centroId").value("cc-1"))
                .andExpect(jsonPath("$[?(@.id == 'tp-5')].historico[0].descricao").value("Título lançado"))
                .andExpect(jsonPath("$[?(@.id == 'tp-5')].historico[1].descricao").value("Baixa registrada"));
    }

    @Test
    void baixaDeContaAPagarGravaEVoltaDoBanco() throws Exception {
        String titulo = "{\"id\":\"tp-teste\",\"documento\":\"NF-T\",\"parceiroId\":\"pa-1\",\"valor\":1000,"
                + "\"status\":\"Em aberto\",\"rateio\":[{\"centroId\":\"cc-1\",\"percentual\":60},"
                + "{\"centroId\":\"cc-2\",\"percentual\":40}],"
                + "\"historico\":[{\"data\":\"01/10/2026\",\"usuario\":\"Marina Duarte\",\"descricao\":\"Título lançado\"}]";
        mvc.perform(post("/api/contas-pagar").contentType(MediaType.APPLICATION_JSON).content(titulo + "}"))
                .andExpect(status().isOk());

        String baixado = titulo.replace("Em aberto", "Pago").replace("lançado\"}]", "lançado\"},"
                + "{\"data\":\"05/10/2026\",\"usuario\":\"Rafael Lima\",\"descricao\":\"Baixa registrada\"}]")
                + ",\"baixa\":{\"data\":\"05/10/2026\",\"valorPago\":1010,\"juros\":10,\"desconto\":0,"
                + "\"conta\":\"Itaú — CC 12345-6\"}}";
        mvc.perform(put("/api/contas-pagar/tp-teste").contentType(MediaType.APPLICATION_JSON).content(baixado))
                .andExpect(status().isOk());

        mvc.perform(get("/api/contas-pagar"))
                .andExpect(jsonPath("$[?(@.id == 'tp-teste')].status").value("Pago"))
                .andExpect(jsonPath("$[?(@.id == 'tp-teste')].baixa.valorPago").value(1010.0))
                .andExpect(jsonPath("$[?(@.id == 'tp-teste')].baixa.conta").value("Itaú — CC 12345-6"))
                .andExpect(jsonPath("$[?(@.id == 'tp-teste')].rateio[1].percentual").value(40.0))
                .andExpect(jsonPath("$[?(@.id == 'tp-teste')].historico[1].descricao").value("Baixa registrada"));

        mvc.perform(delete("/api/contas-pagar/tp-teste")).andExpect(status().isOk());
    }

    @Test
    void novoNivelDeAlcadaMudaQuemDecide() throws Exception {
        mvc.perform(post("/api/aprovacoes/responsaveis").contentType(MediaType.APPLICATION_JSON).content(PEDIDO_600_MIL))
                .andExpect(jsonPath("$[0].nivel").value("Comitê financeiro"));

        mvc.perform(post("/api/alcadas").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"id\":\"al-teste\",\"perfil\":\"Conselho\",\"titular\":\"Paula Nunes\","
                                + "\"limite\":1000000,\"substituto\":\"Carlos Eduardo Menezes\"}"))
                .andExpect(status().isOk());

        mvc.perform(post("/api/aprovacoes/responsaveis").contentType(MediaType.APPLICATION_JSON).content(PEDIDO_600_MIL))
                .andExpect(jsonPath("$[0].nivel").value("Conselho"));

        mvc.perform(delete("/api/alcadas/al-teste")).andExpect(status().isOk());
    }

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void semAlcadasOComiteDecide() throws Exception {
        for (String id : new String[] {"al-1", "al-2", "al-3", "al-4"}) {
            mvc.perform(delete("/api/alcadas/" + id)).andExpect(status().isOk());
        }

        mvc.perform(post("/api/aprovacoes/responsaveis").contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"documento\":\"NF-1\",\"valor\":500,\"solicitante\":\"Marina Duarte\"}]"))
                .andExpect(jsonPath("$[0].nivel").value("Comitê financeiro"));
        mvc.perform(post("/api/titulos/validar").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":{\"documento\":\"NF-1\",\"parceiroId\":\"pa-1\",\"vencimento\":\"01/07/2026\","
                                + "\"valor\":50000,\"rateio\":[]},\"features\":[\"alcada\"]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avisos.length()").value(0));
    }
}
