import requests
import sys
import json
from datetime import datetime, timedelta

class HealthDiaryAPITester:
    def __init__(self, base_url="https://carecompanion-18.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Response: {error_data}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {}
            else:
                return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if response and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # First register a user
        test_user_data = {
            "name": f"Login Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"login_test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "LoginTest123!"
        }
        
        # Register user
        reg_response = self.run_test(
            "User Registration for Login Test",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if not reg_response:
            return False
        
        # Now test login
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return response and 'token' in response

    def test_get_user_profile(self):
        """Test getting user profile"""
        response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        
        return response and 'id' in response

    def test_create_health_record(self):
        """Test creating health record"""
        health_data = {
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "blood_sugar": 95.5,
            "weight": 70.5,
            "temperature": 37.0,
            "heart_rate": 72,
            "notes": "Feeling good today",
            "recorded_at": datetime.now().isoformat()
        }
        
        response = self.run_test(
            "Create Health Record",
            "POST",
            "health-records",
            200,
            data=health_data
        )
        
        if response and 'id' in response:
            self.health_record_id = response['id']
            return True
        return False

    def test_get_health_records(self):
        """Test getting health records"""
        response = self.run_test(
            "Get Health Records",
            "GET",
            "health-records",
            200
        )
        
        return response is not None and isinstance(response, list)

    def test_get_single_health_record(self):
        """Test getting single health record"""
        if not hasattr(self, 'health_record_id'):
            self.log_test("Get Single Health Record", False, "No health record ID available")
            return False
            
        response = self.run_test(
            "Get Single Health Record",
            "GET",
            f"health-records/{self.health_record_id}",
            200
        )
        
        return response and 'id' in response

    def test_delete_health_record(self):
        """Test deleting health record"""
        if not hasattr(self, 'health_record_id'):
            self.log_test("Delete Health Record", False, "No health record ID available")
            return False
            
        response = self.run_test(
            "Delete Health Record",
            "DELETE",
            f"health-records/{self.health_record_id}",
            200
        )
        
        return response and 'message' in response

    def test_create_medication(self):
        """Test creating medication"""
        med_data = {
            "name": "Test Medicine",
            "dosage": "100mg",
            "frequency": "daily",
            "time_of_day": ["Morning", "Evening"],
            "start_date": datetime.now().isoformat(),
            "notes": "Test medication"
        }
        
        response = self.run_test(
            "Create Medication",
            "POST",
            "medications",
            200,
            data=med_data
        )
        
        if response and 'id' in response:
            self.medication_id = response['id']
            return True
        return False

    def test_get_medications(self):
        """Test getting medications"""
        response = self.run_test(
            "Get Medications",
            "GET",
            "medications",
            200
        )
        
        return response is not None and isinstance(response, list)

    def test_delete_medication(self):
        """Test deleting medication"""
        if not hasattr(self, 'medication_id'):
            self.log_test("Delete Medication", False, "No medication ID available")
            return False
            
        response = self.run_test(
            "Delete Medication",
            "DELETE",
            f"medications/{self.medication_id}",
            200
        )
        
        return response and 'message' in response

    def test_analytics_stats(self):
        """Test analytics stats endpoint"""
        response = self.run_test(
            "Analytics Stats",
            "GET",
            "analytics/stats",
            200
        )
        
        return response and 'total_records' in response

    def test_analytics_trends(self):
        """Test analytics trends endpoint"""
        response = self.run_test(
            "Analytics Trends",
            "GET",
            "analytics/trends?days=7",
            200
        )
        
        return response and 'records' in response

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Digital Health Diary API Tests")
        print(f"   Base URL: {self.base_url}")
        print("=" * 60)

        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False

        self.test_user_login()
        self.test_get_user_profile()

        # Health records tests
        self.test_create_health_record()
        self.test_get_health_records()
        self.test_get_single_health_record()
        
        # Medications tests
        self.test_create_medication()
        self.test_get_medications()
        
        # Analytics tests
        self.test_analytics_stats()
        self.test_analytics_trends()
        
        # Cleanup tests
        self.test_delete_health_record()
        self.test_delete_medication()

        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            return False

def main():
    tester = HealthDiaryAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())