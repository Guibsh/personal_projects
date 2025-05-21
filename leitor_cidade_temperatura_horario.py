import requests
from datetime import datetime
import pytz  # para timezone

# Sua chave da API do OpenWeatherMap
API_KEY = '07f377f03a68f792ca38e566b734d762'  # <- substitua aqui


def obter_dados_clima(cidade):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={cidade}&appid={API_KEY}&units=metric&lang=pt_br"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Erro: {e}")
        return None


def mostrar_dados(dados):
    nome = dados['name']
    temp = dados['main']['temp']
    fuso = dados['timezone']  # segundos em relação ao UTC
    dt_utc = datetime.utcnow()
    horario_local = dt_utc.timestamp() + fuso
    horario_convertido = datetime.fromtimestamp(horario_local).strftime("%H:%M:%S")

    print(f"\n📍 Cidade: {nome}")
    print(f"🌡️  Temperatura atual: {temp}°C")
    print(f"🕒 Horário local: {horario_convertido}")


cidade = input("Digite o nome da cidade (ex: São Paulo): ")
dados = obter_dados_clima(cidade)

if dados and dados.get('cod') == 200:
    mostrar_dados(dados)
else:
    print("Cidade não encontrada ou erro na API.")
