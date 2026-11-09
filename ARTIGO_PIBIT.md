# SISPEC: Sistema Inteligente de Pecuária de Confinamento com Aprendizado de Máquina

**Plataforma Web para Gestão de Rebanho Bovino: da Caderneta de Campo ao Agro 4.0, Tecnologia na Pecuária de Precisão**

---

**Projeto de Pesquisa de IC - Código: 2324**
**EDITAL DE CHAMADA PÚBLICA PARA O PIBITI CPS-CNPq - Edição 2026/2027**
**Período: 01/09/2026 a 31/08/2027**
**Área: Ciências Agrárias - Agronomia - Extensão Rural**
**Eixo Tecnológico: Recursos Naturais**
**Unidade: 174 - FATEC de Capão Bonito**
**Financiamento externo/parcerias: NÃO | Laboratório da Unidade: NÃO | ODS: não cadastrado**
**Anexos no ICT: HISTORICO, PLANO_TRABALHO, TERMO_COMPROMISSO**

**Autor:**
Mateus Iuri Rocha
*FATEC Capão Bonito, Curso Superior de Tecnologia em Sistemas Inteligentes*

**Orientadora:**
Maria Renata Rocha Pereira

E-mail: [email do orientador], [email do coordenador]

---

## RESUMO

O crescimento da pecuária de precisão e a transformação digital no agronegócio têm impulsionado o desenvolvimento de ferramentas capazes de otimizar a gestão das propriedades rurais. Entretanto, muitos produtores ainda utilizam cadernetas de campo ou planilhas para registrar informações do rebanho, dificultando o acompanhamento do desempenho individual dos animais e a tomada de decisões baseada em dados. Nesse contexto, o presente projeto propõe o desenvolvimento de uma plataforma web para gestão de rebanho bovino, integrando tecnologias modernas de desenvolvimento de software com indicadores zootécnicos que auxiliem no monitoramento do desempenho produtivo. A aplicação está sendo desenvolvida em arquitetura cliente-servidor, utilizando React 18, Vite e Tailwind CSS no frontend, e Deno com o framework Hono no backend, com persistência de dados em JSON e posterior migração para PostgreSQL com Redis para cache. A plataforma permitirá o gerenciamento de animais, lotes e pesagens, além de disponibilizar autenticação de usuários, painéis de indicadores (dashboards operacional, tático e estratégico), gráficos interativos e sistema de alertas inteligentes. Entre os principais indicadores calculados estão o ganho médio diário (GMD), a projeção de abate com simulação de cenários e a classificação automática dos animais conforme seu desempenho zootécnico, utilizando técnicas de aprendizado de máquina (Random Forest, XGBoost, LSTM) implementadas em Rust para detecção precoce de indivíduos com baixo rendimento. O desenvolvimento está sendo realizado por um estudante ao longo de quatro meses, contemplando desde a implementação da infraestrutura do sistema até a disponibilização de funcionalidades analíticas voltadas ao apoio à decisão em três níveis gerenciais. Como resultados esperados, prevê-se a disponibilização de uma plataforma funcional, intuitiva e de fácil utilização, capaz de substituir os registros convencionais em papel, promovendo maior organização, segurança e confiabilidade das informações zootécnicas. Espera-se ainda contribuir para a formação em tecnologias voltadas ao Agro 4.0, estimular a inovação aplicada à pecuária de precisão e fornecer uma ferramenta que auxilie produtores rurais na melhoria da eficiência produtiva, no planejamento do manejo e na tomada de decisões estratégicas fundamentadas em indicadores técnicos e produtivos.

**Palavras-chave:** pecuária de precisão; confinamento bovino; aprendizado de máquina; ganho médio diário; dashboards inteligentes; React; Deno; PostgreSQL; Rust.

---

## 1. INTRODUÇÃO

