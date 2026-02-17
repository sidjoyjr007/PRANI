import requests
import uuid
import time

BASE_URL = "http://localhost:8000/api"

def run_test():
    # 1. Signup/Login to get token
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "password123"
    
    print(f"Creating user {email}...")
    signup_resp = requests.post(f"{BASE_URL}/auth/signup", json={
        "name": "Test User",
        "email": email,
        "password": password
    })
    
    if signup_resp.status_code == 200:
        requests.post(f"{BASE_URL}/auth/verify-email-dev", params={"email": email})
        
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    
    token = login_resp.cookies.get("access_token") 
    if not token:
        token = login_resp.json().get("access_token")
        
    headers = {"Cookie": f"access_token={token}"} 

    # 2. Create Multiple Tools for Pagination
    print("\nCreating 5 tools...")
    for i in range(5):
        tool_data = {
            "name": f"Tool {i} search_me",
            "description": f"Description {i}",
            "code": "print('hello')",
            "is_public": False
        }
        requests.post(f"{BASE_URL}/tools/", json=tool_data, cookies={"access_token": token})

    # 3. Test Pagination
    print("\nTesting Pagination (Page 1, Size 2)...")
    list_resp = requests.get(
        f"{BASE_URL}/tools/",
        params={"page": 1, "size": 2},
        cookies={"access_token": token}
    )
    print(f"Status: {list_resp.status_code}")
    data = list_resp.json()
    print(f"Total: {data['total']}, Page Size: {len(data['items'])}")
    if data['total'] < 5 or len(data['items']) != 2:
        print("FAILURE: Pagination logic incorrect")
    else:
        print("SUCCESS: Pagination working")

    # 4. Test Search
    print("\nTesting Search (query='search_me')...")
    search_resp = requests.get(
        f"{BASE_URL}/tools/",
        params={"search": "search_me"},
        cookies={"access_token": token}
    )
    search_data = search_resp.json()
    print(f"Found: {len(search_data['items'])} items")
    if len(search_data['items']) == 5:
        print("SUCCESS: Search found all items")
    else:
        print("FAILURE: Search missing items")
        
    print("\nTesting Search (query='NON_EXISTENT')...")
    empty_resp = requests.get(
        f"{BASE_URL}/tools/",
        params={"search": "NON_EXISTENT"},
        cookies={"access_token": token}
    )
    empty_data = empty_resp.json()
    if len(empty_data['items']) == 0:
        print("SUCCESS: Search correctly returned empty list")
    else:
        print("FAILURE: Search found phantom items")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"Test failed with exception: {e}")
