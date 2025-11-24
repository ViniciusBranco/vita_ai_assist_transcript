"""
Test script to verify .ogg file support in the upload endpoint.
This script simulates uploading a .ogg file (WhatsApp audio format).
"""
import requests

# API endpoint
API_URL = "http://127.0.0.1:8000/api/upload"

def test_ogg_upload():
    """
    Test uploading a .ogg file to the API.
    """
    # WhatsApp audio file from project root
    ogg_file_path = "../audio_teste_vinicius.ogg"
    
    try:
        with open(ogg_file_path, "rb") as f:
            files = {"file": ("audio_teste_vinicius.ogg", f, "audio/ogg")}
            response = requests.post(API_URL, files=files)
            
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ .ogg file upload successful!")
            result = response.json()
            print(f"\nTranscription: {result.get('transcription', 'N/A')}")
            print(f"\nLLM Analysis: {result.get('llm_analysis', 'N/A')}")
        else:
            print(f"❌ Upload failed: {response.json()}")
            
    except FileNotFoundError:
        print(f"❌ File not found: {ogg_file_path}")
        print("Please provide a valid .ogg file path from WhatsApp")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_invalid_format():
    """
    Test that invalid file formats are rejected.
    """
    print("\nTesting invalid file format rejection...")
    
    # Create a dummy file with invalid extension
    dummy_file = "test.txt"
    try:
        with open(dummy_file, "w") as f:
            f.write("This is not an audio file")
        
        with open(dummy_file, "rb") as f:
            files = {"file": ("test.txt", f, "text/plain")}
            response = requests.post(API_URL, files=files)
        
        if response.status_code == 400:
            print("✅ Invalid format correctly rejected")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Expected 400 status, got {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        import os
        if os.path.exists(dummy_file):
            os.remove(dummy_file)

if __name__ == "__main__":
    print("=== Testing .ogg File Upload Support ===\n")
    
    print("1. Testing .ogg file upload:")
    test_ogg_upload()
    
    print("\n2. Testing invalid format rejection:")
    test_invalid_format()
    
    print("\n=== Test Complete ===")