O Brasil possui o maior rebanho comercial bovino do mundo, com cerca de 234 milhões de cabeças (IBGE, 2024), e ocupa posição de destaque como maior exportador de carne bovina. O confinamento tem ganhado espaço como estratégia de terminação por reduzir o ciclo produtivo, aumentar a rotatividade do pasto e permitir maior controle zootécnico. No entanto, a gestão ainda é conduzida de forma predominantemente manual na maioria das propriedades, com registros em cadernetas de campo, planilhas eletrônicas desconectadas e sistemas legados de alto custo.

Paralelamente, o avanço das tecnologias do Agro 4.0, como Aprendizado de Máquina (ML), Big Data e Visualização de Dados (BI), abriu novas possibilidades para a pecuária de precisão. Dados de pesagem, quando corretamente processados e analisados por modelos preditivos, permitem intervenções antecipadas e ganhos significativos de produtividade.

O SISPEC surge como alternativa a sistemas comerciais fechados e de alto custo, sendo desenvolvido com tecnologias modernas e gratuitas para pequenos e médios produtores, alinhado às competências do CST em Sistemas Inteligentes da FATEC Capão Bonito. Diferentemente de abordagens que dependem de hardware externo (sensores, balanças conectadas, RFID), o SISPEC adota uma abordagem exclusivamente digital: os dados de pesagem podem ser inseridos manualmente via interface web ou importados em lote via arquivos CSV. Essa decisão de projeto elimina custos com dispositivos IoT e simplifica a adoção por produtores que ainda utilizam cadernetas de campo como fonte primária de dados.

---

## Objetivos

**Objetivo Geral**
Desenvolver uma plataforma web para gestão de rebanho bovino que integre o registro de informações zootécnicas, indicadores de desempenho e técnicas de inteligência artificial, visando apoiar a tomada de decisão na pecuária de precisão e promover a transformação digital da gestão pecuária.

**Objetivos Específicos**
Desenvolver uma aplicação web baseada em arquitetura cliente-servidor utilizando tecnologias modernas de desenvolvimento (React, Vite, Tailwind CSS, Deno e Hono).
Implementar funcionalidades para cadastro e gerenciamento de animais, lotes, pesagens e usuários, substituindo registros convencionais em papel.
Estruturar um banco de dados para armazenamento seguro das informações zootécnicas, inicialmente em arquivos JSON e posteriormente em PostgreSQL com Redis para otimização do desempenho.
Desenvolver dashboards operacional, tático e estratégico que apresentem indicadores produtivos de forma visual e intuitiva.
Implementar o cálculo automático de indicadores zootécnicos, como o Ganho Médio Diário (GMD), projeção de peso para abate e classificação do desempenho dos animais.
Desenvolver modelos de aprendizado de máquina, utilizando algoritmos como Random Forest, XGBoost e LSTM, para identificação precoce de animais com baixo desempenho produtivo.
Implementar um sistema de alertas inteligentes que auxilie o produtor na identificação de situações que demandem intervenção no manejo.
Disponibilizar ferramentas de análise gráfica e simulação de cenários para apoiar o planejamento produtivo e a tomada de decisões em diferentes níveis gerenciais.
Validar a funcionalidade e a usabilidade da plataforma como ferramenta de apoio à gestão do rebanho bovino.
Contribuir para a formação do estudante de Iniciação Científica nas áreas de desenvolvimento de software, inteligência artificial aplicada ao agronegócio e tecnologias do Agro 4.0.

---

## Referencial Teórico

O avanço da pecuária de precisão tem promovido mudanças significativas na forma como as propriedades rurais são gerenciadas, possibilitando a utilização de tecnologias digitais para monitorar o desempenho dos animais e apoiar a tomada de decisões. Nesse contexto, a coleta sistemática e o processamento de dados zootécnicos permitem maior controle sobre indicadores produtivos, sanitários e econômicos, contribuindo para o aumento da eficiência, da sustentabilidade e da rentabilidade da atividade pecuária. Entretanto, muitas propriedades ainda realizam o registro das informações por meio de cadernetas de campo ou planilhas eletrônicas, o que dificulta a organização dos dados, a geração de indicadores e a obtenção de informações estratégicas para o manejo do rebanho. Assim, a adoção de plataformas digitais de gestão representa um importante passo para a consolidação do conceito de Agro 4.0, permitindo integrar informações em tempo real e oferecer suporte às decisões gerenciais (BERNARDI et al., 2024; VINHOLIS; DE MORI, 2023).

