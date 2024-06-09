import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from functions import getData
import redis
import pickle

load_dotenv()

departments = [22, 29, 35, 56]
datasets = ['rrt_vent', 'autre_params']

redis_client = redis.StrictRedis(host= 'localhost' if os.getenv("ENV") == "development" else os.getenv("HOST"), port=6379, db=0)

def save_to_redis(key, data):
    try:
        redis_client.set(key, pickle.dumps(data))
    except Exception as e:
        print(f"Erreur lors de la sauvegarde des données dans Redis pour la clé {key}: {e}")

# Charger et traiter les données au démarrage de l'application
def load_and_cache_data():
    columns = {
        'rrt_vent': ['TX', 'TN', 'TNTXM', 'TNSOL', 'TN50', 'RR'],
        'autre_params': ['NEIG', 'BROU', 'ORAG', 'GRESIL', 'GRELE', 'ROSEE', 'GELEE', 'FUMEE', 'BRUME', 'ECLAIR', 'PMERM', 'PMERMIN'],
    }
    
    all_data = {dataset: [] for dataset in datasets}

    for dept in departments:
        dept_data = {}
        for dataset in datasets:
            try:
                columns_tuple = tuple(columns[dataset])
                data = getData(dept, dataset, columns_tuple)
                all_data[dataset].append(data)
                dept_data[dataset] = data
                # Sérialiser et stocker les données dans Redis
                key = f"{dept}_{dataset}"
                save_to_redis(key, data)
            except Exception as e:
                print(f"Erreur lors de la sauvegarde des données pour {dept} et {dataset}: {e}")

    combined_data_all_depts_annual_sum = []

    for dataset in datasets:
        try:
            thresholds = {}
            combined_data = pd.concat(all_data[dataset], ignore_index=True)

            for column in columns[dataset]:
                if column in combined_data.columns:
                    median_value = combined_data[column].median()
                    combined_data[column].fillna(median_value)  # Use inplace=True to modify the DataFrame in place

            grouped = combined_data.groupby(['ANNEE', 'LAT', 'LON', 'NOM_USUEL']).agg({
                column: 'sum' for column in columns[dataset]
            }).reset_index()

            combined_data_all_depts_annual_sum.append(grouped)

            data_json = grouped.to_json(orient='records')

            key = f"{dataset}_annual_sum"
            save_to_redis(key, data_json)
        except Exception as e:
            print(f"Erreur lors du calcul de la somme annuelle pour {dataset}: {e}")

    # Fusionner les données de tous les départements
    try:
        merged_all_data = pd.concat(combined_data_all_depts_annual_sum, ignore_index=True)
        merged_all_data_json = merged_all_data.to_json(orient='records')
        save_to_redis("all_data_depts_annual_sum", merged_all_data_json)
    except Exception as e:
        print(f"Erreur lors de la fusion de toutes les données de tous les départements: {e}")

    # données co2
    try:
        url = "https://www.data.gouv.fr/fr/datasets/r/dabbfbe4-da24-4bc6-be8b-af00a3691ff7"
        data = pd.read_csv(url, header=0, sep=';', encoding='latin1')
        data['emission'] = data['emission'].str.replace(',', '.').astype(float)

        df = data.copy()
        df['emission'] = data['emission'] / 1_000_000

        data_gaz = df.groupby(['annee_ref', 'secteur', 'energie', 'polluant'])['emission'].sum().reset_index()
        save_to_redis("data_gaz", data_gaz.to_json(orient='records'))
    except Exception as e:
        print(f"Erreur lors du chargement du dataset de CO2: {e}")

