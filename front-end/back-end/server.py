import os
import re
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def parse_email_part(parts):
    """Recursively extract plain text and HTML body from payload parts."""
    plain = ""
    html = ""
    for part in parts:
        mimeType = part.get('mimeType', '')
        import base64
        if mimeType == 'text/plain':
            data = part.get('body', {}).get('data', '')
            if data:
                decoded = base64.urlsafe_b64decode(data + '=' * (-len(data) % 4)).decode('utf-8')
                plain += decoded
        elif mimeType == 'text/html':
            data = part.get('body', {}).get('data', '')
            if data:
                decoded = base64.urlsafe_b64decode(data + '=' * (-len(data) % 4)).decode('utf-8')
                html += decoded
        elif 'parts' in part:
            p, h = parse_email_part(part['parts'])
            plain += p
            html += h
    return plain, html


def strip_html_tags(html_str):
    """Remove HTML tags for a plain-text fallback."""
    clean = re.sub(r'<style[^>]*>.*?</style>', '', html_str, flags=re.DOTALL | re.IGNORECASE)
    clean = re.sub(r'<script[^>]*>.*?</script>', '', clean, flags=re.DOTALL | re.IGNORECASE)
    clean = re.sub(r'<br\s*/?>', '\n', clean, flags=re.IGNORECASE)
    clean = re.sub(r'</p>', '\n\n', clean, flags=re.IGNORECASE)
    clean = re.sub(r'</div>', '\n', clean, flags=re.IGNORECASE)
    clean = re.sub(r'<[^>]+>', '', clean)
    clean = re.sub(r'\n{3,}', '\n\n', clean)
    return clean.strip()

def get_header(headers, name):
    for h in headers:
        if h['name'].lower() == name.lower():
            return h['value']
    return ""

def parse_address(addr):
    """Parse 'Name <email@domain.com>' into dict."""
    match = re.match(r'(?:"?([^"]*)"?\s)?<?([^>]*)>?', addr)
    if match:
        name = match.group(1) or match.group(2)
        email = match.group(2)
        init = name[0].upper() if name else 'M'
        return {'name': name.strip(), 'email': email.strip(), 'init': init, 'color': '#6366f1'}
    return {'name': addr, 'email': addr, 'init': 'M', 'color': '#6366f1'}

@app.route('/api/emails', methods=['GET'])
def get_emails():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Missing Authorization header'}), 401

    token = auth_header.replace('Bearer ', '')
    headers = {'Authorization': f'Bearer {token}'}

    page_token = request.args.get('pageToken')

    # 1. Fetch list of recent messages from Inbox
    list_url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages'
    params = {
        'labelIds': 'INBOX', 
        'maxResults': 15,
        'q': 'newer_than:7d'
    }
    if page_token:
        params['pageToken'] = page_token
        
    list_res = requests.get(list_url, headers=headers, params=params)
    
    if list_res.status_code != 200:
        print("GOOGLE API ERROR:", list_res.text)
        return jsonify({'error': 'Failed to fetch emails', 'details': list_res.json()}), list_res.status_code

    list_data = list_res.json()
    messages = list_data.get('messages', [])
    next_page_token = list_data.get('nextPageToken')
    parsed_emails = []

    # 2. Fetch details for each message concurrently
    import concurrent.futures

    def fetch_detail(msg):
        msg_id = msg['id']
        detail_url = f'https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg_id}?format=full'
        detail_res = requests.get(detail_url, headers=headers)
        if detail_res.status_code == 200:
            return msg_id, detail_res.json()
        return msg_id, None

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(fetch_detail, messages)

    for msg_id, data in results:
        if not data:
            continue
            
        payload = data.get('payload', {})
        msg_headers = payload.get('headers', [])
        
        # Extract metadata
        subject = get_header(msg_headers, 'Subject') or '(No Subject)'
        from_raw = get_header(msg_headers, 'From')
        to_raw = get_header(msg_headers, 'To')
        
        # Simple date formatting
        date_raw = get_header(msg_headers, 'Date')
        
        # Parse body — separate plain text and HTML
        plain_body = ""
        html_body = ""
        if 'parts' in payload:
            plain_body, html_body = parse_email_part(payload['parts'])
        else:
            # Sometimes there are no parts, just a body data
            bdata = payload.get('body', {}).get('data', '')
            mime = payload.get('mimeType', '')
            if bdata:
                import base64
                decoded = base64.urlsafe_b64decode(bdata + '=' * (-len(bdata) % 4)).decode('utf-8')
                if mime == 'text/html':
                    html_body = decoded
                else:
                    plain_body = decoded

        # Build final body: prefer plain text, fall back to stripped HTML
        body = plain_body or strip_html_tags(html_body) or data.get('snippet', '')
        
        # Check unread/starred
        labels = data.get('labelIds', [])
        is_unread = 'UNREAD' in labels
        is_starred = 'STARRED' in labels

        parsed_emails.append({
            'id': msg_id,
            'from': parse_address(from_raw),
            'to': to_raw,
            'subject': subject,
            'snippet': data.get('snippet', ''),
            'date': 'Today',  # Simplified for UI
            'unread': is_unread,
            'starred': is_starred,
            'body': body,
            'bodyHtml': html_body
        })

    return jsonify({
        'primary': parsed_emails, 
        'social': [], 
        'promo': [],
        'nextPageToken': next_page_token
    })

if __name__ == '__main__':
    print("Starting Nexus Mail Backend on http://localhost:4000")
    app.run(port=4000, debug=True)