Os indicadores zootécnicos constituem uma das principais ferramentas para avaliação do desempenho produtivo de rebanhos bovinos, permitindo mensurar parâmetros relacionados ao crescimento, reprodução, sanidade e eficiência produtiva dos animais. Dentre esses indicadores, destacam-se o ganho médio diário (GMD), o peso corporal, a conversão alimentar e as projeções de desempenho, os quais subsidiam decisões relacionadas ao manejo nutricional, seleção de animais e planejamento do abate. O monitoramento contínuo desses índices possibilita identificar precocemente desvios no desempenho dos animais, reduzindo perdas produtivas e aumentando a eficiência dos sistemas de confinamento. Dessa forma, sistemas informatizados capazes de coletar, armazenar e apresentar esses indicadores em painéis de visualização (dashboards) tornam-se ferramentas essenciais para transformar dados operacionais em informações estratégicas para produtores e técnicos (EMBRAPA, 2026; XAVIER, 2023).

Paralelamente, o emprego de aprendizado de máquina (Machine Learning) vem ampliando as possibilidades de análise de grandes volumes de dados gerados nas propriedades pecuárias. Algoritmos supervisionados, como Random Forest e XGBoost, bem como modelos baseados em redes neurais recorrentes, como LSTM, apresentam elevada capacidade para identificar padrões complexos, realizar previsões e detectar precocemente animais com baixo desempenho produtivo. Quando integrados a sistemas de gestão, esses modelos permitem desenvolver mecanismos inteligentes de classificação, geração de alertas e simulação de cenários, oferecendo suporte à tomada de decisão em níveis operacional, tático e estratégico. Dessa maneira, a combinação entre plataformas web, indicadores zootécnicos e técnicas de inteligência artificial configura uma importante tendência para a modernização da bovinocultura de corte, promovendo maior precisão, agilidade e confiabilidade na gestão do rebanho (BERNARDI et al., 2024; HOSSAIN et al., 2022).

---

## 2. MATERIAIS E MÉTODOS

### 2.1 Arquitetura do Sistema

O SISPEC adota arquitetura cliente-servidor em três camadas (apresentação, negócios e dados). O frontend está sendo desenvolvido em React 18 com Vite e Tailwind CSS, servido estaticamente via Vercel. O backend utiliza Deno com Hono (REST) e WebSockets para dados em tempo real, com persistência principal em PostgreSQL e cache opcional em Redis.

A camada de Machine Learning é implementada em Rust com axum e smartcore, exposta como microsserviço containerizado com Docker, sem dependências de Python. A comunicação entre o backend Deno e o ML Service ocorre via REST para inferência de baixa latência. O deploy é realizado no Render via Docker Compose.

```
[Frontend React] --HTTP/WS--> [Backend Deno + Hono] --REST--> [ML Service Rust + axum]
                                    |
                               [PostgreSQL] [Modelos smartcore .bin]
```

### 2.2 Tecnologias

**Frontend:** React 18 com Preact compat, Vite 5, Tailwind CSS 3, Recharts 2, React Router DOM 6, Lucide React, WebSockets para dados em tempo real.

**Backend:** Deno como runtime TypeScript nativo, Hono como framework web, PostgreSQL como banco relacional, Redis para cache, Docker para containerização, Flyway para migrations.

**Machine Learning:** Rust, axum, smartcore (Random Forest, K-Means, regressão linear), MLflow para versionamento, Evidently AI para drift detection.

