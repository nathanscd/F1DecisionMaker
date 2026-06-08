# F1 Strategy Analyzer

Sistema de análise estratégica de pitstops na Fórmula 1 baseado em dados históricos da OpenF1 API.

O projeto tem como objetivo analisar como decisões de pitstop impactam diretamente o resultado final de pilotos durante corridas da Formula 1.

Em vez de tentar prever corridas completas utilizando IA generativa, o foco do sistema é análise quantitativa, estatística e estratégica baseada em dados reais.

---

# Pergunta Principal do Projeto

> A posição final do piloto possui relação direta com a estratégia de pitstop?

O sistema busca responder essa pergunta através da análise de:

* estratégias de pitstop
* degradação dos pneus
* undercuts
* overcuts
* número de paradas
* momento do pit
* ganho/perda de posição
* tempo perdido nos pits

---

# Objetivos

* Coletar e processar dados históricos de corridas
* Identificar padrões estratégicos
* Medir impacto de estratégias de pitstop
* Comparar diferentes abordagens de corrida
* Gerar métricas e visualizações analíticas
* Produzir insights probabilísticos sobre decisões estratégicas

---

# Funcionalidades

## Análise de Estratégias

* Comparação entre estratégias de:

  * 1 stop
  * 2 stops
  * undercut
  * overcut

## Análise de Degradação

* Relação entre:

  * desgaste do pneu
  * tempo de volta
  * performance do stint

## Evolução de Posição

* Visualização da posição do piloto ao longo da corrida
* Destaque visual para pitstops

## Análise de Pit Loss

* Tempo médio perdido em pitstops
* Comparação por circuito

## Análise de Consistência

* Ritmo médio do piloto
* Variação de lap times
* Consistência durante stints

---

# Feature: Insights Estratégicos

O sistema possui uma funcionalidade chamada "Insights".

Ela funciona como um mecanismo probabilístico de análise alternativa de estratégia.

Ao analisar uma corrida, o sistema identifica decisões de pitstop realizadas pelo piloto e gera cenários alternativos baseados em dados históricos e comportamento estatístico.

Exemplo:

> "Se o piloto tivesse realizado o pitstop 3 voltas antes utilizando pneus MEDIUM, a probabilidade estimada seria de terminar em P4 ao invés de P7."

Os insights consideram:

* degradação dos pneus
* posição na pista
* tráfego
* pit loss
* ritmo médio
* estratégias semelhantes em corridas anteriores

Importante:

* os insights NÃO são previsões determinísticas
* o sistema trabalha com probabilidade e análise estatística

---

# Tecnologias Utilizadas

## Backend

* Python
* Flask
* Pandas
* SQLite
* Requests

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* Recharts

## Dados

* OpenF1

---

# Métricas Analisadas

## Estratégia

* Número de pitstops
* Momento do pitstop
* Estratégia de compostos
* Eficiência de undercut

## Performance

* Lap time médio
* Rolling pace
* Degradação do pneu
* Consistência do piloto

## Resultado

* Ganho/perda após pit
* Posição final
* Eficiência da estratégia
* Tempo perdido no pit

## Probabilidade

* Chance estimada de ganho de posição
* Impacto estratégico esperado
* Cenários alternativos de corrida

---

# Estrutura do Projeto

```bash
backend/
├── app.py
├── analysis/
├── collectors/
├── database/
├── services/
└── models/

frontend/
├── src/
├── components/
├── pages/
├── services/
└── charts/
```

---

# Pipeline de Dados

1. Coleta de dados históricos da OpenF1 API
2. Limpeza e tratamento dos datasets
3. Identificação de:

   * pitstops
   * stints
   * compostos
4. Feature engineering
5. Análise estatística
6. Geração de métricas
7. Visualização dos resultados
8. Geração de insights probabilísticos

---

# Visualizações

O sistema possui dashboards analíticos contendo:

* gráficos de degradação
* evolução de posição
* comparação de estratégias
* eficiência de undercut
* distribuição de pit loss
* impacto estratégico dos pits

---

# Resultados Esperados

O projeto busca identificar:

* se estratégias agressivas geram vantagem real
* quando o undercut é eficiente
* como a degradação impacta a corrida
* quais estratégias possuem melhor desempenho
* como decisões de pit influenciam o resultado final

---

# Objetivo Acadêmico

Este projeto foi desenvolvido para a disciplina de Tópicos de Big Data em Python.

O foco principal é:

* análise de dados
* modelagem estatística
* processamento de grandes volumes de informação
* visualização analítica
* geração de insights baseados em dados históricos

---

# Status do Projeto

🚧 Em desenvolvimento 🚧
