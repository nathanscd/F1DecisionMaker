import time
import requests
import pandas as pd

# ==========================================
# CONFIG
# ==========================================

BASE_URL = "https://api.openf1.org/v1"

OUTPUT_FILE = "f1_dataset_2025.csv"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

REQUEST_DELAY = 1.5

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

            # RATE LIMIT
            if response.status_code == 429:

                wait = (attempt + 1) * 5

                print(f"[429] Esperando {wait}s...")
                time.sleep(wait)

                continue

            # UNPROCESSABLE ENTITY
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

# ==========================================
# BUSCAR SESSÕES

print("Buscando sessões...")

sessions = fetch_data(
    "sessions",
    {
        "year": 2025
    }
)

if sessions.empty:
    raise Exception("Nenhuma sessão encontrada.")

print("Colunas sessions:")
print(sessions.columns)

sessions = sessions[
    sessions["session_name"]
    .str.contains("Race", na=False)
]

sessions["date_start"] = pd.to_datetime(
    sessions["date_start"],
    format="ISO8601",
    errors="coerce"
)

print(f"{len(sessions)} corridas encontradas.")

dataset_rows = []

for _, session in sessions.iterrows():

    session_key = session["session_key"]

    print("\n===================================")
    print(f"Processando sessão {session_key}")
    print("===================================")

    meeting_id = session.get("meeting_key")

    race_name = session.get("meeting_name")

    country = session.get("country_name")

    location = session.get("location")

    circuit_key = session.get("circuit_key")

    race_date = session.get("date_start")

    # --------------------------------------
    # ENDPOINTS
    # --------------------------------------

    laps = fetch_data(
        "laps",
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

    # --------------------------------------
    # VALIDAÇÕES
    # --------------------------------------

    if laps.empty:
        print(f"Sessão {session_key} sem laps.")
        continue

    if stints.empty:
        print(f"Sessão {session_key} sem stints.")
        continue

    if drivers.empty:
        print(f"Sessão {session_key} sem drivers.")
        continue

    # --------------------------------------
    # TRATAMENTO DOS DADOS
    # --------------------------------------

    laps["lap_duration"] = pd.to_numeric(
        laps["lap_duration"],
        errors="coerce"
    )

    laps["lap_number"] = pd.to_numeric(
        laps["lap_number"],
        errors="coerce"
    )

    # ======================================
    # LOOP DOS PILOTOS
    # ======================================

    for driver_number in drivers[
        "driver_number"
    ].unique():

        try:
            driver_info = drivers[
                drivers["driver_number"]
                == driver_number
            ]

            if driver_info.empty:
                continue

            driver_info = driver_info.iloc[0]

            driver_name = driver_info.get(
                "full_name"
            )

            team_name = driver_info.get(
                "team_name"
            )

            # ----------------------------------
            # LAPS DO PILOTO
            # ----------------------------------

            driver_laps = laps[
                laps["driver_number"]
                == driver_number
            ].copy()

            if driver_laps.empty:
                continue

            driver_laps = driver_laps.sort_values(
                "lap_number"
            )

            # remover laps inválidas
            driver_laps = driver_laps.dropna(
                subset=["lap_duration"]
            )

            # remover tempos absurdos
            driver_laps = driver_laps[
                driver_laps["lap_duration"] > 40
            ]

            driver_laps = driver_laps[
                driver_laps["lap_duration"] < 200
            ]

            if driver_laps.empty:
                continue

            # ----------------------------------
            # STINTS DO PILOTO
            # ----------------------------------

            driver_stints = stints[
                stints["driver_number"]
                == driver_number
            ].copy()

            # ----------------------------------
            # POSIÇÕES
            # ----------------------------------

            final_position = (
                driver_laps.iloc[-1]
                .get("position")
            )

            initial_position = (
                driver_laps.iloc[0]
                .get("position")
            )

            position_change = None

            if (
                pd.notna(initial_position)
                and pd.notna(final_position)
            ):

                position_change = (
                    initial_position
                    - final_position
                )

            # ----------------------------------
            # CONSISTÊNCIA
            # ----------------------------------

            consistency_score = (
                driver_laps["lap_duration"]
                .std()
            )

            # ----------------------------------
            # CONTADOR DE PITS
            # ----------------------------------

            pit_count = 0

            # ==================================
            # LOOP DAS VOLTAS
            # ==================================

            for idx, lap in driver_laps.iterrows():

                lap_number = lap.get(
                    "lap_number"
                )

                lap_time = lap.get(
                    "lap_duration"
                )

                position = lap.get(
                    "position"
                )

                sector_1 = lap.get(
                    "duration_sector_1"
                )

                sector_2 = lap.get(
                    "duration_sector_2"
                )

                sector_3 = lap.get(
                    "duration_sector_3"
                )

                lap_start_time = lap.get(
                    "date_start"
                )

                # ------------------------------
                # STINT ATUAL
                # ------------------------------

                current_stint = driver_stints[
                    (driver_stints["lap_start"]
                     <= lap_number)
                    &
                    (driver_stints["lap_end"]
                     >= lap_number)
                ]

                compound = None
                stint_number = None
                lap_start = None
                lap_end = None

                if not current_stint.empty:

                    current_stint = (
                        current_stint.iloc[0]
                    )

                    compound = current_stint.get(
                        "compound"
                    )

                    stint_number = current_stint.get(
                        "stint_number"
                    )

                    lap_start = current_stint.get(
                        "lap_start"
                    )

                    lap_end = current_stint.get(
                        "lap_end"
                    )

                # ------------------------------
                # TIRE AGE
                # ------------------------------

                tire_age = None

                if (
                    pd.notna(lap_number)
                    and pd.notna(lap_start)
                ):

                    tire_age = (
                        lap_number - lap_start
                    )

                # ------------------------------
                # PIT FLAG
                # ------------------------------

                pit_flag = 0

                if (
                    pd.notna(stint_number)
                    and stint_number > 1
                    and lap_number == lap_start
                ):

                    pit_flag = 1

                    pit_count += 1

                # ------------------------------
                # ROLLING PACE
                # ------------------------------

                rolling_pace = (
                    driver_laps[
                        driver_laps["lap_number"]
                        <= lap_number
                    ]["lap_duration"]
                    .tail(3)
                    .mean()
                )

                # ------------------------------
                # LAP TIME DELTA
                # ------------------------------

                previous_lap = driver_laps[
                    driver_laps["lap_number"]
                    == lap_number - 1
                ]

                lap_time_delta = None

                if not previous_lap.empty:

                    prev_time = (
                        previous_lap.iloc[0]
                        .get("lap_duration")
                    )

                    if (
                        pd.notna(lap_time)
                        and pd.notna(prev_time)
                    ):

                        lap_time_delta = (
                            lap_time - prev_time
                        )

                # ------------------------------
                # DEGRADATION
                # ------------------------------

                degradation = None

                if pd.notna(lap_start):

                    first_stint_lap = driver_laps[
                        driver_laps["lap_number"]
                        == lap_start
                    ]

                    if not first_stint_lap.empty:

                        first_lap_time = (
                            first_stint_lap.iloc[0]
                            .get("lap_duration")
                        )

                        if (
                            pd.notna(lap_time)
                            and pd.notna(first_lap_time)
                        ):

                            degradation = (
                                lap_time
                                - first_lap_time
                            )

                # ------------------------------
                # PIT LOSS
                # ------------------------------

                pit_loss = None

                if pit_flag == 1:

                    if (
                        pd.notna(lap_time)
                        and pd.notna(rolling_pace)
                    ):

                        pit_loss = (
                            lap_time
                            - rolling_pace
                        )

                # ------------------------------
                # STRATEGY TYPE
                # ------------------------------

                if pit_count == 0:

                    strategy_type = "0-stop"

                elif pit_count == 1:

                    strategy_type = "1-stop"

                elif pit_count == 2:

                    strategy_type = "2-stop"

                else:

                    strategy_type = "3-stop"

                # ------------------------------
                # ROW
                # ------------------------------

                row = {

                    # IDs
                    "meeting_id":
                        meeting_id,

                    "session_id":
                        session_key,

                    # Corrida
                    "race_name":
                        race_name,

                    "country":
                        country,

                    "location":
                        location,

                    "circuit_key":
                        circuit_key,

                    "race_date":
                        race_date,

                    "driver_number":
                        driver_number,

                    "driver_name":
                        driver_name,

                    "team_name":
                        team_name,

                    # Volta
                    "lap_number":
                        lap_number,

                    "lap_start_time":
                        lap_start_time,

                    # Performance
                    "position":
                        position,

                    "lap_time":
                        lap_time,

                    "sector_1":
                        sector_1,

                    "sector_2":
                        sector_2,

                    "sector_3":
                        sector_3,

                    # Pneus
                    "compound":
                        compound,

                    "stint_number":
                        stint_number,

                    "stint_lap_start":
                        lap_start,

                    "stint_lap_end":
                        lap_end,

                    # Variáveis derivadas
                    "tire_age":
                        tire_age,

                    "degradation":
                        degradation,

                    "rolling_pace":
                        rolling_pace,

                    "lap_time_delta":
                        lap_time_delta,

                    "pit_flag":
                        pit_flag,

                    "pit_count":
                        pit_count,

                    "pit_loss":
                        pit_loss,

                    "consistency_score":
                        consistency_score,

                    "strategy_type":
                        strategy_type,

                    # Variáveis alvo
                    "final_position":
                        final_position,

                    "position_change":
                        position_change,
                }

                dataset_rows.append(row)

        except Exception as e:

            print(
                f"Erro piloto "
                f"{driver_number}: {e}"
            )

    # ======================================
    # SALVAMENTO PARCIAL
    # ======================================

    partial_df = pd.DataFrame(dataset_rows)

    partial_df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print(
        f"Salvamento parcial: "
        f"{len(partial_df)} linhas"
    )

# ==========================================
# FINAL
# ==========================================

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