### 2.3 Estrutura da API

Endpoints REST planejados para o backend Deno:

| Método | Rota | Função |
|--------|------|--------|
| POST | /api/auth/login | Autenticação |
| GET/POST | /api/animais | Listar/Criar animais |
| GET/PUT/DELETE | /api/animais/:id | Buscar/Atualizar/Deletar animal |
| GET | /api/animais/:id/pesagens | Timeline de pesagens |
| GET/POST | /api/lotes | Listar/Criar lotes |
| GET/PUT/DELETE | /api/lotes/:id | Buscar/Atualizar/Deletar lote |
| GET/POST | /api/pesagens | Listar/Criar pesagens |
| GET | /api/dashboard | KPIs + alertas |
| GET | /api/dashboard/operacional | 12 KPIs em tempo real |
| GET | /api/dashboard/tatico | 8 indicadores gerenciais |
| GET | /api/dashboard/estrategico | 6 indicadores executivos |
| GET | /api/ml/predicao/:animalId | Predição de peso futuro |
| GET | /api/ml/anomalias | Detecção de anomalias no rebanho |

### 2.4 Pipeline de Aprendizado de Máquina

O pipeline de ML proposto é composto por cinco etapas:

**(1) Coleta e ingestão:** dados históricos de pesagens, dietas e clima serão importados via arquivos CSV e API pública do INMET (clima). Os dados serão armazenados em formato JSON para processamento.

**(2) Pré-processamento e feature engineering:** serão aplicadas técnicas de limpeza (tratamento de outliers por IQR e Z-Score, imputação de missing values por média), normalização (Min-Max Scaler, Standard Scaler) e criação de features derivadas como GMD acumulado, dias em confinamento, ganho de peso por período, consumo de ração estimado, eficiência alimentar (GMD/consumo) e índice de temperatura e umidade (ITU).

**(3) Modelagem preditiva:** serão implementados e comparados múltiplos algoritmos em Rust (smartcore):
- Regressão Linear Múltipla, modelo baseline para predição de peso futuro
- Random Forest Regressor, modelo ensemble robusto a não-linearidades
- XGBoost, gradient boosting com regularização para alta acurácia
- LSTM (Long Short-Term Memory), rede neural recorrente para séries temporais de peso
- Prophet (Facebook), modelo aditivo para sazonalidade e tendências
- Isolation Forest e DBSCAN para detecção de anomalias no ganho de peso

**(4) Avaliação e validação:** os modelos serão avaliados com as métricas RMSE, MAE, MAPE e R², utilizando validação cruzada temporal (TimeSeriesSplit) para evitar data leakage. O melhor modelo será promovido ao ambiente de produção com versionamento via MLflow.

**(5) Implantação e monitoramento:** o modelo será containerizado e exposto como API REST, com logging de predições, drift detection (Evidently AI) e re-treinamento programado a cada 30 dias ou sempre que a acurácia cair abaixo do limiar definido.

### 2.5 Dashboards e Visualização de Dados

Estão previstos três níveis de dashboards:

**Dashboard Operacional (uso diário):**
- Timeline individual de pesagens por animal com curva de ganho de peso e GMD projetado
- Tabela dinâmica com filtros por lote, raça, data e faixa de peso
- Alertas em tempo real: animais com GMD abaixo do esperado, lotes com desempenho crítico, pesagens atrasadas
- 12 KPIs em tempo real (GMD individual, GMD do lote, peso médio, desvio padrão do peso, dias em confinamento, projeção individual de abate, total de animais por categoria, alertas ativos, temperatura ambiente, ITU, consumo estimado, eficiência alimentar)

**Dashboard Tático (uso semanal):**
- Comparativo de desempenho entre lotes com ranking de GMD médio
- Distribuição etária e de peso do rebanho (histograma e boxplot)
- Curva de abate projetada com simulação de cenários (otimista, realista, pessimista)
- 8 indicadores gerenciais (ranking de lotes, curva de distribuição de pesos, evolução do GMD médio, taxa de descarte, conversão alimentar, homogeneidade do lote, adesão ao calendário de pesagens, previsão de abate por lote)