# Précharger et mettre en cache les données
load_and_cache_data()

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.after_request
    def add_header(response):
        response.cache_control.max_age = 300
        return response

    @app.route("/gaz", methods=["GET"])
    def data_gaz():
        try:
            # Générer une clé unique pour le cache basée sur les paramètres de la requête
            cache_key = f"data_gaz"

            # Vérifier si les résultats sont dans le cache Redis
            cached_data = redis_client.get(cache_key)
            if cached_data:
                # Charger les résultats mis en cache
                data_json = pickle.loads(cached_data)
                #data_json = cached_data.decode('utf-8')
                response = make_response(data_json)
                response.headers["Content-Type"] = "application/json"
                return response, 200
            
            return make_response(jsonify({"error": "Data not found in cache"}), 404)
            
            response = make_response(data_json)
            response.headers["Content-Type"] = "application/json"
            return response, 200
        except ValueError as ve:
            app.logger.error(f"erreur du calucl des données : {ve}")
            return make_response(jsonify({"error": str(ve)}), 400)
        except Exception as e:
            app.logger.error(f"Erreur: {e}")
            return make_response(jsonify({"error": "Internal Server Error"}), 500)

    @app.route("/average_tntxm_pmerr_per_time", methods=["GET"])
    def average_tntxm_pmerr_per_time():
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        column_time = request.args.get('column_time')
        departement = int(request.args.get('departement'))

        try:
            result = []
            # Charger les données pour le département spécifié
            rrt_vent_key = f"{departement}_rrt_vent"
            autre_params_key = f"{departement}_autre_params"

            rrt_vent_data = redis_client.get(rrt_vent_key)
            autre_params_data = redis_client.get(autre_params_key)

            # Vérifier si les données ont été trouvées dans Redis
            if rrt_vent_data is None or autre_params_data is None:
                return make_response(jsonify({"error": "Data not found"}), 404)
            
            # Convertir les données de bytes à DataFrame
            rrt_vent_data = pickle.loads(rrt_vent_data)
            autre_params_data = pickle.loads(autre_params_data)
            
            start_date = pd.to_datetime(start_date)
            end_date = pd.to_datetime(end_date)
            rrt_vent_data = rrt_vent_data[(rrt_vent_data['AAAAMMJJ'] >= start_date) & (rrt_vent_data['AAAAMMJJ'] <= end_date)]
            autre_params_data = autre_params_data[(autre_params_data['AAAAMMJJ'] >= start_date) & (autre_params_data['AAAAMMJJ'] <= end_date)]

            # Calculer les moyennes annuelles
            rrt_vent_grouped = rrt_vent_data.groupby(column_time)['TNTXM'].mean().reset_index()
            autre_params_grouped = autre_params_data.groupby(column_time)['PMERM'].mean().reset_index()

            # Fusionner les résultats
            merged = pd.merge(rrt_vent_grouped, autre_params_grouped, on=column_time, how='inner')
            result.extend(merged.to_dict(orient='records'))
            
            response = make_response(jsonify(result))
            response.headers["Content-Type"] = "application/json"
            return response, 200

        except Exception as e:
            app.logger.error(f"Erreur: {e}")
            return make_response(jsonify({"error": "Internal Server Error"}), 500)

    @app.route("/annual_sum_data", methods=["GET"])
    def annualSumData():
        annee = request.args.get('annee')
        dataset = request.args.get('dataset')
        columns = request.args.getlist('columns')

        try:
            # Générer une clé unique pour le cache basée sur les paramètres de la requête
            cache_key = f"{dataset}_annual_sum"

            # Vérifier si les résultats sont dans le cache Redis
            cached_data = redis_client.get(cache_key)
            if cached_data:
                # Charger les résultats mis en cache et décoder correctement
                data_json = pickle.loads(cached_data)
                data = pd.read_json(data_json)

                # Filtrer par année
                data = data[data['ANNEE'] == int(annee)]

                # Sélectionner les colonnes spécifiques
                selected_columns = ['ANNEE', 'LAT', 'LON'] + columns  # Assurez-vous que ces colonnes existent dans vos données
                data = data[selected_columns]

                # Convertir les résultats en JSON
                data_json = data.to_json(orient='records')
                response = make_response(data_json)
                response.headers["Content-Type"] = "application/json"
                return response, 200

            return make_response(jsonify({"error": "Data not found in cache"}), 404)

        except ValueError as ve:
            app.logger.error(f"ValueError: {ve}")
            return make_response(jsonify({"error": str(ve)}), 400)
        except Exception as e:
            app.logger.error(f"Erreur: {e}")
            return make_response(jsonify({"error": "Internal Server Error"}), 500)
        
    @app.route("/data_per_month", methods=["GET"])
    def dataPerMonth():
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        departement = int(request.args.get('departement'))

        try:
            columns = request.args.getlist('columns')
            columns_tuple = tuple(columns)
            
            # Générer une clé unique pour le cache basée sur les paramètres de la requête
            cache_key = f"data_per_month:{departement}:{start_date}:{end_date}:{columns_tuple}"

            # Vérifier si les résultats sont dans le cache Redis
            cached_data = redis_client.get(cache_key)
            if cached_data:
                # Charger les résultats mis en cache
                data_json = cached_data.decode('utf-8')
                response = make_response(data_json)
                response.headers["Content-Type"] = "application/json"
                return response, 200
            
            data = pd.DataFrame()

            key = f"{departement}_rrt_vent"
            cached_data = redis_client.get(key)
            if cached_data:
                data = pickle.loads(cached_data)

            start_date = pd.to_datetime(start_date)
            end_date = pd.to_datetime(end_date)
            data = data[(data['AAAAMMJJ'] >= start_date) & (data['AAAAMMJJ'] <= end_date)]

            # Vérifier s'il y a des données à traiter
            if data.empty or all(data[col].isna().all() for col in columns):
                return make_response(jsonify({"error": "No data available for the given parameters"}), 404)

            # Agrégation des données par mois
            monthly_grouped = data.groupby('MOIS')[columns].mean().reset_index()

            monthly_grouped.reset_index(drop=True, inplace=True)

            data_json = monthly_grouped.to_json(orient='records')
            
            redis_client.setex(cache_key, 3600, data_json)

            response = make_response(data_json)
            response.headers["Content-Type"] = "application/json"
            return response, 200
        except ValueError as ve:
            app.logger.error(f"ValueError: {ve}")
            return make_response(jsonify({"error": str(ve)}), 400)
        except Exception as e:
            app.logger.error(f"Erreur: {e}")
            return make_response(jsonify({"error": "Internal Server Error"}), 500)

    @app.route("/data_per_year", methods=["GET"])
    def dataPerYear():
        # Récupérer les colonnes de la requête
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        departement = int(request.args.get('departement'))

        try:
            columns = request.args.getlist('columns')
            columns_tuple = tuple(columns)

            # Générer une clé unique pour le cache basée sur les paramètres de la requête
            cache_key = f"data_per_year:{departement}:{start_date}:{end_date}:{columns_tuple}"

            # Vérifier si les résultats sont dans le cache Redis
            cached_data = redis_client.get(cache_key)
            if cached_data:
                # Charger les résultats mis en cache
                data_json = cached_data.decode('utf-8')
                response = make_response(data_json)
                response.headers["Content-Type"] = "application/json"
                return response, 200
            
            data = pd.DataFrame()

            key = f"{departement}_rrt_vent"
            cached_data = redis_client.get(key)
            if cached_data:
                data = pickle.loads(cached_data)

            start_date = pd.to_datetime(start_date)
            end_date = pd.to_datetime(end_date)
            data = data[(data['AAAAMMJJ'] >= start_date) & (data['AAAAMMJJ'] <= end_date)]

            # Vérifier s'il y a des données à traiter
            if data.empty or all(data[col].isna().all() for col in columns):
                return make_response(jsonify({"error": "No data available for the given parameters"}), 404)

            grouped = data.groupby('ANNEE')[columns].mean().reset_index() # calcul de la moyenne par année pour chaque température
            
            # Réinitialiser l'index du DataFrame
            grouped.reset_index(drop=True, inplace=True)

            data_json = grouped.to_json(orient='records')

            # Stocker les résultats dans le cache Redis pour 1h = 3600s //// 24h = 86400 secondes (24 heures * 60 minutes * 60 secondes)
            redis_client.setex(cache_key, 3600, data_json)
            
            response = make_response(data_json)
            response.headers["Content-Type"] = "application/json"
            return response, 200
        except ValueError as ve:
            app.logger.error(f"erreur du calucl des données : {ve}")
            return make_response(jsonify({"error": str(ve)}), 400)
        except Exception as e:
            app.logger.error(f"Erreur: {e}")
            return make_response(jsonify({"error": "Internal Server Error"}), 500)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=8082, debug = os.getenv("ENV") == "development")
