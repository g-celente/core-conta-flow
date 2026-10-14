-- Escada de alçadas (cadastro /alcadas).
INSERT INTO alcada (id, perfil, titular, limite, substituto) VALUES
  ('al-1', 'Operador financeiro', 'Marina Duarte', 10000, 'Renata Oliveira'),
  ('al-2', 'Analista financeiro', 'Renata Oliveira', 25000, 'Roberto Tanaka'),
  ('al-3', 'Coordenador', 'Roberto Tanaka', 80000, 'Carlos Eduardo Menezes'),
  ('al-4', 'Diretor financeiro', 'Carlos Eduardo Menezes', 500000, 'Paula Nunes');

-- Plano de contas base, comum a todos os regimes (cadastro /plano-de-contas).
INSERT INTO conta_plano (id, codigo, descricao, nivel, tipo, saldo, grupo) VALUES
  ('cp-1', '1.0.0.0.00', 'Ativo', 0, 'SINTÉTICA', 3450210.55, 'Ativo'),
  ('cp-2', '1.1.0.0.00', 'Ativo Circulante', 1, 'SINTÉTICA', 2100000.00, 'Ativo'),
  ('cp-3', '1.1.1.0.00', 'Disponibilidades (Caixa e Bancos)', 2, 'SINTÉTICA', 1550000.00, 'Ativo'),
  ('cp-4', '1.1.1.1.01', 'Caixa Geral Matriz', 3, 'ANALÍTICA', 50000.00, 'Ativo'),
  ('cp-5', '1.1.1.2.01', 'Banco Itaú S/A — C/C 1234-5', 3, 'ANALÍTICA', 1500000.00, 'Ativo'),
  ('cp-6', '1.1.2.0.00', 'Contas a Receber de Clientes', 2, 'SINTÉTICA', 550000.00, 'Ativo'),
  ('cp-7', '1.1.2.1.01', 'Duplicatas a Receber', 3, 'ANALÍTICA', 550000.00, 'Ativo'),
  ('cp-8', '2.0.0.0.00', 'Passivo', 0, 'SINTÉTICA', 1280400.00, 'Passivo'),
  ('cp-9', '2.1.0.0.00', 'Passivo Circulante', 1, 'SINTÉTICA', 980400.00, 'Passivo'),
  ('cp-10', '2.1.1.1.01', 'Fornecedores Nacionais', 2, 'ANALÍTICA', 620400.00, 'Passivo'),
  ('cp-11', '2.1.2.1.01', 'Obrigações Tributárias', 2, 'ANALÍTICA', 360000.00, 'Passivo'),
  ('cp-12', '3.0.0.0.00', 'Receitas', 0, 'SINTÉTICA', 8950000.00, 'Receitas'),
  ('cp-13', '3.1.0.0.00', 'Receitas Operacionais', 1, 'SINTÉTICA', 8950000.00, 'Receitas'),
  ('cp-14', '3.1.1.1.01', 'Venda de Produtos — Mercado Interno', 2, 'ANALÍTICA', 8950000.00, 'Receitas'),
  ('cp-15', '4.0.0.0.00', 'Despesas', 0, 'SINTÉTICA', 6420310.00, 'Despesas'),
  ('cp-16', '4.1.0.0.00', 'Despesas Operacionais', 1, 'SINTÉTICA', 5120310.00, 'Despesas'),
  ('cp-17', '4.1.1.1.01', 'Despesas com Pessoal', 2, 'ANALÍTICA', 3120310.00, 'Despesas'),
  ('cp-18', '4.1.2.1.01', 'Despesas Administrativas', 2, 'ANALÍTICA', 2000000.00, 'Despesas'),
  ('cp-19', '4.2.0.0.00', 'Despesas Financeiras', 1, 'SINTÉTICA', 1300000.00, 'Despesas'),
  ('cp-20', '4.2.1.1.01', 'Juros e Multas Pagos', 2, 'ANALÍTICA', 1300000.00, 'Despesas');

