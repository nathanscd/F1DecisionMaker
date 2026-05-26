from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
import pandas as pd

def correlation_analysis(df):

    correlation = df[[
        "pit_count",
        "final_position"
    ]].corr()

    return correlation

def regression_analysis(df):

    model_df = df.copy()

    model_df = model_df.dropna(subset=[
        "position_change",
        "tire_age",
        "compound",
        "pit_count"
    ])

    encoder = LabelEncoder()

    model_df["compound_encoded"] = encoder.fit_transform(
        model_df["compound"].astype(str)
    )

    X = model_df[[
        "tire_age",
        "compound_encoded",
        "pit_count"
    ]]

    y = model_df["position_change"]

    model = LinearRegression()

    model.fit(X, y)

    score = model.score(X, y)

    return score