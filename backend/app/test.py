import requests
import pandas as pd

BASE_URL = "https://api.openf1.org/v1"

SESSION_KEY = 9158
DRIVER = 16

def fetch(endpoint, params):
    url = f"{BASE_URL}/{endpoint}"
    res = requests.get(url, params=params)
    res.raise_for_status()
    return pd.DataFrame(res.json())

# --------------------------
# COLETA
# --------------------------
laps = fetch("laps", {"session_key": SESSION_KEY})
positions = fetch("position", {"session_key": SESSION_KEY})
pits = fetch("pit", {"session_key": SESSION_KEY})
stints = fetch("stints", {"session_key": SESSION_KEY, "driver_number": DRIVER})

# --------------------------
# FILTRO PILOTO
# --------------------------
laps = laps[laps["driver_number"] == DRIVER].copy()
positions = positions[positions["driver_number"] == DRIVER].copy()
pits = pits[pits["driver_number"] == DRIVER].copy()

# --------------------------
# TEMPO DE VOLTA (robusto)
# --------------------------
if "lap_time" in laps.columns:
    laps["lap_time_sec"] = laps["lap_time"]
elif "lap_duration" in laps.columns:
    laps["lap_time_sec"] = laps["lap_duration"]
else:
    raise ValueError("Sem coluna de tempo de volta")

laps["lap_time_sec"] = pd.to_numeric(laps["lap_time_sec"], errors="coerce")

# --------------------------
# DATETIME
# --------------------------
laps["date_start"] = pd.to_datetime(laps["date_start"])
positions["date"] = pd.to_datetime(positions["date"])

laps = laps.rename(columns={"lap_number": "lap"})

# --------------------------
# POSIÇÃO → VOLTA (correto)
# --------------------------
laps = laps.sort_values("date_start")
positions = positions.sort_values("date")

positions = pd.merge_asof(
    positions,
    laps[["driver_number", "lap", "date_start"]],
    left_on="date",
    right_on="date_start",
    by="driver_number",
    direction="backward"
)

positions = (
    positions
    .dropna(subset=["lap"])
    .sort_values("date")
    .groupby(["driver_number", "lap"])
    .last()
    .reset_index()
)

positions = positions.rename(columns={"position": "track_position"})

# --------------------------
# STINT EXPANSION (base real)
# --------------------------
stint_rows = []

for _, row in stints.iterrows():
    for lap in range(int(row["lap_start"]), int(row["lap_end"]) + 1):
        stint_rows.append({
            "driver_number": row["driver_number"],
            "lap": lap,
            "compound": row.get("compound"),
            "stint": row.get("stint_number")
        })

stint_df = pd.DataFrame(stint_rows)

# --------------------------
# MERGE BASE
# --------------------------
df = laps.merge(
    positions[["driver_number", "lap", "track_position"]],
    on=["driver_number", "lap"],
    how="left"
)

df = df.merge(
    stint_df,
    on=["driver_number", "lap"],
    how="left"
)

# --------------------------
# DETECÇÃO DE PIT (CORRETA)
# --------------------------
# 1. mudança de stint = pit real
df = df.sort_values("lap")
df["stint_change"] = df["stint"].diff().fillna(0) != 0

# 2. pit via endpoint (apenas como apoio)
if not pits.empty:
    pits = pits.rename(columns={"lap_number": "lap"})
    pits["pit_api"] = 1
    df = df.merge(
        pits[["driver_number", "lap", "pit_api"]],
        on=["driver_number", "lap"],
        how="left"
    )
else:
    df["pit_api"] = 0

df["pit_api"] = df["pit_api"].fillna(0)

# pit final = OR entre os dois
df["pit_flag"] = ((df["stint_change"]) | (df["pit_api"] == 1)).astype(int)

# --------------------------
# LIMPEZA PESADA (ESSENCIAL)
# --------------------------
# remover voltas absurdas (pit / SC / erro)
df = df[(df["lap_time_sec"] > 80) & (df["lap_time_sec"] < 110)]

# remover voltas logo após pit (normalmente lixo)
df = df[df["pit_flag"] == 0]

# --------------------------
# PREENCHIMENTO
# --------------------------
df["track_position"] = df["track_position"].ffill()

# --------------------------
# FEATURES
# --------------------------
df["tire_age"] = df.groupby("stint").cumcount()

df["lap_time_delta"] = df["lap_time_sec"].diff()

# limitar delta (remove spikes absurdos)
df["lap_time_delta"] = df["lap_time_delta"].clip(-5, 5)

# ritmo médio
df["rolling_pace"] = df["lap_time_sec"].rolling(3).mean()

# degradação
df["degradation"] = df.groupby("stint")["lap_time_sec"].transform(
    lambda x: x - x.iloc[0]
)

# --------------------------
# RESULTADO FINAL
# --------------------------
print(df.head(15))

df.to_csv("f1_dataset_clean.csv", index=False)