-- Parceiros (cadastro /parceiros)
INSERT INTO parceiro (id, documento, razao_social, nome_fantasia, tipo, email, telefone, cidade, uf, em_aberto, ativo) VALUES ('pa-1', '12.345.678/0001-90', 'Distribuidora Farinha Nobre Ltda', 'Farinha Nobre', 'Fornecedor', 'financeiro@farinhanobre.com.br', '(11) 3344-5566', 'Osasco', 'SP', 18420.5, true);
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-1', 0, '02/03/2026', 'Marina Duarte', 'Cadastro criado');
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-1', 1, '18/05/2026', 'Renata Oliveira', 'Telefone atualizado');
INSERT INTO parceiro (id, documento, razao_social, nome_fantasia, tipo, email, telefone, cidade, uf, em_aberto, ativo) VALUES ('pa-2', '23.456.789/0001-12', 'Embalagens Ipiranga ME', 'Embalagens Ipiranga', 'Fornecedor', 'contato@embipiranga.com.br', '(11) 2222-8899', 'São Paulo', 'SP', 7350, true);
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-2', 0, '11/01/2026', 'Marina Duarte', 'Cadastro criado');
INSERT INTO parceiro (id, documento, razao_social, nome_fantasia, tipo, email, telefone, cidade, uf, em_aberto, ativo) VALUES ('pa-3', '987.654.321-00', 'Carlos Eduardo Silva', 'Carlos Eduardo Silva', 'Cliente', 'carlos.silva@email.com', '(11) 99887-1122', 'Guarulhos', 'SP', 0, true);
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-3', 0, '20/02/2026', 'Roberto Tanaka', 'Cadastro criado');
INSERT INTO parceiro (id, documento, razao_social, nome_fantasia, tipo, email, telefone, cidade, uf, em_aberto, ativo) VALUES ('pa-4', '45.678.901/0002-11', 'Mega Distribuidora Comercial S.A.', 'Mega Distribuidora', 'Ambos', 'ap@megadistribuidora.com.br', '(19) 3777-0100', 'Campinas', 'SP', 4250.5, true);
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-4', 0, '05/12/2025', 'Marina Duarte', 'Cadastro criado');
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-4', 1, '30/04/2026', 'Marina Duarte', 'Tipo alterado de Cliente para Ambos');
INSERT INTO parceiro (id, documento, razao_social, nome_fantasia, tipo, email, telefone, cidade, uf, em_aberto, ativo) VALUES ('pa-5', '11.222.333/0001-44', 'Serviços de Limpeza Alvorada EIRELI', 'Limpeza Alvorada', 'Fornecedor', 'alvorada@servicos.com.br', '(11) 4004-7788', 'Barueri', 'SP', 0, false);
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-5', 0, '14/08/2025', 'Renata Oliveira', 'Cadastro criado');
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-5', 1, '09/06/2026', 'Marina Duarte', 'Cadastro inativado');
INSERT INTO parceiro (id, documento, razao_social, nome_fantasia, tipo, email, telefone, cidade, uf, em_aberto, ativo) VALUES ('pa-6', '56.789.012/0001-33', 'Transportadora Rota Verde S/A', 'Rota Verde', 'Fornecedor', 'faturamento@rotaverde.com.br', '(41) 3555-2020', 'Curitiba', 'PR', 42980.9, true);
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-6', 0, '07/09/2025', 'Marina Duarte', 'Cadastro criado');
INSERT INTO parceiro (id, documento, razao_social, nome_fantasia, tipo, email, telefone, cidade, uf, em_aberto, ativo) VALUES ('pa-7', '67.890.123/0001-55', 'Mercado Central Comércio de Alimentos Ltda', 'Mercado Central', 'Cliente', 'compras@mercadocentral.com.br', '(11) 3030-4040', 'São Paulo', 'SP', 12450, true);
INSERT INTO parceiro_historico (parceiro_id, ordem, data, usuario, descricao) VALUES ('pa-7', 0, '22/10/2025', 'Roberto Tanaka', 'Cadastro criado');

