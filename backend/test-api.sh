#!/bin/bash

# Script de test pour l'API d'authentification
BASE_URL="http://localhost:3000/api"

echo "🧪 Test de l'API d'authentification"
echo "=================================="

# Test 1: Vérifier que le serveur fonctionne
echo "📡 Test 1: Vérification du serveur"
curl -X GET "$BASE_URL/../" -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Inscription d'un nouvel utilisateur
echo "👤 Test 2: Inscription d'un utilisateur"
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "motdepasse123",
    "name": "Utilisateur Test",
    "age": 25,
    "gender": "male"
  }')

echo "Réponse inscription:"
echo "$SIGNUP_RESPONSE"
echo -e "\n"

# Test 3: Connexion
echo "🔑 Test 3: Connexion"
# Génération d'un token client (simulation)
CLIENT_TOKEN=$(openssl rand -hex 32)
echo "Token client généré: ${CLIENT_TOKEN:0:20}..."

SIGNIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"password\": \"motdepasse123\",
    \"clientToken\": \"$CLIENT_TOKEN\"
  }")

echo "Réponse connexion:"
echo "$SIGNIN_RESPONSE"
echo -e "\n"

# Extraire l'UUID de la réponse
USER_UUID=$(echo "$SIGNIN_RESPONSE" | grep -o '"uuid":"[^"]*"' | cut -d'"' -f4)
echo "UUID utilisateur: $USER_UUID"
echo -e "\n"

# Test 4: Vérification du token
if [ ! -z "$USER_UUID" ]; then
  echo "✅ Test 4: Vérification du token"
  curl -X POST "$BASE_URL/auth/verify" \
    -H "Content-Type: application/json" \
    -d "{
      \"clientToken\": \"$CLIENT_TOKEN\",
      \"userUuid\": \"$USER_UUID\"
    }"
  echo -e "\n"
  
  # Test 5: Récupération des informations utilisateur
  echo "👥 Test 5: Récupération des utilisateurs"
  curl -X GET "$BASE_URL/users" \
    -H "Content-Type: application/json"
  echo -e "\n"
  
  # Test 6: Déconnexion
  echo "🚪 Test 6: Déconnexion"
  curl -X POST "$BASE_URL/auth/signout" \
    -H "Content-Type: application/json" \
    -d "{
      \"clientToken\": \"$CLIENT_TOKEN\",
      \"userUuid\": \"$USER_UUID\"
    }"
  echo -e "\n"
fi

# Test 7: Test d'erreur - connexion avec mauvais mot de passe
echo "❌ Test 7: Test d'erreur - mauvais mot de passe"
curl -X POST "$BASE_URL/auth/signin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test@example.com\",
    \"password\": \"mauvais_mot_de_passe\",
    \"clientToken\": \"$(openssl rand -hex 32)\"
  }"
echo -e "\n"

echo "🏁 Tests terminés !"
