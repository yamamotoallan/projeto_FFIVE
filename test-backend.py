import requests
import json

BASE_URL = "https://gest-o-agenda-marcenaria-production.up.railway.app"

print("="*60)
print("🧪 TESTE AUTOMÁTICO - SISTEMA DE UPLOAD")
print("="*60)

# Test 1: Health Check
print("\n📊 Test 1: Health Check")
print("-" * 60)
try:
    response = requests.get(f"{BASE_URL}/health", timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    if response.status_code == 200:
        print("✅ Health check PASSOU")
    else:
        print("❌ Health check FALHOU")
except Exception as e:
    print(f"❌ Erro: {e}")

# Test 2: Login
print("\n🔐 Test 2: Login")
print("-" * 60)
try:
    login_data = {
        "email": "admin@admin.com",
        "password": "123456"
    }
    response = requests.post(
        f"{BASE_URL}/api/login",
        json=login_data,
        timeout=10
    )
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 200 and result.get('token'):
        token = result['token']
        print(f"✅ Login PASSOU - Token: {token[:30]}...")
    else:
        print(f"❌ Login FALHOU - {result.get('message', 'Unknown error')}")
        token = None
except Exception as e:
    print(f"❌ Erro: {e}")
    token = None

# Test 3: Upload (apenas se login funcionou)
if token:
    print("\n📤 Test 3: File Upload")
    print("-" * 60)
    try:
        # Criar arquivo de teste
        with open('test-file.txt', 'w') as f:
            f.write('Este é um arquivo de teste para upload no sistema Marcenaria Pro')
        
        # Tentar upload
        files = {'files': ('test-file.txt', open('test-file.txt', 'rb'), 'text/plain')}
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.post(
            f"{BASE_URL}/api/quotes/1/files",
            files=files,
            headers=headers,
            timeout=15
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code == 200:
            print("✅ Upload PASSOU")
        elif response.status_code == 404:
            print("⚠️  Quote #1 não existe - criando quote primeiro...")
            # Tentar criar quote
            quote_data = {
                "client": "Teste Auto",
                "project": "Teste Upload",
                "value": 1000,
                "status": "Pendente"
            }
            create_response = requests.post(
                f"{BASE_URL}/api/quotes",
                json=quote_data,
                headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
                timeout=10
            )
            print(f"Create quote status: {create_response.status_code}")
            if create_response.status_code == 201:
                new_quote = create_response.json()
                print(f"Quote criado: {new_quote}")
        else:
            print(f"❌ Upload FALHOU - Status {response.status_code}")
            
        # Cleanup
        import os
        os.remove('test-file.txt')
            
    except Exception as e:
        print(f"❌ Erro no upload: {e}")
else:
    print("\n⏭️  Test 3: PULADO (login falhou)")

# Test 4: Verificar variáveis de ambiente (via logs de erro)
print("\n🔍 Test 4: Verificar configuração")
print("-" * 60)
print("Checklist de variáveis necessárias no Railway:")
print("  ☐ DATABASE_URL")
print("  ☐ JWT_SECRET")
print("  ☐ CLOUDINARY_CLOUD_NAME")
print("  ☐ CLOUDINARY_API_KEY")
print("  ☐ CLOUDINARY_API_SECRET")
print("\n📝 Nota: Verifique manualmente no Railway → Variables")

print("\n" + "="*60)
print("TESTE CONCLUÍDO")
print("="*60)