**Dashboard Estratégico (uso mensal):**
- Série histórica de desempenho do confinamento (mês a mês, safra a safra)
- Matriz de correlação entre variáveis (peso, GMD, consumo, temperatura, ITU)
- Previsão de faturamento com base na projeção de abate e preço da arroba
- Scorecard ESG: pegada de carbono estimada, eficiência hídrica, bem-estar animal
- 6 indicadores executivos integrados

Todos os dashboards utilizarão Recharts para renderização e oferecerão exportação para PDF e CSV, com cache Redis diferenciado por nível (5 min operacional, 1 h tático, 24 h estratégico).

### 2.6 Desenvolvimento e Cronograma

O projeto está sendo desenvolvido por um estudante ao longo de quatro meses, seguindo Scrum adaptado para equipe de uma pessoa: iterações quinzenais com planning e review, sem daily/retrospective formais. O repositório é mantido no GitHub com proteção de branch main, code review obrigatório e integração contínua via GitHub Actions:

- **Mês 1, Fundação:** repositório, CI/CD, arquitetura, modelo de dados, prototipação no Figma, backend básico (autenticação, CRUD animais/lotes), banco PostgreSQL com migrations Flyway.
- **Mês 2, ML e Dashboards:** pipeline de ML em Rust (smartcore), treinamento e validação dos modelos, microsserviço axum para inferência, dashboard operacional com Recharts, alertas inteligentes.
- **Mês 3, Dashboards Avançados:** dashboard tático e estratégico, módulo de projeção de abate com simulação de cenários, testes de carga com k6, testes E2E com Cypress, documentação OpenAPI.
- **Mês 4, Finalização e Deploy:** refinamento de UI/UX, correção de bugs, deploy em produção (Render + Vercel), manual do usuário, artigo científico e apresentação.

---

## 3. RESULTADOS ESPERADOS

### 3.1 Funcionalidades Planejadas

| Funcionalidade | Status esperado | Descrição |
|----------------|-----------------|-----------|
| CRUD Animais | Completo | Cadastro com brinco, raça (até 4), peso entrada, lote |
| CRUD Lotes | Completo | Soft-delete, listagem com status |
| CRUD Pesagens | Completo | Timeline por animal, GMD automático |
| Dashboard Operacional | Funcional | 12 KPIs em tempo real + alertas |
| Dashboard Tático | Funcional | 8 indicadores gerenciais + ranking lotes + simulação cenários |
| Dashboard Estratégico | Funcional | 6 indicadores executivos + scorecard ESG + série histórica |
| Predição de Peso (ML) | Em desenvolvimento | Random Forest, XGBoost, LSTM (Rust/smartcore) |
| Detecção de Anomalias | Em desenvolvimento | Isolation Forest, DBSCAN |
| Projeção de Abate | Funcional | Simulação de cenários (3 níveis) |
| Alertas Inteligentes | Em desenvolvimento | Regras + ML (antecedência maior ou igual a 7 dias) |
| Autenticação | Funcional | JWT com 3 perfis |
| Exportação PDF/CSV | Planejado | Todos os dashboards |

### 3.2 Métricas de Desempenho Esperadas

- Backend CRUD: < 10 ms por requisição
- Inferência ML (Rust): < 50 ms (REST)
- Dashboard operacional: < 5 ms para renderização
- Bundle frontend: aproximadamente 120 KB (gzip)
- Modelos ML: RMSE < 8 kg, MAPE < 5%
- Detecção de anomalias: > 90% de precisão com 7 dias de antecedência

---

## 4. DISCUSSÃO

