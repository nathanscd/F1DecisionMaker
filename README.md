## Lógica inicial do app

# O PROJETO (versão certa)

Tema:
“Análise do impacto estratégico dos pitstops no resultado de corridas da Fórmula 1”

Objetivo:
Descobrir como diferentes estratégias de pit afetam:

* posição final
* ganho/perda de tempo
* chance de vitória

---

# O QUE O SISTEMA VAI FAZER
1. Coletar dados históricos da OpenF1
2. Identificar pitstops
3. Analisar:

   * undercut
   * overcut
   * stint
   * degradação
4. Comparar:

   * estratégia usada
   * resultado obtido
5. Gerar métricas e visualizações

# O RESULTADO FINAL DO PROJETO

Você quer responder perguntas como:

* Parar mais cedo aumenta chance de ganhar posição?
* O undercut realmente funciona?
* Quanto tempo um pneu perde por volta?
* Qual composto degrada mais?
* Qual equipe executa melhores estratégias?

Isso é MUITO mais científico.

---

# ESTRUTURA DO PROJETO

## 1. COLETA DE DADOS

Você pega:

* laps
* stints
* pit
* position

Pra:

* múltiplas corridas
* múltiplos pilotos

---

## 2. TRATAMENTO DOS DADOS

Aqui está o coração do projeto.

Você precisa:

### Limpar:

* voltas de safety car
* voltas absurdas
* erros

### Criar features:

* tire_age
* degradation
* pace
* pit_loss
* gain_after_pit

---

# PRINCIPAIS MÉTRICAS DO PROJETO

Aqui é onde você ganha nota.

---

## MÉTRICA 1 — GAIN AFTER PIT

A mais importante.

Você mede:

posição antes do pit
vs
posição X voltas depois

Exemplo:

* entrou P8
* saiu P10
* terminou P6

Resultado:
→ pit foi vantajoso

---

## MÉTRICA 2 — UNDERCUT SUCCESS RATE

Você compara:

* piloto que parou antes
* piloto rival

Pergunta:
quem ficou na frente depois do ciclo de pits?

Resultado:
“Undercut funcionou em 68% dos casos”

Isso é excelente pra apresentação.

---

## MÉTRICA 3 — DEGRADAÇÃO

Você mede:

* aumento médio do lap_time conforme tire_age

Resultado:
“HARD perde em média 0.12s por volta”

---

## MÉTRICA 4 — PIT LOSS

Tempo perdido no pit.

Você calcula:

* média por circuito

Resultado:
“Monaco possui pit loss médio de 24s”

---

## MÉTRICA 5 — ESTRATÉGIA VS RESULTADO

Você pode comparar:

* 1 stop
* 2 stops

Resultado:
“2 stops tiveram melhor resultado médio em circuitos de alta degradação”

---

# COMO VOCÊ IMPLEMENTA ISSO

## BACKEND (Python)

Você basicamente precisa de:

### pandas

pra análise

### matplotlib/plotly

pra gráficos

### SQLite (opcional)

pra armazenar corridas

---

# FRONTEND

Sinceramente?

Você nem precisa de React mais.

Você pode:

* usar Jupyter
* Streamlit
* ou dashboard simples

MAS:
se quiser manter React:
→ faça apenas visualização

Não tente realtime.

---

# COMO FICA A PIPELINE

## Passo 1

Baixar corridas

## Passo 2

Limpar dataset

## Passo 3

Identificar:

* pits
* stints
* compostos

## Passo 4

Gerar métricas

## Passo 5

Visualizar

---

# VISUALIZAÇÕES FORTES

## Gráfico 1

lap_time vs tire_age

Mostra degradação.

---

## Gráfico 2

posição ao longo da corrida

Mostra impacto do pit.

---

## Gráfico 3

under/overcut success rate

---

## Gráfico 4

comparação de estratégias

---

# O QUE VOCÊ ENTREGA

Você não entrega “um app”.

Você entrega:

Sistema de análise estratégica de pitstops baseado em dados históricos de Fórmula 1

Isso soa MUITO mais profissional e acadêmico.

---

# O QUE VOCÊ CONSEGUE CONCLUIR

Exemplos reais de conclusão:

* “Undercut possui maior eficiência quando gap < 3s”
* “Pneus SOFT apresentam degradação exponencial após 12 voltas”
* “Estratégias de 2 pitstops geram vantagem em pistas de alta degradação”

Isso é exatamente o tipo de resultado que professor quer.

---

# O QUE VOCÊ PRECISA FAZER AGORA

Prioridade máxima:

## 1.

Coletar múltiplas corridas

## 2.

Criar dataset limpo

## 3.

Calcular:

* pit impact
* degradation
* position gain
