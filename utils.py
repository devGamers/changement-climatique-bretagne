import pandas as pd
from functools import lru_cache

@lru_cache(maxsize=10)
def read_csv_with_cache(file_path: str, **kwargs) -> pd.DataFrame:
    return pd.read_csv(file_path, **kwargs)

#def preprocess_data(df: pd.DataFrame, start_date: str = None, end_date: str = None) -> pd.DataFrame:
def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    df['AAAAMMJJ'] = pd.to_datetime(df['AAAAMMJJ'], format='%Y%m%d')
    #if start_date:
    #    start_date = pd.to_datetime(start_date)
    #    df = df[df['AAAAMMJJ'] >= start_date]
    #if end_date:
    #    end_date = pd.to_datetime(end_date)
    #    df = df[df['AAAAMMJJ'] <= end_date]

    df['ANNEE'] = df['AAAAMMJJ'].dt.year
    df['MOIS'] = df['AAAAMMJJ'].dt.month
    df['JOUR'] = df['AAAAMMJJ'].dt.day
    return df

def filter_data(df: pd.DataFrame, columns: list) -> pd.DataFrame:
    filter_condition = True
    for column in columns:
        quality_col = f'Q{column}'
        if quality_col in df.columns:
            filter_condition &= (df[quality_col] != 2)
    
    #df = df[filter_condition].dropna(subset=columns)
    #df[columns] = df[columns].fillna(0)
    # Remplacer les NaN par la médiane pour les colonnes spécifiées
    
    df_filtered = df[filter_condition].copy()

    for column in columns:
        if column in df.columns:
            median_value = df_filtered[column].median()
            df_filtered[column].fillna(median_value)

    return df_filtered

def select_columns(df: pd.DataFrame, columns: list) -> pd.DataFrame:
    selected_columns = ['AAAAMMJJ', 'ANNEE', 'MOIS', 'JOUR', 'NUM_POSTE', 'NOM_USUEL', 'LAT', 'LON'] + columns
    return df[selected_columns]