-- Títulos a pagar (cadastro /contas-a-pagar)
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-1', 'NF-20491', 'pa-1', 'Distribuidora Farinha Nobre Ltda', 'Insumos de produção', '10/06/2026', 14502.33, 'Atrasado', NULL, NULL, NULL, 'Marina Duarte', NULL, NULL, NULL, NULL, NULL);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-1', 0, 'cc-3', 100);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-1', 0, '12/05/2026', 'Marina Duarte', 'Título lançado');
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-2', 'FAT-8821', 'pa-2', 'Embalagens Ipiranga ME', 'Material de embalagem', '24/06/2026', 850, 'Em aberto', '3/12', NULL, NULL, 'Renata Oliveira', NULL, NULL, NULL, NULL, NULL);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-2', 0, 'cc-1', 100);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-2', 0, '20/05/2026', 'Renata Oliveira', 'Título lançado');
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-3', 'Conta 06/26', 'pa-6', 'Transportadora Rota Verde S/A', 'Fretes', '25/06/2026', 42980.9, 'Aprovação pendente', NULL, 'Mensal', NULL, 'Marina Duarte', NULL, NULL, NULL, NULL, NULL);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-3', 0, 'cc-4', 70);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-3', 1, 'cc-3', 30);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-3', 0, '01/06/2026', 'Marina Duarte', 'Título lançado');
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-4', 'FAT-9902', 'pa-4', 'Mega Distribuidora Comercial S.A.', 'Telecomunicações', '25/06/2026', 945.8, 'Em aberto', NULL, NULL, NULL, 'Marina Duarte', NULL, NULL, NULL, NULL, NULL);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-4', 0, 'cc-1', 100);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-4', 0, '02/06/2026', 'Marina Duarte', 'Título lançado');
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-5', 'NF-11234', 'pa-5', 'Serviços de Limpeza Alvorada EIRELI', 'Serviços gerais', '20/05/2026', 5120, 'Pago', NULL, NULL, NULL, 'Renata Oliveira', '20/05/2026', 5120, 0, 0, 'Itaú — CC 12345-6');
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-5', 0, 'cc-1', 100);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-5', 0, '02/05/2026', 'Renata Oliveira', 'Título lançado');
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-5', 1, '20/05/2026', 'Marina Duarte', 'Baixa registrada');
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-6', 'IN-9912', 'pa-2', 'Embalagens Ipiranga ME', 'Material de embalagem', '28/06/2026', 8900.45, 'Em aberto', NULL, NULL, NULL, 'Marina Duarte', NULL, NULL, NULL, NULL, NULL);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-6', 0, 'cc-3', 100);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-6', 0, '05/06/2026', 'Marina Duarte', 'Título lançado');
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-7', 'Boleto 06/26', 'pa-1', 'Distribuidora Farinha Nobre Ltda', 'Insumos de produção', '30/06/2026', 2500, 'Agendado', '12/24', NULL, NULL, 'Renata Oliveira', NULL, NULL, NULL, NULL, NULL);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-7', 0, 'cc-3', 100);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-7', 0, '06/06/2026', 'Renata Oliveira', 'Título lançado');
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-8', 'NF-5541', 'pa-4', 'Mega Distribuidora Comercial S.A.', 'Benefícios', '15/06/2026', 18400, 'Aprovação pendente', NULL, NULL, NULL, 'Marina Duarte', NULL, NULL, NULL, NULL, NULL);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-8', 0, 'cc-1', 50);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-8', 1, 'cc-2', 50);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-8', 0, '01/06/2026', 'Marina Duarte', 'Título lançado');
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-9', 'Conta 05/26', 'pa-6', 'Transportadora Rota Verde S/A', 'Fretes', '01/06/2026', 890.4, 'Atrasado', NULL, NULL, NULL, 'Marina Duarte', NULL, NULL, NULL, NULL, NULL);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-9', 0, 'cc-4', 100);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-9', 0, '10/05/2026', 'Marina Duarte', 'Título lançado');
INSERT INTO conta_pagar (id, documento, parceiro_id, fornecedor, categoria, vencimento, valor, status, parcela, recorrencia, origem, lancado_por, data, valor_pago, juros, desconto, conta) VALUES ('tp-10', 'NF-088', 'pa-7', 'Mercado Central Comércio de Alimentos Ltda', 'Serviços de marketing', '10/07/2026', 6500, 'Em aberto', NULL, NULL, NULL, 'Marina Duarte', NULL, NULL, NULL, NULL, NULL);
INSERT INTO conta_pagar_rateio (conta_pagar_id, ordem, centro_id, percentual) VALUES ('tp-10', 0, 'cc-2', 100);
INSERT INTO conta_pagar_historico (conta_pagar_id, ordem, data, usuario, descricao) VALUES ('tp-10', 0, '08/06/2026', 'Marina Duarte', 'Título lançado');

-- Títulos a receber (cadastro /contas-a-receber)
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-1', 'NFE-4501', 'Tech Solutions Brasil Sistemas Ltda', 'Serviços mensais', '05/05/2026', 4500, 35, 'Em atraso');
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-2', 'NFE-4522', 'Mercado Central Comércio de Alimentos Ltda', 'Licenciamento', '15/07/2026', 12350, 0, 'A vencer');
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-3', 'NFE-4498', 'Carlos Eduardo Silva', 'Equipamentos', '01/06/2026', 8900, 0, 'Recebido');
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-4', 'NFE-3902', 'Varejo Central ME', 'Consultoria', '15/02/2026', 15000, 125, 'Em atraso');
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-5', 'NFE-4530', 'Mega Distribuidora Comercial S.A.', 'Manutenção', '20/07/2026', 3200.5, 0, 'A vencer');
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-6', 'NFE-4444', 'Indústria Mendes EPP', 'Serviços mensais', '20/05/2026', 6480, 20, 'Em atraso');
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-7', 'NFE-4390', 'Comercial Silva Ltda', 'Licenciamento', '02/04/2026', 9750, 68, 'Em atraso');
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-8', 'NFE-4310', 'Logística Rápida S.A.', 'Consultoria', '10/03/2026', 5200, 91, 'Em atraso');
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-9', 'NFE-4540', 'Tech Solutions Brasil Sistemas Ltda', 'Serviços mensais', '28/07/2026', 4500, 0, 'A vencer');
INSERT INTO conta_receber (id, documento, cliente, categoria, vencimento, valor, atraso, status) VALUES ('tr-10', 'NFE-4551', 'Mercado Central Comércio de Alimentos Ltda', 'Equipamentos', '05/08/2026', 22800, 0, 'A vencer');