O SISPEC propõe substituir a caderneta de campo e as planilhas manuais por uma plataforma digital integrada, com inteligência embarcada e sem custo de licenciamento ou dependência de hardware externo. O cálculo automático do GMD por diferentes metodologias (média aritmética, regressão linear, modelo LSTM) eliminará erros de transcrição e fornecerá múltiplas perspectivas de análise. O sistema de alertas inteligentes, baseado tanto em regras fixas (GMD < 0,7 kg/dia) quanto em detecção de anomalias por Isolation Forest, permitirá intervenções preventivas antes que o animal atinja estado crítico.

A decisão de não incluir IoT no escopo, eliminando ESP32, sensores, RFID e câmeras, reduz significativamente o custo de pesquisa e simplifica a arquitetura, mantendo o foco no software e nos modelos preditivos. Os dados de pesagem podem ser inseridos manualmente via interface web ou importados em lote, compatibilizando o sistema com a realidade de propriedades que ainda utilizam cadernetas de campo. A utilização de Rust no ML Service elimina a dependência de bibliotecas pesadas (TensorFlow, PyTorch) e reduz o consumo de memória, mantendo acurácia competitiva com smartcore.

Os dashboards em três níveis (operacional, tático e estratégico) atenderão desde o tratador no curral até o gestor financeiro da propriedade, democratizando o acesso à pecuária de precisão. A plataforma promoverá maior organização, segurança e confiabilidade das informações zootécnicas, contribuindo para a formação em tecnologias voltadas ao Agro 4.0.

### 4.1 Limitações e Trabalhos Futuros

**Limitações previstas na versão atual:** autenticação com JWT armazenado em localStorage (vulnerável a XSS, mas aceitável para protótipo); banco PostgreSQL com replicação simples (sem failover automático); predições baseadas em dados sintéticos para validação inicial; ausência de testes de carga em cenário real com múltiplos usuários simultâneos.

**Trabalhos futuros:** migração para autenticação OAuth 2.0 com provedores externos; implementação de PWA com Service Workers para funcionamento offline parcial; expansão do pipeline de ML para incluir séries temporais multivariadas com Transformers; integração com blockchain para rastreabilidade da cadeia produtiva; suporte a múltiplos protocolos de balança (RS-232, Bluetooth LE); painel de administração com gestão de usuários e permissões granulares (RBAC); testes end-to-end com Cypress em múltiplos navegadores; internacionalização (i18n) para inglês e espanhol; futura integração com dispositivos IoT para coleta automatizada de dados.

---

## 5. CONCLUSÃO

O SISPEC é uma proposta de plataforma funcional e escalável de gestão de confinamento bovino, desenvolvida com tecnologias modernas e alinhada às competências do CST em Sistemas Inteligentes, integrando conhecimentos de Banco de Dados, Estatística Aplicada, BI & Visualização de Dados, Aprendizado de Máquina e Desenvolvimento Web. A aplicação de múltiplos algoritmos de ML (Random Forest, XGBoost, LSTM, Prophet, Isolation Forest) permitirá não apenas automatizar cálculos zootécnicos, mas também gerar insights preditivos e prescritivos para o produtor, elevando a gestão do confinamento de reativa para proativa.

Os dashboards em três níveis (operacional, tático e estratégico) atenderão desde o tratador no curral até o gestor financeiro da propriedade, democratizando o acesso à pecuária de precisão. A implementação do ML Service em Rust demonstra a viabilidade de stacks leves e eficientes para ambientes de produção com recursos limitados, sem dependências de Python. O código-fonte estará disponível em repositório público sob licença GPLv3, permitindo que a comunidade acadêmica e produtores possam auditar, modificar e distribuir livremente a solução.

Espera-se que a ferramenta auxilie produtores rurais na melhoria da eficiência produtiva, no planejamento do manejo e na tomada de decisões estratégicas fundamentadas em indicadores técnicos e produtivos, contribuindo para a transformação digital da pecuária brasileira.

---

## REFERÊNCIAS

IBGE. **Pesquisa da Pecuária Municipal 2023.** Rio de Janeiro: IBGE, 2024.

