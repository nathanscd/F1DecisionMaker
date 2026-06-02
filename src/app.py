import streamlit as st
import pandas as pd
import plotly.graph_objects as go

from utils import load_data

st.set_page_config(
    page_title="F1 Dashboard",
    layout="wide"
)

with open("src/styles.css", encoding="utf-8") as f:
    st.markdown(
        f"<style>{f.read()}</style>",
        unsafe_allow_html=True
    )

st.markdown(
    "<h1>F1 - Visão Analítica Pit Stop</h1>",
    unsafe_allow_html=True
)

if "selected_year" not in st.session_state:
    st.session_state.selected_year = 2025

col1, col2, col3 = st.columns(3)

with col1:
    if st.button("2023"):
        st.session_state.selected_year = 2023

with col2:
    if st.button("2024"):
        st.session_state.selected_year = 2024

with col3:
    if st.button("2025"):
        st.session_state.selected_year = 2025

selected_year = st.session_state.selected_year

@st.cache_data
def get_data(year):
    return load_data(year)

try:

    df = get_data(selected_year)
    st.write(df.head(10))
    st.write(df.columns)

except Exception as e:

    st.error(f"Erro ao carregar dataset: {e}")
    st.stop()

if df.empty:
    st.error("Dataset vazio.")
    st.stop()

required_columns = [
    "session_id",
    "driver_name",
    "lap_number",
    "position",
    "pit_flag"
]

missing = [
    col for col in required_columns
    if col not in df.columns
]

if missing:
    st.error(f"Colunas ausentes: {missing}")
    st.stop()

df = df.dropna(
    subset=[
        "session_id",
        "driver_name",
        "lap_number",
        "position"
    ]
)

df["lap_number"] = pd.to_numeric(
    df["lap_number"],
    errors="coerce"
)

df["position"] = pd.to_numeric(
    df["position"],
    errors="coerce"
)

df = df.dropna(
    subset=[
        "lap_number",
        "position"
    ]
)

df["session_label"] = (
    df["session_id"].astype(str)
    + " - "
    + df["country"].fillna("")
    + " - "
    + df["location"].fillna("")
)

sessions = sorted(
    df["session_id"].unique()
)

if len(sessions) == 0:
    st.error("Nenhuma sessão encontrada.")
    st.stop()

session_selected = st.selectbox(
    "Selecionar Sessão",
    sessions
)

race_df = df[
    df["session_id"] == session_selected
]


st.header("Posição Antes e Depois do Pit Stop")

fig = go.Figure()

drivers = sorted(
    race_df["driver_name"].unique()
)

for driver in drivers:

    driver_df = race_df[
        race_df["driver_name"] == driver
    ].copy()

    driver_df = driver_df.sort_values(
        "lap_number"
    )

    
    fig.add_trace(
        go.Scatter(
            x=driver_df["lap_number"],
            y=driver_df["position"],
            mode="lines",
            name=driver
        )
    )

    pit_df = driver_df[
        driver_df["pit_flag"] == 1
    ]

    if not pit_df.empty:

        fig.add_trace(
            go.Scatter(
                x=pit_df["lap_number"],
                y=pit_df["position"],
                mode="markers",
                marker=dict(
                    size=12,
                    symbol="x"
                ),
                name=f"Pit - {driver}"
            )
        )

fig.update_layout(
    title=f" Evolução de Posição",
    xaxis_title="Volta",
    yaxis_title="Posição",
    yaxis=dict(
        autorange="reversed"
    ),
    template="plotly_dark",
    height=750
)

st.plotly_chart(
    fig,
    use_container_width=True
)