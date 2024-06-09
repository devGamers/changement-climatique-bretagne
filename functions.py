import pandas as pd
from functools import lru_cache
from utils import read_csv_with_cache, preprocess_data, filter_data, select_columns

@lru_cache(maxsize=10)
#def get_filtered_data(link: str, columns: tuple, start_date: str, end_date: str) -> pd.DataFrame:
def get_filtered_data(link: str, columns: tuple) -> pd.DataFrame:
    df = read_csv_with_cache(link, compression='gzip', header=0, sep=';')
    #df = preprocess_data(df, start_date, end_date)
    df = preprocess_data(df)
    df = filter_data(df, list(columns))
    df = select_columns(df, list(columns))
    
    return df

@lru_cache(maxsize=10)
#def getData(department: int, dataset: str, columns: tuple, start_date: str, end_date: str) -> pd.DataFrame:
def getData(department: int, dataset: str, columns: tuple) -> pd.DataFrame:
    data_link = {
        22: {
            'rrt_vent': {
                '1950_2022': "https://www.data.gouv.fr/fr/datasets/r/ecda48c2-f09e-4509-951d-e16abe42a872",
                '2023_2024': "https://www.data.gouv.fr/fr/datasets/r/9b1987ee-5602-4d70-962b-8c44bb1322b3",
            },
            'autre_params': {
                '1950_2022': "https://www.data.gouv.fr/fr/datasets/r/dcfa050f-d597-4079-abee-16a1709ed0b7",
                '2023_2024': "https://www.data.gouv.fr/fr/datasets/r/41db67c6-0305-47d0-b468-b756d55880ff",
            }
        },
        29: {
            'rrt_vent': {
                '1950_2022': "https://www.data.gouv.fr/fr/datasets/r/8349df0f-a964-4ddb-b4b2-9b8ea09ad970",
                '2023_2024': "https://www.data.gouv.fr/fr/datasets/r/6216d652-b35f-4cf9-bff0-0c3dfb28f4a1",
            },
            'autre_params': {
                '1950_2022': "https://www.data.gouv.fr/fr/datasets/r/4f01bc95-b3a5-4ff1-92e9-9305b69ecdfa",
                '2023_2024': "https://www.data.gouv.fr/fr/datasets/r/f7fd3e97-fccf-4b96-b739-d82cfa547e74",
            }
        },
        35: {
            'rrt_vent': {
                '1950_2022': "https://www.data.gouv.fr/fr/datasets/r/8051582c-2f1b-41c6-85a5-2f7f98389193",
                '2023_2024': "https://www.data.gouv.fr/fr/datasets/r/42760f87-0231-49b7-ac02-182ccced1f05",
            },
            'autre_params': {
                '1950_2022': "https://www.data.gouv.fr/fr/datasets/r/5706dd09-5646-438a-b3dc-6f90a8acdff0",
                '2023_2024': "https://www.data.gouv.fr/fr/datasets/r/45ffe00f-6b32-4093-93b3-66c0eef3704e",
            }
        },
        56: {
            'rrt_vent': {
                '1950_2022': "https://www.data.gouv.fr/fr/datasets/r/570b8bec-5e45-4276-8738-bc0aa82f782a",
                '2023_2024': "https://www.data.gouv.fr/fr/datasets/r/74d2f82d-8f4f-4737-9c49-89645223d0cc",
            },
            'autre_params': {
                '1950_2022': "https://www.data.gouv.fr/fr/datasets/r/b88fcb14-5517-491b-be8f-fab848659f3a",
                '2023_2024': "https://www.data.gouv.fr/fr/datasets/r/3d5dd19c-fb73-400a-9c0b-63825cd345a8",
            }
        }
    }
    
    try:
        link_data_depart = data_link[department][dataset]
    except KeyError:
        raise ValueError(f"Aucun lien de données trouvé pour le département {department} et le dataset {dataset}")
  
    link_1950_2022 = link_data_depart['1950_2022']
    link_2023_2024 = link_data_depart['2023_2024']

    try:
        #df_1950_2022 = get_filtered_data(link_1950_2022, columns, start_date, end_date)
        #df_2023_2024 = get_filtered_data(link_2023_2024, columns, start_date, end_date)
        df_1950_2022 = get_filtered_data(link_1950_2022, columns)
        df_2023_2024 = get_filtered_data(link_2023_2024, columns)
    except Exception as e:
        print(f"Erreur lors du chargement des données: {e}")
        return None

    # Concaténer les DataFrames pour combiner les données sans créer de colonnes supplémentaires
    merged_df = pd.concat([df_1950_2022, df_2023_2024], ignore_index=True)

    return merged_df

@lru_cache(maxsize=10)
def get_annual_min_max(df: pd.DataFrame, columns: tuple) -> pd.DataFrame:
    columns = list(columns)
    # Créer un dictionnaire d'agrégations dynamiquement
    aggregations = {}
    for column in columns:
        aggregations[f'{column}_min'] = (column, 'min')
        aggregations[f'{column}_max'] = (column, 'max')
    
    # Group by 'ANNEE' et appliquer les agrégations
    annual_min_max = df.groupby('ANNEE').agg(**aggregations).reset_index()
    
    return annual_min_max

def calculate_temperature_thresholds(column: pd.DataFrame):
    Q1 = column.quantile(0.25)
    Q3 = column.quantile(0.75)
    mean = column.mean()
    std = column.std()
    return {
        'Seuil Bas': Q1,
        'Seuil Moyen': mean + std,
        'Seuil Élevé': mean + 2 * std
    }
