#!/bin/bash

# API Examples for Inventory System
# Replace {BASE_URL} with your API URL (e.g., http://localhost:3000)
# Replace {TOKEN} with your JWT token

BASE_URL="http://localhost:3000"
TOKEN="your_jwt_token_here"

echo "=== INVENTORY SYSTEM API EXAMPLES ==="
echo ""

# ============ CATEGORIES ============
echo "--- CREATE CATEGORY ---"
curl -X POST $BASE_URL/inventory/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Eletrônicos",
    "description": "Produtos eletrônicos em geral",
    "image": "https://example.com/electronics.jpg"
  }'
echo ""

echo "--- GET ALL CATEGORIES ---"
curl -X GET $BASE_URL/inventory/categories \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET CATEGORY BY ID ---"
curl -X GET $BASE_URL/inventory/categories/{categoryId} \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- UPDATE CATEGORY ---"
curl -X PUT $BASE_URL/inventory/categories/{categoryId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Eletrônicos e Acessórios",
    "description": "Eletrônicos e acessórios variados"
  }'
echo ""

echo "--- DELETE CATEGORY ---"
curl -X DELETE $BASE_URL/inventory/categories/{categoryId} \
  -H "Authorization: Bearer $TOKEN"
echo ""

# ============ PRODUCTS ============
echo "--- CREATE PRODUCT ---"
curl -X POST $BASE_URL/inventory/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "categoryId": "cat-001",
    "name": "Notebook Dell XPS 13",
    "sku": "NB-DELL-XPS-13",
    "price": 4500.00,
    "quantity": 10,
    "description": "Notebook Dell XPS 13 com Intel i7, 16GB RAM, SSD 512GB",
    "type": "PHYSICAL",
    "cost": 3000.00,
    "minQuantity": 2
  }'
echo ""

echo "--- GET ALL PRODUCTS ---"
curl -X GET "$BASE_URL/inventory/products?skip=0&take=20" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET PRODUCT BY ID ---"
curl -X GET $BASE_URL/inventory/products/{productId} \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET PRODUCTS BY CATEGORY ---"
curl -X GET $BASE_URL/inventory/products/category/{categoryId} \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET LOW STOCK PRODUCTS ---"
curl -X GET $BASE_URL/inventory/products/low-stock \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- UPDATE PRODUCT ---"
curl -X PUT $BASE_URL/inventory/products/{productId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "price": 4200.00,
    "minQuantity": 3,
    "description": "Notebook Dell XPS 13 - Novo lote"
  }'
echo ""

# ============ PRODUCT IMAGES ============
echo "--- UPLOAD PRODUCT IMAGE ---"
curl -X POST $BASE_URL/inventory/products/{productId}/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "alt=Foto frontal do notebook"
echo ""

echo "--- REMOVE PRODUCT IMAGE ---"
curl -X DELETE $BASE_URL/inventory/products/{productId}/images \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "imageIndex": 0
  }'
echo ""

# ============ STOCK ENTRIES ============
echo "--- CREATE STOCK ENTRY ---"
curl -X POST $BASE_URL/inventory/stock-entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": "prod-001",
    "quantity": 50,
    "description": "Compra do fornecedor XYZ",
    "reference": "NF-2025-001"
  }'
echo ""

echo "--- GET STOCK ENTRIES BY PRODUCT ---"
curl -X GET "$BASE_URL/inventory/stock-entries/product/{productId}?skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET USER STOCK HISTORY ---"
curl -X GET "$BASE_URL/inventory/stock-entries/user/history?skip=0&take=20" \
  -H "Authorization: Bearer $TOKEN"
echo ""

# ============ STOCK MOVEMENTS ============
echo "--- RECORD STOCK ENTRY ---"
curl -X POST $BASE_URL/inventory/stock-movements/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": "prod-001",
    "quantity": 25,
    "description": "Entrada de estoque",
    "reference": "NF-2025-002"
  }'
echo ""

