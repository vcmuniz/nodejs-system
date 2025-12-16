#!/bin/bash

# ClubFacts API - Test Script Examples
# Use este script para testar manualmente os endpoints da API

BASE_URL="http://localhost:8080"

echo "=== ClubFacts API Test Examples ==="
echo ""

# Health Check
echo "1. Health Check:"
echo "curl -X GET $BASE_URL/health"
echo ""

# Welcome
echo "2. Welcome:"
echo "curl -X GET $BASE_URL/"
echo ""

# Sign In
echo "3. Sign In (get JWT token):"
echo "curl -X POST $BASE_URL/auth/signin \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\": \"user@example.com\", \"password\": \"password123\"}'"
echo ""
echo "# Save the token from response:"
echo "TOKEN=<your_token_here>"
echo ""

# Get All Orders
echo "4. Get All Orders (requires authentication):"
echo "curl -X GET $BASE_URL/orders \\"
echo "  -H 'Authorization: Bearer \$TOKEN' \\"
echo "  -H 'Content-Type: application/json'"
echo ""

# Create Order
echo "5. Create Order (requires authentication):"
echo "curl -X POST $BASE_URL/orders \\"
echo "  -H 'Authorization: Bearer \$TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"items\": [{\"productId\": \"prod123\", \"quantity\": 2, \"price\": 29.99}]}'"
echo ""

# Access Swagger Documentation
echo "6. Access Swagger Documentation:"
echo "   Open in browser: $BASE_URL/api-docs"
echo ""

echo "=== To run actual tests, uncomment below and set a real token ==="
echo ""

# Uncomment to run actual tests
# TOKEN="your_actual_token_here"
# 
# echo "Testing Health..."
# curl -X GET $BASE_URL/health
# 
# echo -e "\n\nTesting Sign In..."
# RESPONSE=$(curl -X POST $BASE_URL/auth/signin \
#   -H 'Content-Type: application/json' \
#   -d '{"email": "user@example.com", "password": "password123"}')
# echo $RESPONSE
# 
# TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
# echo "Token: $TOKEN"
# 
# echo -e "\n\nTesting Get Orders..."
# curl -X GET $BASE_URL/orders \
#   -H "Authorization: Bearer $TOKEN" \
#   -H 'Content-Type: application/json'
# 
# echo -e "\n\nTesting Create Order..."
# curl -X POST $BASE_URL/orders \
#   -H "Authorization: Bearer $TOKEN" \
#   -H 'Content-Type: application/json' \
#   -d '{"items": [{"productId": "prod123", "quantity": 2, "price": 29.99}]}'
