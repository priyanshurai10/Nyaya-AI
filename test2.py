import urllib.request, urllib.error
req = urllib.request.Request('https://nyaya-ai-backend-tyy5.onrender.com/api/v1/user/profile', method='GET', headers={'Origin': 'https://nyaya-ai-website.vercel.app'})
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.headers)
