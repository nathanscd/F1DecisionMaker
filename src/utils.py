import pandas as pd

def load_data(year):

    path = f"Datasets/f1_dataset_{year}.csv"

    df = pd.read_csv(path)

    return df