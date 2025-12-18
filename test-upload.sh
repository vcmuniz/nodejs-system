#!/bin/bash

# Criar um arquivo de teste
echo "Test file content" > /tmp/test-image.txt

# Fazer upload
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWozM2VxdjYwMDAyZjRwdHVjcWk0dXdsIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiIsImJ1c2luZXNzUHJvZmlsZUlkIjoiYnVzaW5lc3NfMTc2NTk5Nzk1Mzk3N19nanAwNjdraGciLCJpYXQiOjE3NjYwNjM3NzUsImV4cCI6MTc2NjE1MDE3NX0.rXuOtkgOkLLGyLXnCR3Pd_5TWcCoYmceWJVicAvF6Is" \
  -F "file=@/tmp/test-image.txt"

echo -e "\n"