BERNARDI, A. C. C. et al. Tecnologias de pecuária de precisão para o manejo de pastagens e animais. In: BASSOI, L. H. et al. (org.). **Agricultura de Precisão: um novo olhar na era digital.** São Carlos: Editora Cubo, 2024.

HOSSAIN, M. E. et al. A Systematic Review of Machine Learning Techniques for Cattle Identification: Datasets, Methods and Future Directions. 2022.

VINHOLIS, M. M. B.; DE MORI, C. Gestão zootécnico-econômica na bovinocultura (de leite e de corte). **Revista Brasileira de Buiatria**, v. 4, n. 1-4, p. 1-27, 2023.

XAVIER, M. Índices zootécnicos: o que são, como medir e qual o benefício? Pecuária de Precisão, 2023.

MILLEN, D. D. et al. Caracterização da nutrição e manejo de bovinos confinados no Brasil. In: MEDEIROS, S. R. et al. (Eds.). **Produção de Bovinos em Confinamento.** Brasília: Embrapa, 2021.

GÉRON, A. **Mãos à Obra: Aprendizado de Máquina com Scikit-Learn, Keras & TensorFlow.** 3. ed. Rio de Janeiro: Alta Books, 2023.

GOODFELLOW, I.; BENGIO, Y.; COURVILLE, A. **Deep Learning.** Cambridge: MIT Press, 2016.

BREIMAN, L. Random Forests. **Machine Learning**, v. 45, n. 1, p. 5-32, 2001.

CHEN, T.; GUESTRIN, C. XGBoost: A Scalable Tree Boosting System. In: **Proceedings of the 22nd ACM SIGKDD**, 2016.

HOCHREITER, S.; SCHMIDHUBER, J. Long Short-Term Memory. **Neural Computation**, v. 9, n. 8, p. 1735-1780, 1997.

TAYLOR, S. J.; LETHAM, B. Forecasting at Scale. **The American Statistician**, v. 72, n. 1, p. 37-45, 2018.

LIU, F. T.; TING, K. M.; ZHOU, Z.-H. Isolation Forest. In: **2008 Eighth IEEE International Conference on Data Mining**, 2008.

TANENBAUM, A. S.; FEAMSTER, N.; WETHERALL, D. **Redes de Computadores.** 6. ed. São Paulo: Bookman, 2021.

SILBERSCHATZ, A.; KORTH, H. F.; SUDARSHAN, S. **Sistema de Banco de Dados.** Rio de Janeiro: GEN LTC, 2020.

SOMMERVILLE, I. **Engenharia de Software.** 10. ed. São Paulo: Pearson, 2019.

FOSTER, P.; FAWCETT, T. **Data Science Para Negócios.** Rio de Janeiro: Alta Books, 2016.

AMARAL, F. **Introdução à Ciência de Dados.** Rio de Janeiro: Alta Books, 2016.

HONO. **Hono, Ultrafast web framework for the Edges.** Disponivel em: https://hono.dev/. Acesso em: jun. 2026.

DENO LAND. **Deno, A modern runtime for JavaScript and TypeScript.** Disponivel em: https://deno.land/. Acesso em: jun. 2026.

REACT. **React, A JavaScript library for building user interfaces.** Disponivel em: https://react.dev/. Acesso em: jun. 2026.

VITE. **Vite, Next Generation Frontend Tooling.** Disponivel em: https://vitejs.dev/. Acesso em: jun. 2026.

TAILWIND CSS. **Tailwind CSS, A utility-first CSS framework.** Disponivel em: https://tailwindcss.com/. Acesso em: jun. 2026.

axum. **axum, Web framework for Rust.** Disponivel em: https://github.com/tokio-rs/axum. Acesso em: jun. 2026.

smartcore. **smartcore, Machine Learning library for Rust.** Disponivel em: https://smartcore.org/. Acesso em: jun. 2026.
