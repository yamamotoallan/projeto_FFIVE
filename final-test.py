import requests
import json

BASE_URL = "https://gest-o-agenda-marcenaria-production.up.railway.app"
EMAIL = "admin@marcenaria.pro"
PASSWORD = "123"

print("\n" + "="*70)
print("AUTO-TEST - MARCENARIA PRO BACKEND")
print("="*70)

# TEST 1: Health Check
print("\n[TEST 1] HEALTH CHECK")
print("-" * 70)
try:
    r = requests.get(f"{BASE_URL}/health", timeout=10)
    print(f"Status: {r.status_code}")
    health_data = r.json()
    print(f"Database: {health_data['services']['database']}")
    print(f"Cloudinary: {health_data['services']['cloudinary']}")
    test1_pass = r.status_code == 200
    print(f"Result: {'[PASS]' if test1_pass else '[FAIL]'}")
except Exception as e:
    print(f"Result: [FAIL] - {e}")
    test1_pass = False

# TEST 2: Login
print("\n[TEST 2] LOGIN ({} / {})".format(EMAIL, PASSWORD))
print("-" * 70)
token = None
try:
    r = requests.post(f"{BASE_URL}/api/login", json={"email": EMAIL, "password": PASSWORD}, timeout=10)
    print(f"Status: {r.status_code}")
    login_data = r.json()
    
    if r.status_code == 200 and login_data.get('token'):
        token = login_data['token']
        print(f"Token: {token[:50]}...")
        print(f"User: {login_data.get('user', {}).get('name', 'Unknown')}")
        test2_pass = True
        print("Result: [PASS]")
    else:
        print(f"Message: {login_data.get('message', 'Unknown error')}")
        test2_pass = False
        print("Result: [FAIL]")
except Exception as e:
    print(f"Result: [FAIL] - {e}")
    test2_pass = False

# TEST 3: Create Quote
print("\n[TEST 3] CREATE QUOTE")
print("-" * 70)
quote_id = None
if token:
    try:
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
        data = {
            "client": "Cliente Auto-Test",
            "project": "Projeto Upload Test",
            "value": 5000.00,
            "status": "Pendente",
            "phone": "(11) 99999-9999",
            "project_type": "Cozinha",
            "service_type": "Moveis planejados",
            "notes": "Criado por teste automatico Python"
        }
        r = requests.post(f"{BASE_URL}/api/quotes", json=data, headers=headers, timeout=10)
        print(f"Status: {r.status_code}")
        
        if r.status_code >= 200 and r.status_code < 300:
            quote_data = r.json()
            quote_id = quote_data.get('id')
            print(f"Quote ID: {quote_id}")
            test3_pass = True
            print("Result: [PASS]")
        else:
            print(f"Response: {r.text[:200]}")
            test3_pass = False
            print("Result: [FAIL]")
    except Exception as e:
        print(f"Result: [FAIL] - {e}")
        test3_pass = False
else:
    print("Skipped (login failed)")
    test3_pass = False

# TEST 4: Upload File
print("\n[TEST 4] FILE UPLOAD")
print("-" * 70)
if token and quote_id:
    try:
        import os
        filename = 'python-auto-test.txt'
        
        # Create test file
        with open(filename, 'w') as f:
            f.write('=== TESTE AUTOMATICO PYTHON ===\n')
            f.write('Sistema: Marcenaria Pro\n')
            f.write('Data: 2026-01-29\n')
            f.write('Teste: Upload via Python requests\n')
            f.write('Quote ID: {}\n'.format(quote_id))
        
        print(f"Created file: {filename}")
        
        # Upload
        headers = {'Authorization': f'Bearer {token}'}
        with open(filename, 'rb') as f:
            files = {'files': (filename, f, 'text/plain')}
            r = requests.post(
                f"{BASE_URL}/api/quotes/{quote_id}/files",
                files=files,
                headers=headers,
                timeout=30
            )
        
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:300]}")
        
        test4_pass = r.status_code >= 200 and r.status_code < 300
        print(f"Result: {'[PASS]' if test4_pass else '[FAIL]'}")
        
        # Cleanup
        if os.path.exists(filename):
            os.remove(filename)
            
    except Exception as e:
        print(f"Result: [FAIL] - {e}")
        test4_pass = False
else:
    print("Skipped (previous tests failed)")
    test4_pass = False

# SUMMARY
print("\n" + "="*70)
print("TEST SUMMARY")
print("="*70)
print(f"1. Health Check:  {'[PASS]' if test1_pass else '[FAIL]'}")
print(f"2. Login:         {'[PASS]' if test2_pass else '[FAIL]'}")
print(f"3. Create Quote:  {'[PASS]' if test3_pass else '[FAIL]'}")
print(f"4. File Upload:   {'[PASS]' if test4_pass else '[FAIL]'}")
print("="*70)

all_pass = all([test1_pass, test2_pass, test3_pass, test4_pass])
if all_pass:
    print("\n*** ALL TESTS PASSED - SISTEMA 100% FUNCIONAL ***\n")
else:
    print("\n*** SOME TESTS FAILED - CHECK DETAILS ABOVE ***\n")
