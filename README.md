# 🏁 F1 Decision Maker

<div align="center">

![Formula 1](https://img.shields.io/badge/F%C3%B3rmula%201-Strategy%20Analytics-E10600?style=for-the-badge&logo=formula1&logoColor=white)

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)

### 📊 Plataforma de Inteligência Estratégica para Fórmula 1

*Transformando dados históricos em inteligência estratégica.*

</div>

---

# 📖 Sobre o Projeto

O F1 Decision Maker é uma plataforma de análise estratégica baseada em dados históricos da Fórmula 1.

O projeto surgiu com o objetivo de investigar uma das perguntas mais importantes do automobilismo moderno:

> ## ❓ A posição final de um piloto possui relação direta com a estratégia de pitstop adotada?

Por meio da análise de milhares de voltas, estratégias e métricas de desempenho, o sistema busca identificar padrões e medir o impacto das decisões tomadas nos boxes sobre o resultado final de uma corrida.

Ao invés de utilizar inteligência artificial generativa, o projeto utiliza estatística, análise de dados e algoritmos de aprendizado de máquina para produzir conclusões fundamentadas em evidências históricas.

---

# 🎯 Objetivos

O projeto busca:

- 📈 Analisar corridas históricas da Fórmula 1;
- 🏎️ Avaliar estratégias de pitstop;
- 🛞 Medir o impacto da degradação dos pneus;
- 📊 Identificar correlações entre variáveis estratégicas;
- 🔄 Simular cenários alternativos;
- 🧠 Produzir insights probabilísticos;
- 📉 Avaliar a influência das decisões estratégicas na posição final dos pilotos;
- 🎓 Responder à hipótese central do projeto através de Big Data e Ciência de Dados.

---

# ❓ Pergunta de Pesquisa

Toda a aplicação gira em torno da seguinte pergunta:

> ## "A posição final do piloto possui relação direta com a estratégia de pitstop adotada?"

---

# 🚀 Funcionalidades

## 📊 Dashboard Executivo

Visão geral das corridas analisadas.

Indicadores:

- Total de corridas;
- Total de pilotos;
- Total de equipes;
- Total de voltas;
- Total de pitstops;
- Estratégias mais utilizadas.

---

## 🏁 Dashboard de Corrida

Análise completa de cada corrida.

Visualizações:

- Evolução da posição;
- Evolução do ritmo;
- Tempos de volta;
- Timeline dos pitstops;
- Estratégia de pneus;
- Ganho e perda de posições.

---

## 🛞 Análise de Estratégias

Comparação entre:

- Estratégias de 1 parada;
- Estratégias de 2 paradas;
- Estratégias de 3 paradas.

Métricas avaliadas:

- Posição final média;
- Pit loss médio;
- Degradação média;
- Consistência;
- Eficiência estratégica.

---

## 📈 Análise Estatística

Cálculo automático de:

- Correlação de Pearson;
- Heatmaps;
- Matrizes de correlação;
- Distribuições estatísticas;
- Gráficos de dispersão.

Variáveis analisadas:

- Número de pitstops;
- Tempo perdido no pit;
- Degradação dos pneus;
- Ritmo médio;
- Consistência;
- Mudança de posição;
- Posição final.

---

## 🎥 Replay Histórico da Corrida

Reprodução visual das corridas volta a volta.

Exibição de:

- Posições dos pilotos;
- Mudanças de posição;
- Pitstops;
- Compostos utilizados;
- Evolução da corrida.

Controles:

- ▶ Play
- ⏸ Pause
- 🔄 Reiniciar
- ⏩ Velocidade ajustável

---

## 🔮 Timeline Alternativa

Uma das principais funcionalidades do projeto.

Permite comparar:

### Estratégia Real

vs.

### Estratégia Alternativa

Exemplo:

Resultado real:

```text
Leclerc
1 parada
P7
```

Cenário alternativo:

```text
2 paradas
Pit na volta 18

Resultado esperado:

P4-P5
```

---

## 🧠 Motor de Insights

Sistema baseado em dados históricos e algoritmos de similaridade.

Exemplo:

> "Se Leclerc tivesse realizado seu pitstop quatro voltas antes, haveria aproximadamente 68% de probabilidade de terminar entre P4 e P5."

Os insights são gerados utilizando:

- Estatística;
- Scikit-Learn;
- Nearest Neighbors;
- Dados históricos.

Sem utilização de LLMs ou geração de respostas fictícias.

---

## 🧪 Simulador Estratégico