echo "--- RECORD STOCK EXIT ---"
curl -X POST $BASE_URL/inventory/stock-movements/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": "prod-001",
    "quantity": 5,
    "description": "Saída de estoque",
    "reason": "Venda para cliente",
    "reference": "PD-2025-001"
  }'
echo ""

echo "--- RECORD STOCK ADJUSTMENT ---"
curl -X POST $BASE_URL/inventory/stock-movements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": "prod-001",
    "type": "ADJUSTMENT",
    "quantity": -2,
    "description": "Ajuste de inventário",
    "reason": "Produtos danificados"
  }'
echo ""

# ============ QUOTES ============
echo "--- CREATE QUOTE ---"
curl -X POST $BASE_URL/inventory/quotes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "clientName": "João Silva",
    "clientEmail": "joao@example.com",
    "clientPhone": "+55 11 99999-9999",
    "items": [
      {
        "productId": "prod-001",
        "quantity": 2,
        "unitPrice": 4500.00
      },
      {
        "productId": "prod-002",
        "quantity": 1,
        "unitPrice": 1500.00
      }
    ],
    "discount": 100.00,
    "tax": 0,
    "notes": "Orçamento válido por 30 dias",
    "validUntil": "2025-01-12T00:00:00Z"
  }'
echo ""

echo "--- GET ALL QUOTES ---"
curl -X GET "$BASE_URL/inventory/quotes?skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET QUOTE BY ID ---"
curl -X GET $BASE_URL/inventory/quotes/{quoteId} \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET QUOTES BY STATUS ---"
curl -X GET $BASE_URL/inventory/quotes/status/DRAFT \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- UPDATE QUOTE STATUS ---"
curl -X PATCH $BASE_URL/inventory/quotes/{quoteId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "SENT"
  }'
echo ""

echo "--- CONVERT QUOTE TO ORDER ---"
curl -X POST $BASE_URL/inventory/quotes/{quoteId}/convert-to-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "discount": 100.00,
    "notes": "Pedido confirmado pelo cliente"
  }'
echo ""

# ============ ORDERS ============
echo "--- CREATE ORDER ---"
curl -X POST $BASE_URL/inventory/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "clientName": "Maria Santos",
    "clientEmail": "maria@example.com",
    "clientPhone": "+55 11 88888-8888",
    "address": "Rua das Flores, 123 - São Paulo, SP - 01234-567",
    "items": [
      {
        "productId": "prod-001",
        "quantity": 1,
        "unitPrice": 4500.00
      }
    ],
    "discount": 50.00,
    "tax": 0,
    "notes": "Entregar na segunda-feira",
    "quoteId": "qt-001"
  }'
echo ""

echo "--- GET ALL ORDERS ---"
curl -X GET "$BASE_URL/inventory/orders?skip=0&take=10" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET ORDER BY ID ---"
curl -X GET $BASE_URL/inventory/orders/{orderId} \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET ORDERS BY STATUS ---"
curl -X GET $BASE_URL/inventory/orders/status/CONFIRMED \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- UPDATE ORDER STATUS ---"
curl -X PATCH $BASE_URL/inventory/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "PROCESSING",
    "notes": "Pedido saiu para empacotamento"
  }'
echo ""

echo "--- SHIP ORDER ---"
curl -X PATCH $BASE_URL/inventory/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "SHIPPED",
    "trackingNumber": "BR123456789XY",
    "shippingDate": "2025-12-12T14:00:00Z"
  }'
echo ""

echo "--- DELIVER ORDER ---"
curl -X PATCH $BASE_URL/inventory/orders/{orderId}/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "DELIVERED",
    "deliveryDate": "2025-12-14T10:30:00Z"
  }'
echo ""

# ============ REPORTS ============
echo "--- GET STOCK REPORT ---"
curl -X GET $BASE_URL/inventory/reports/stock \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET SALES REPORT ---"
curl -X GET "$BASE_URL/inventory/reports/sales?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "--- GET DASHBOARD ---"
curl -X GET $BASE_URL/inventory/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo ""
echo "=== END OF EXAMPLES ==="
