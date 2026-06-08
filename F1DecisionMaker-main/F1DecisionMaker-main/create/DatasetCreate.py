import os
import time
import requests
import pandas as pd

BASE_URL = "https://api.openf1.org/v1"

OUTPUT_FILE = "f1_dataset_2025.csv"

# CONFIG

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

REQUEST_DELAY = 1.5

# REQUEST 

def fetch_data(endpoint, params=None, retries=5):

    url = f"{BASE_URL}/{endpoint}"

    for attempt in range(retries):

        try:

            response = requests.get(
                url,
                params=params,
                headers=HEADERS,
                timeout=30
            )

            # Correção do timeout: RATE LIMIT
            if response.status_code == 429:

                wait = (attempt + 1) * 5

                print(f"[429] Esperando {wait}s...")
                time.sleep(wait)

                continue

            # Correção do erro: UNPROCESSABLE ENTITY
            if response.status_code == 422:

                print(f"[422] Endpoint inválido: {endpoint}")
                print(params)

                return pd.DataFrame()

            response.raise_for_status()

            data = response.json()

            time.sleep(REQUEST_DELAY)

            if not data:
                return pd.DataFrame()

            return pd.DataFrame(data)

        except Exception as e:

            print(f"Erro em {endpoint}: {e}")

            wait = (attempt + 1) * 3
            time.sleep(wait)

    return pd.DataFrame()

# BUSCAR CORRIDAS

print("Buscando sessões...")

sessions = fetch_data(
    "sessions",
    {
        "year": 2025
    }
)

#LIMITA AO PRIMEIRO SEMESTRE
#sessions = sessions[sessions["date_start"].dt.month <= 6]

sessions = sessions[
    sessions["session_name"]
    .str.contains("Race", na=False)
]


sessions = sessions[
    sessions["location"].notna()
]

if sessions.empty:
    raise Exception("Nenhuma sessão encontrada.")


print(f"{len(sessions)} corridas encontradas.")

dataset_rows = []

# ==========================================
# LOOP PRINCIPAL

