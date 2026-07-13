import requests

def test_document_analysis():
    print("Testing document upload and analysis...")
    files = {'file': ('dummy.pdf', b'%PDF-1.4\nThis is a fake legal document for testing.', 'application/pdf')}
    try:
        res = requests.post(
            'http://localhost:8000/api/v1/documents/upload',
            files=files
        )
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            print("Response:", res.json())
        else:
            print("Error:", res.text)
    except Exception as e:
        print("Exception:", e)

test_document_analysis()
