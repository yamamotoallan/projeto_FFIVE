import requests
import json
from datetime import datetime

BASE_URL = "https://gest-o-agenda-marcenaria-production.up.railway.app"
EMAIL = "admin@marcenaria.pro"
PASSWORD = "123"

class TestResult:
    def __init__(self, name):
        self.name = name
        self.passed = False
        self.message = ""
        self.details = ""
    
    def pass_test(self, message="", details=""):
        self.passed = True
        self.message = message
        self.details = details
    
    def fail_test(self, message="", details=""):
        self.passed = False
        self.message = message
        self.details = details

results = []

def print_header(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_test(test: TestResult):
    status = "[PASS]" if test.passed else "[FAIL]"
    color = "\033[92m" if test.passed else "\033[91m"
    reset = "\033[0m"
    print(f"{color}{status}{reset} {test.name}")
    if test.message:
        print(f"      {test.message}")
    if test.details:
        print(f"      Details: {test.details}")

# Global token variable
token = None
test_quote_id = None

print_header("COMPREHENSIVE SYSTEM TEST - MARCENARIA PRO")
print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Backend: {BASE_URL}")

# TEST 1: Health Check
print_header("TEST 1: HEALTH CHECK")
test = TestResult("Health endpoint")
try:
    r = requests.get(f"{BASE_URL}/health", timeout=10)
    if r.status_code == 200:
        data = r.json()
        db_status = data.get('services', {}).get('database', 'unknown')
        cloudinary_status = data.get('services', {}).get('cloudinary', 'unknown')
        
        if db_status == 'connected' and cloudinary_status == 'configured':
            test.pass_test("Backend healthy", f"DB: {db_status}, Cloudinary: {cloudinary_status}")
        else:
            test.fail_test("Services degraded", f"DB: {db_status}, Cloudinary: {cloudinary_status}")
    else:
        test.fail_test(f"HTTP {r.status_code}")
except Exception as e:
    test.fail_test(f"Error: {e}")
results.append(test)
print_test(test)

# TEST 2: Login
print_header("TEST 2: AUTHENTICATION")
test = TestResult("Login with credentials")
try:
    r = requests.post(f"{BASE_URL}/api/login", json={"email": EMAIL, "password": PASSWORD}, timeout=10)
    if r.status_code == 200:
        data = r.json()
        if data.get('token'):
            token = data['token']
            user_name = data.get('user', {}).get('name', 'Unknown')
            test.pass_test(f"Logged in as {user_name}", f"Token: {token[:30]}...")
        else:
            test.fail_test("No token in response")
    else:
        test.fail_test(f"HTTP {r.status_code}", r.text[:200])
except Exception as e:
    test.fail_test(f"Error: {e}")
results.append(test)
print_test(test)

if not token:
    print("\n[CRITICAL] Cannot continue without authentication token")
    exit(1)

headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# TEST 3: Create Quote
print_header("TEST 3: CREATE QUOTE")
test = TestResult("Create new quote")
try:
    quote_data = {
        "client": "Test Client AUTO",
        "project": "Comprehensive Test Project",
        "value": 7500.00,
        "status": "Pendente",
        "phone": "(11) 98765-4321",
        "project_type": "Cozinha",
        "service_type": "Moveis planejados",
        "notes": "Created by comprehensive auto-test"
    }
    r = requests.post(f"{BASE_URL}/api/quotes", json=quote_data, headers=headers, timeout=10)
    if r.status_code in [200, 201]:
        data = r.json()
        test_quote_id = data.get('id')
        test.pass_test(f"Quote created with ID {test_quote_id}")
    else:
        test.fail_test(f"HTTP {r.status_code}", r.text[:200])
except Exception as e:
    test.fail_test(f"Error: {e}")
results.append(test)
print_test(test)

# TEST 4: List Quotes
print_header("TEST 4: LIST QUOTES")
test = TestResult("Get all quotes")
try:
    r = requests.get(f"{BASE_URL}/api/quotes", headers=headers, timeout=10)
    if r.status_code == 200:
        quotes = r.json()
        test.pass_test(f"Retrieved {len(quotes)} quotes")
    else:
        test.fail_test(f"HTTP {r.status_code}")
except Exception as e:
    test.fail_test(f"Error: {e}")
results.append(test)
print_test(test)

# TEST 5: Get Single Quote
if test_quote_id:
    print_header("TEST 5: GET QUOTE BY ID")
    test = TestResult(f"Get quote #{test_quote_id}")
    try:
        r = requests.get(f"{BASE_URL}/api/quotes/{test_quote_id}", headers=headers, timeout=10)
        if r.status_code == 200:
            quote = r.json()
            test.pass_test(f"Quote: {quote.get('client', 'Unknown')}")
        else:
            test.fail_test(f"HTTP {r.status_code}")
    except Exception as e:
        test.fail_test(f"Error: {e}")
    results.append(test)
    print_test(test)

# TEST 6: Update Quote Status
if test_quote_id:
    print_header("TEST 6: UPDATE QUOTE STATUS")
    test = TestResult("Change status from Pendente to Aprovado")
    try:
        update_data = {"status": "Aprovado"}
        r = requests.put(f"{BASE_URL}/api/quotes/{test_quote_id}", json=update_data, headers=headers, timeout=10)
        if r.status_code == 200:
            # Verify the change
            r_verify = requests.get(f"{BASE_URL}/api/quotes/{test_quote_id}", headers=headers, timeout=10)
            if r_verify.status_code == 200:
                updated_quote = r_verify.json()
                new_status = updated_quote.get('status', '')
                if new_status == "Aprovado":
                    test.pass_test("Status updated successfully", f"New status: {new_status}")
                else:
                    test.fail_test(f"Status not changed", f"Expected: Aprovado, Got: {new_status}")
            else:
                test.fail_test("Could not verify update")
        else:
            test.fail_test(f"HTTP {r.status_code}", r.text[:200])
    except Exception as e:
        test.fail_test(f"Error: {e}")
    results.append(test)
    print_test(test)

# TEST 7: Upload File
if test_quote_id:
    print_header("TEST 7: FILE UPLOAD")
    test = TestResult("Upload file to quote")
    try:
        import os
        filename = 'comprehensive-test-file.txt'
        with open(filename, 'w') as f:
            f.write('=== COMPREHENSIVE TEST FILE ===\n')
            f.write(f'Quote ID: {test_quote_id}\n')
            f.write(f'Timestamp: {datetime.now()}\n')
        
        with open(filename, 'rb') as f:
            files = {'files': (filename, f, 'text/plain')}
            upload_headers = {'Authorization': f'Bearer {token}'}
            r = requests.post(
                f"{BASE_URL}/api/quotes/{test_quote_id}/files",
                files=files,
                headers=upload_headers,
                timeout=30
            )
        
        if r.status_code in [200, 201]:
            test.pass_test("File uploaded successfully")
        else:
            test.fail_test(f"HTTP {r.status_code}", r.text[:200])
        
        if os.path.exists(filename):
            os.remove(filename)
    except Exception as e:
        test.fail_test(f"Error: {e}")
    results.append(test)
    print_test(test)

# TEST 8: List Files
if test_quote_id:
    print_header("TEST 8: LIST FILES")
    test = TestResult("Get files for quote")
    try:
        r = requests.get(f"{BASE_URL}/api/quotes/{test_quote_id}/files", headers=headers, timeout=10)
        if r.status_code == 200:
            files = r.json()
            test.pass_test(f"Found {len(files)} file(s)")
        else:
            test.fail_test(f"HTTP {r.status_code}")
    except Exception as e:
        test.fail_test(f"Error: {e}")
    results.append(test)
    print_test(test)

# TEST 9: Update Quote (full update)
if test_quote_id:
    print_header("TEST 9: UPDATE QUOTE DETAILS")
    test = TestResult("Update quote information")
    try:
        update_data = {
            "client": "Test Client AUTO - UPDATED",
            "value": 9999.99,
            "notes": "Updated by comprehensive test"
        }
        r = requests.put(f"{BASE_URL}/api/quotes/{test_quote_id}", json=update_data, headers=headers, timeout=10)
        if r.status_code == 200:
            test.pass_test("Quote updated")
        else:
            test.fail_test(f"HTTP {r.status_code}", r.text[:200])
    except Exception as e:
        test.fail_test(f"Error: {e}")
    results.append(test)
    print_test(test)

# TEST 10: Delete Quote
if test_quote_id:
    print_header("TEST 10: DELETE QUOTE")
    test = TestResult("Delete test quote (cleanup)")
    try:
        r = requests.delete(f"{BASE_URL}/api/quotes/{test_quote_id}", headers=headers, timeout=10)
        if r.status_code in [200, 204]:
            # Verify deletion
            r_verify = requests.get(f"{BASE_URL}/api/quotes/{test_quote_id}", headers=headers, timeout=10)
            if r_verify.status_code == 404:
                test.pass_test("Quote deleted successfully")
            else:
                test.fail_test("Quote still exists after deletion")
        else:
            test.fail_test(f"HTTP {r.status_code}", r.text[:200])
    except Exception as e:
        test.fail_test(f"Error: {e}")
    results.append(test)
    print_test(test)

# SUMMARY
print_header("TEST SUMMARY")
passed = sum(1 for t in results if t.passed)
total = len(results)
percentage = (passed / total * 100) if total > 0 else 0

print(f"\nTotal Tests: {total}")
print(f"Passed: {passed} ({percentage:.1f}%)")
print(f"Failed: {total - passed}")

print("\nDetailed Results:")
for i, test in enumerate(results, 1):
    status = "PASS" if test.passed else "FAIL"
    print(f"{i}. {test.name}: [{status}]")

if percentage == 100:
    print("\n*** ALL TESTS PASSED - SYSTEM FULLY FUNCTIONAL ***")
    exit(0)
else:
    print("\n*** SOME TESTS FAILED - CHECK DETAILS ABOVE ***")
    exit(1)
