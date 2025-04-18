﻿# 🧠 AI Health Assistant WebApp

Aquest és el Treball de Final de Grau de **Roger Duran Lopez**: una aplicació web que integra **Intel·ligència Artificial**, **dispositius Fitbit** i **missatgeria per WhatsApp** per oferir un **agent de salut personalitzat**.

## 🚀 Objectiu

Crear un assistent intel·ligent que sigui capaç de:

- Analitzar mètriques de salut (passos, son, freqüència cardíaca...)
- Generar recomanacions personalitzades utilitzant Inteligencia Artificial per predir paràmetres de la salut.
- Tenir la capacitat de cmunicar-se amb l'usuari mitjançant WhatsApp.
- Utilitzar algoritmes d'IA per generar prediccions

## 📡 Tecnologies utilitzades

- Python 
- HTML / CSS / JavaScript
- Fitbit API (OAuth 2.0)
- IA / Machine Learning (per definir model)
- MongoDB o SQLite (per veure)

## 🔐 Autenticació OAuth 2.0

L'usuari s'autentica mitjançant l'API de Fitbit. A través "Autorización", que redirigeix al login oficial de Fitbit i després retorna un `authorization code` a un servidor local per tal de poder accedir al token d'accés.

---

## 🧠 Estat del projecte

- [x] Estructura HTML bàsica
- [x] Inici del flux OAuth 2.0
- [x] Intercanvi del codi per un access token
- [ ] Processament de dades i prediccions amb IA
- [ ] Interfície web millorada

---