for _, session in sessions.iterrows():

    session_key = session["session_key"]

    print("\n===================================")
    print(f"Processando sessão {session_key}")
    print("===================================")

    race_name = session.get("session_name")
    location = session.get("location")
    country = session.get("country_name")
    circuit_key = session.get("circuit_key")
    race_date = session.get("date_start")

    # --------------------------------------
    # ENDPOINTS

    laps = fetch_data(
        "laps",
        {"session_key": session_key}
    )

    positions = fetch_data(
        "position",
        {"session_key": session_key}
    )

    stints = fetch_data(
        "stints",
        {"session_key": session_key}
    )

    drivers = fetch_data(
        "drivers",
        {"session_key": session_key}
    )

    weather = fetch_data(
        "weather",
        {"session_key": session_key}
    )

    # --------------------------------------
    # VALIDAÇÃO DOS DADOS

    if laps.empty:
        print(f"Sessão {session_key} sem laps.")
        continue

    if stints.empty:
        print(f"Sessão {session_key} sem stints.")
        continue

    if positions.empty:
        print(f"Sessão {session_key} sem positions.")
        continue

    if drivers.empty:
        print("Sem drivers.")
        continue

    # --------------------------------------
    # POSIÇÃO NO GRID

    grid_map = {}

    if "grid_position" in drivers.columns:

        grid_map = dict(
            zip(
                drivers["driver_number"],
                drivers["grid_position"]
            )
        )

    # --------------------------------------
    # POSIÇÃO FINAL

    final_position_map = {}

    if not positions.empty:

        positions["date"] = pd.to_datetime(
            positions["date"],
            format="ISO8601",
            errors="coerce"
        )

        positions = positions.dropna(
            subset=["date"]
        )

        latest_positions = (
            positions
            .sort_values("date")
            .groupby("driver_number")
            .tail(1)
        )

        final_position_map = dict(
            zip(
                latest_positions["driver_number"],
                latest_positions["position"]
            )
        )

    # --------------------------------------
    # WEATHER 

    avg_air_temp = None
    avg_track_temp = None
    max_rainfall = None

    if not weather.empty:

        if "air_temperature" in weather.columns:
            avg_air_temp = weather[
                "air_temperature"
            ].mean()

        if "track_temperature" in weather.columns:
            avg_track_temp = weather[
                "track_temperature"
            ].mean()

        if "rainfall" in weather.columns:
            max_rainfall = weather[
                "rainfall"
            ].max()

    # ======================================
    # PROCESSAMENTO DOS PITS

    for _, stint in stints.iterrows():

        try:

            driver_number = stint["driver_number"]

            stint_number = stint.get("stint_number")
            

            # primeiro stint NÃO é pit stop
            if stint_number == 1:
                continue

            # volta em que o novo stint começou
            pit_lap = stint.get("lap_start")
            
            lap_end = stint.get("lap_end")

            if pd.isna(lap_end):
                lap_end = pit_lap + 15

            compound = stint.get("compound")

            tire_age = stint.get("tyre_age_at_start")

            # ----------------------------------
            # DRIVER INFO

            driver_info = drivers[
                drivers["driver_number"]
                == driver_number
            ]

            if driver_info.empty:
                continue

            driver_info = driver_info.iloc[0]

            team_name = driver_info.get(
                "team_name"
            )

            # ----------------------------------
            # LAPS DO PILOTO

            driver_laps = laps[
                laps["driver_number"]
                == driver_number
            ]
            
            # ----------------------------------
            # CALCULAR PIT LOSS ESTIMADO

            pit_duration = None

            lap_pit = driver_laps[
                driver_laps["lap_number"] == pit_lap
            ]

            lap_before_pit = driver_laps[
                driver_laps["lap_number"] == pit_lap - 1
            ]

            lap_after_pit = driver_laps[
                driver_laps["lap_number"] == pit_lap + 1
            ]

            if (
                not lap_pit.empty
                and not lap_before_pit.empty
                and not lap_after_pit.empty
            ):

                pit_lap_time = lap_pit.iloc[0].get(
                    "lap_duration"
                )

                before_time = lap_before_pit.iloc[0].get(
                    "lap_duration"
                )

                after_time = lap_after_pit.iloc[0].get(
                    "lap_duration"
                )

                # média das voltas normais
                normal_lap = (
                    before_time + after_time
                ) / 2

                # perda aproximada do pit
                pit_duration = (
                    pit_lap_time - normal_lap
                )

            # volta antes do pit
            lap_before = driver_laps[
                driver_laps["lap_number"]
                == pit_lap - 1
            ]

            lap_duration_before = None

            if not lap_before.empty:

                lap_duration_before = (
                    lap_before.iloc[0]
                    .get("lap_duration")
                )

            # ----------------------------------
            # MÉTRICAS DO STINT

            avg_lap_stint = None
            best_lap_stint = None

            if not driver_laps.empty:

                valid_laps = driver_laps[
                    (driver_laps["lap_duration"] > 0)
                    &
                    (driver_laps["lap_number"] >= pit_lap)
                    &
                    (driver_laps["lap_number"] <= lap_end)
                ]

                if not valid_laps.empty:

                    avg_lap_stint = valid_laps[
                        "lap_duration"
                    ].mean()

                    best_lap_stint = valid_laps[
                        "lap_duration"
                    ].min()

            # ----------------------------------
            # POSIÇÕES

            position_before = None
            position_after = None

            if not positions.empty:

                driver_positions = positions[
                    positions["driver_number"]
                    == driver_number
                ]

                driver_positions = (
                driver_positions
                .sort_values("date")
            )

            position_before = None
            position_after = None

            if not driver_positions.empty:

                # aproximação temporal
                midpoint = len(driver_positions) // 2

                position_before = (
                    driver_positions.iloc[
                        max(midpoint - 1, 0)
                    ]["position"]
                )

                position_after = (
                    driver_positions.iloc[
                        min(midpoint + 1,
                        len(driver_positions)-1)
                    ]["position"]
                )
                    
                print(positions.columns)

            # ----------------------------------
            # PIT POSITION LOSS

            pit_position_loss = None

            if (
                position_before is not None
                and position_after is not None
            ):

                pit_position_loss = (
                    position_after
                    - position_before
                )

            # ----------------------------------
            # ROW

            row = {

                "race_name": race_name,
                "country": country,
                "location": location,
                "race_date": race_date,

                "session_key": session_key,
                "circuit_key": circuit_key,

                "driver_number": driver_number,
                "team_name": team_name,

                "grid_position":
                    grid_map.get(driver_number),

                "final_position":
                    final_position_map.get(
                        driver_number
                    ),

                "pit_lap": pit_lap,
                "pit_duration": pit_duration,

                "lap_duration_before_pit":
                    lap_duration_before,

                "position_before_pit":
                    position_before,

                "position_after_pit":
                    position_after,

                "pit_position_loss":
                    pit_position_loss,

                "compound": compound,

                "tire_age_at_start":
                    tire_age,

                "stint_number":
                    stint_number,

                "avg_lap_stint":
                    avg_lap_stint,

                "best_lap_stint":
                    best_lap_stint,

                "avg_air_temp":
                    avg_air_temp,

                "avg_track_temp":
                    avg_track_temp,

                "max_rainfall":
                    max_rainfall
            }

            dataset_rows.append(row)

        except Exception as e:

            print(
                f"Erro no pit stop: {e}"
            )

    # SALVAMENTO PARCIAL (INCREMENTO)

    partial_df = pd.DataFrame(dataset_rows)

    partial_df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print(
        f"Salvamento parcial: "
        f"{len(partial_df)} linhas"
    )
    
#-------------------------------------
# FINAL

final_df = pd.DataFrame(dataset_rows)

final_df.drop_duplicates(inplace=True)

final_df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n===================================")
print("DATASET FINAL GERADO")
print("===================================")
print(final_df.shape)
print(f"Arquivo: {OUTPUT_FILE}")