-- Centros de custo (cadastro /centros-de-custo)
INSERT INTO centro_custo (id, codigo, descricao, responsavel, rateio, mes) VALUES ('cc-1', 'CC-100', 'Administrativo', 'Marina Duarte', 25, 18420.5);
INSERT INTO centro_custo (id, codigo, descricao, responsavel, rateio, mes) VALUES ('cc-2', 'CC-200', 'Comercial', 'Carlos Eduardo Menezes', 35, 42730.9);
INSERT INTO centro_custo (id, codigo, descricao, responsavel, rateio, mes) VALUES ('cc-3', 'CC-300', 'Operações', 'Roberto Tanaka', 30, 91280);
INSERT INTO centro_custo (id, codigo, descricao, responsavel, rateio, mes) VALUES ('cc-4', 'CC-400', 'Logística', 'Renata Oliveira', 10, 26310.75);

-- Contas bancárias (cadastro /contas-bancarias)
INSERT INTO conta_bancaria (id, banco, agencia, conta, descricao, ativa) VALUES ('cb-1', 'Itaú', '0001', 'CC 12345-6', 'Itaú — CC 12345-6', true);
INSERT INTO conta_bancaria (id, banco, agencia, conta, descricao, ativa) VALUES ('cb-2', 'Bradesco', '0001', 'CC 9876-5', 'Bradesco — CC 9876-5', true);
INSERT INTO conta_bancaria (id, banco, agencia, conta, descricao, ativa) VALUES ('cb-3', 'Banco do Brasil', '0001', 'CC 98765-4', 'Banco do Brasil — CC 98765-4', true);
INSERT INTO conta_bancaria (id, banco, agencia, conta, descricao, ativa) VALUES ('cb-4', 'Caixa', '0001', 'CC 0001-9', 'Caixa — CC 0001-9', true);

-- Categorias de despesa (cadastro /categorias-despesa)
INSERT INTO categoria_despesa (id, nome, ativa) VALUES ('cat-1', 'Insumos de produção', true);
INSERT INTO categoria_despesa (id, nome, ativa) VALUES ('cat-2', 'Material de embalagem', true);
INSERT INTO categoria_despesa (id, nome, ativa) VALUES ('cat-3', 'Fretes', true);
INSERT INTO categoria_despesa (id, nome, ativa) VALUES ('cat-4', 'Telecomunicações', true);
INSERT INTO categoria_despesa (id, nome, ativa) VALUES ('cat-5', 'Serviços gerais', true);
INSERT INTO categoria_despesa (id, nome, ativa) VALUES ('cat-6', 'Serviços de marketing', true);
INSERT INTO categoria_despesa (id, nome, ativa) VALUES ('cat-7', 'Benefícios', true);
INSERT INTO categoria_despesa (id, nome, ativa) VALUES ('cat-8', 'Impostos e taxas', true);
INSERT INTO categoria_despesa (id, nome, ativa) VALUES ('cat-9', 'Comissões', true);

-- Usuários (cadastro /usuarios)
INSERT INTO usuario (id, nome, email, perfil, ativo) VALUES ('us-1', 'Marina Duarte', 'marina@fincore.app', 'operador', true);
INSERT INTO usuario (id, nome, email, perfil, ativo) VALUES ('us-2', 'Roberto Tanaka', 'roberto@fincore.app', 'aprovador', true);
INSERT INTO usuario (id, nome, email, perfil, ativo) VALUES ('us-3', 'Cláudia Bastos', 'claudia@contabil.app', 'contador', true);
INSERT INTO usuario (id, nome, email, perfil, ativo) VALUES ('us-4', 'Paula Nunes', 'paula@fincore.app', 'implantador', true);
INSERT INTO usuario (id, nome, email, perfil, ativo) VALUES ('us-5', 'Carlos Eduardo Menezes', 'carlos@fincore.app', 'operador', true);
INSERT INTO usuario (id, nome, email, perfil, ativo) VALUES ('us-6', 'Renata Oliveira', 'renata@fincore.app', 'operador', true);

-- Formas de pagamento (cadastro /formas-pagamento)
INSERT INTO forma_pagamento (id, nome, ativa) VALUES ('fp-1', 'PIX', true);
INSERT INTO forma_pagamento (id, nome, ativa) VALUES ('fp-2', 'TED', true);
INSERT INTO forma_pagamento (id, nome, ativa) VALUES ('fp-3', 'Boleto bancário', true);
INSERT INTO forma_pagamento (id, nome, ativa) VALUES ('fp-4', 'Débito automático', true);