Permite criar cenários personalizados.

Parâmetros:

- Piloto;
- Quantidade de pitstops;
- Volta da parada;
- Compostos utilizados.

O sistema estima:

- Posição final esperada;
- Ganho ou perda de posições;
- Distribuição de probabilidades.

Exemplo:

| Posição | Probabilidade |
|---------|---------------|
| P4 | 42% |
| P5 | 31% |
| P6 | 18% |
| P7 | 9% |

---

# 📂 Dataset

Os dados foram obtidos através da OpenF1 API e processados utilizando Python.

Principais variáveis:

| Variável | Descrição |
|----------|------------|
| lap_number | Volta atual |
| position | Posição na pista |
| lap_time | Tempo da volta |
| compound | Composto do pneu |
| tire_age | Idade do pneu |
| degradation | Degradação do pneu |
| pit_flag | Indica se houve pitstop |
| pit_count | Quantidade de paradas |
| pit_loss | Tempo perdido no pit |
| rolling_pace | Ritmo médio |
| consistency_score | Consistência |
| strategy_type | Tipo de estratégia |
| final_position | Posição final |
| position_change | Ganho ou perda de posições |

---

# ⚙️ Tecnologias Utilizadas

## Backend

- 🐍 Python
- 🌐 Flask
- 📊 Pandas
- 🔢 NumPy
- 🤖 Scikit-Learn
- 🗃 SQLite

---

## Frontend

- ⚛ React
- 🔷 TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS

---

## Fonte dos Dados

- 🏎️ OpenF1 API

---

# 🧪 Machine Learning

Algoritmos utilizados:

### Nearest Neighbors

Responsável por:

- Identificar corridas semelhantes;
- Comparar estratégias;
- Gerar insights probabilísticos.

### Análise de Correlação

Utilizada para:

- Medir influência entre variáveis;
- Identificar padrões;
- Quantificar relações estatísticas.

### Futuras Expansões

- Random Forest;
- XGBoost;
- Regressão;
- Clustering;
- Monte Carlo.

---

# 📈 Métricas Desenvolvidas

O sistema calcula:

- 🏆 Strategy Efficiency Score;
- 🛞 Tire Management Score;
- 📊 Consistency Score;
- 📈 Position Recovery Score;
- ⏱ Pit Stop Efficiency Index;
- 🔄 Undercut Effectiveness Score;
- 🔁 Overcut Effectiveness Score.

---

# 🗂 Estrutura do Projeto

```bash
frontend
│
├── src
│   ├── assets
│   ├── components
│   ├── layouts
│   ├── pages
│   ├── services
│   ├── types
│   ├── App.tsx
│   └── main.tsx
│
backend
│
├── analytics
├── dataset
├── models
├── services
└── app.py
```

---

# 🛠 Como Executar

Clone o repositório:

```bash
git clone https://github.com/nathanscd/F1DecisionMaker.git
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

### Backend

```bash
cd backend

python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Linux:

```bash
source .venv/bin/activate
```

Instalar dependências:

```bash
pip install -r requirements.txt
```

Executar:

```bash
python app.py
```

---

# 📌 Principais Contribuições

✅ Análise histórica da Fórmula 1

✅ Avaliação de estratégias de pitstop

✅ Análise estatística

✅ Simulação de cenários alternativos

✅ Insights probabilísticos

✅ Replay histórico de corridas

✅ Dashboard interativo

✅ Aplicação de conceitos de Big Data em esportes

---

# 🎓 Contexto Acadêmico

Projeto desenvolvido para a disciplina:

> ## Tópicos de Big Data em Python

O objetivo é investigar, através de métodos estatísticos e ciência de dados, como as estratégias de pitstop influenciam os resultados finais das corridas.

---

# 🔭 Melhorias Futuras

- 🌦 Análise climática;
- 🚨 Safety Car e Virtual Safety Car;
- 🤖 Random Forest;
- 📊 XGBoost;
- 🎲 Simulações de Monte Carlo;
- 📡 Telemetria em tempo real;
- 🏁 Comparação entre temporadas;
- 📈 Recomendações estratégicas;
- 🧠 Modelos preditivos mais avançados.

---

# 🏎️ Reflexão Final

> *Na Fórmula 1, muitas corridas não são vencidas apenas pela velocidade.*
>
> ## *Elas são vencidas pelas decisões.*

---

<div align="center">

# 🏁 F1 Decision Maker

### Transformando dados históricos em inteligência estratégica.

</div>
