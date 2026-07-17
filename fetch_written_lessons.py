import urllib.request
import json

url = "https://kqrtzlahklncmoozdqnv.supabase.co/rest/v1/written_lessons?select=*"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxcnR6bGFoa2xuY21vb3pkcW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTIzNDAsImV4cCI6MjA5Nzk4ODM0MH0.5vfQbF8U0IRRYFY7y0WZQ18KKVlg936vPzWaodu4vAQ",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxcnR6bGFoa2xuY21vb3pkcW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTIzNDAsImV4cCI6MjA5Nzk4ODM0MH0.5vfQbF8U0IRRYFY7y0WZQ18KKVlg936vPzWaodu4vAQ"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        lessons = json.loads(html)
        print("Written lessons count:", len(lessons))
        for l in lessons:
            print(f"ID: {l.get('id')}, Title: {l.get('title')}, Published: {l.get('is_published')}, Category: {l.get('category')}, Level: {l.get('level')}, Plan: {l.get('plan_allowed')}")
except Exception as e:
    print("Error querying written_lessons:", e)
