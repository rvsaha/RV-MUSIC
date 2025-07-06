# RV MUSIC – Automated Security & Penetration Test Checklist

This checklist automates and documents the main steps for vulnerability assessment (VA) and penetration testing of both frontend and backend.

---

## 1. Automated Dependency Scans

### Backend
- [ ] Run `npm audit --production` in `backend/`
- [ ] Run `npx nodejsscan -d backend/` (if installed)

### Frontend
- [ ] Run `npm audit --production` in `frontend/`
- [ ] Run `npx retire` in `frontend/` (if installed)

---

## 2. Automated Security Headers & Vulnerability Scans
- [ ] Use [securityheaders.com](https://securityheaders.com/) to scan deployed frontend and backend URLs
- [ ] Use [OWASP ZAP](https://www.zaproxy.org/) to scan both deployed URLs
- [ ] Use [Nikto](https://cirt.net/Nikto2) for backend API endpoint

---

## 3. Manual Auth & API Checks (Semi-Automated)
- [ ] Use Postman/Insomnia to test all endpoints for auth, input validation, and error handling
- [ ] Use [jwt.io](https://jwt.io/) to inspect and tamper with JWTs
- [ ] Use browser dev tools to check for token leakage and CORS

---

## 4. Rate Limiting & DoS
- [ ] Run `npx autocannon -c 50 -d 30 https://your-backend-url` (replace with actual URL)
- [ ] Run `npx autocannon -c 50 -d 30 https://your-frontend-url` (replace with actual URL)

---

## 5. Reporting
- [ ] Document all findings in this file or a separate report
- [ ] Fix and retest as needed

---

## 6. Optional: Professional Pentest
- [ ] Consider third-party audit or bug bounty

---

**For each step, mark as complete and add notes/findings.**
