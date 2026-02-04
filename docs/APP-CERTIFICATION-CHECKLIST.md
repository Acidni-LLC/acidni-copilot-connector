# Terprint AI - App Certification Checklist

**Document ID**: COPILOT-CERT-001  
**Version**: 1.0  
**Date**: February 4, 2026  
**Status**: Pre-Submission

---

## 1. Pre-Submission Requirements

### 1.1 Partner Center Account

| Requirement | Status | Action |
|-------------|--------|--------|
| Microsoft Partner Center account | 🟡 Pending | Sign up at https://partner.microsoft.com |
| Publisher verification (MPN ID) | 🟡 Pending | Complete Microsoft Partner Network enrollment |
| Payment account setup | 🟡 Pending | Required for paid apps |
| Tax profile configured | 🟡 Pending | Required for marketplace distribution |

### 1.2 App Registration

| Requirement | Status | Action |
|-------------|--------|--------|
| Azure AD App Registration | ✅ Done | Created via teamsapp.yml |
| Publisher domain verified | 🟡 Pending | Verify acidni.net in Azure AD |
| API permissions configured | ✅ Done | User.Read, profile |

---

## 2. Manifest Validation

### 2.1 Required Fields

| Field | Value | Status |
|-------|-------|--------|
| `manifestVersion` | devPreview | ✅ Valid |
| `version` | 3.20.0 | ✅ Valid (semver) |
| `id` | GUID | ✅ Valid |
| `developer.name` | Acidni LLC | ✅ Valid |
| `developer.websiteUrl` | https://www.acidni.net | ✅ Valid HTTPS |
| `developer.privacyUrl` | https://www.acidni.net/privacy | 🟡 Verify page exists |
| `developer.termsOfUseUrl` | https://www.acidni.net/terms | 🟡 Verify page exists |
| `name.short` | Terprint AI | ✅ Valid (≤30 chars) |
| `name.full` | Terprint AI - Cannabis Intelligence... | ✅ Valid (≤100 chars) |
| `description.short` | (80 chars) | ✅ Valid |
| `description.full` | (4000 chars) | ✅ Valid |

### 2.2 Icon Requirements

| Icon | Requirement | Status |
|------|-------------|--------|
| `color.png` | 192x192 PNG, transparent | 🟡 Verify dimensions |
| `outline.png` | 32x32 PNG, white on transparent | 🟡 Verify dimensions |

**Validation Command:**
```powershell
# Check icon dimensions
Add-Type -AssemblyName System.Drawing
$color = [System.Drawing.Image]::FromFile("appPackage/color.png")
$outline = [System.Drawing.Image]::FromFile("appPackage/outline.png")
"Color: $($color.Width)x$($color.Height)"
"Outline: $($outline.Width)x$($outline.Height)"
```

---

## 3. Functional Requirements

### 3.1 Core Functionality

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Install app in Teams | App installs without errors | 🔲 Test |
| Open Copilot agent | Agent responds to queries | 🔲 Test |
| Search strains | Returns relevant results | 🔲 Test |
| Get recommendations | Returns personalized suggestions | 🔲 Test |
| Search deals | Returns current pricing | 🔲 Test |
| Find dispensaries | Returns nearby locations | 🔲 Test |
| Messaging extension search | Returns strain cards | 🔲 Test |
| Personal tab loads | Dashboard renders correctly | 🔲 Test |
| Bot commands work | help/deals/favorites respond | 🔲 Test |

### 3.2 Error Handling

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| API timeout | User-friendly error message | 🔲 Test |
| Invalid query | Helpful guidance returned | 🔲 Test |
| Network offline | Graceful degradation | 🔲 Test |
| Auth failure | Clear re-auth prompt | 🔲 Test |

### 3.3 Performance

| Metric | Requirement | Status |
|--------|-------------|--------|
| App load time | < 3 seconds | 🔲 Measure |
| API response time | < 2 seconds | 🔲 Measure |
| Card render time | < 1 second | 🔲 Measure |

---

## 4. Security Requirements

### 4.1 Authentication

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| OAuth 2.0 | Authorization Code Flow | ✅ Configured |
| Token validation | APIM JWT policy | ✅ Configured |
| SSO support | Teams/Copilot SSO | ✅ Configured |

### 4.2 Data Protection

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| HTTPS only | All endpoints use TLS 1.2+ | ✅ Configured |
| No PII storage | Preferences only, no health data | ✅ By design |
| Secure secrets | Azure Key Vault | 🟡 Verify prod |

### 4.3 Permissions

| Permission | Justification | Status |
|------------|---------------|--------|
| `identity` | SSO authentication | ✅ Required |
| `messageTeamMembers` | Bot notifications | ✅ Required |

---

## 5. Content Compliance

### 5.1 Content Guidelines

| Requirement | Status | Notes |
|-------------|--------|-------|
| No hate speech | ✅ N/A | Educational content only |
| No violence | ✅ N/A | Medical/wellness focus |
| No adult content | ✅ N/A | Professional content |
| Age-appropriate | ✅ Yes | 21+ / MMJ patients |
| Accurate claims | ✅ Yes | Lab-verified data |

### 5.2 Legal Compliance

| Requirement | Status | Notes |
|-------------|--------|-------|
| Florida MMUR compliant | ✅ Yes | Licensed dispensary data only |
| No medical claims | ✅ Yes | Educational, not prescriptive |
| Copyright compliance | ✅ Yes | Original content |

---

## 6. Accessibility Requirements

### 6.1 WCAG 2.1 AA Compliance

| Requirement | Status | Notes |
|-------------|--------|-------|
| Color contrast ratio ≥ 4.5:1 | 🔲 Verify | Check accent color |
| Text resizing supported | ✅ Yes | Adaptive Cards |
| Keyboard navigation | ✅ Yes | Standard Teams UX |
| Screen reader compatible | ✅ Yes | Semantic markup |

### 6.2 Inclusive Design

| Requirement | Status | Notes |
|-------------|--------|-------|
| Alt text for images | ✅ Yes | In Adaptive Cards |
| Clear error messages | ✅ Yes | User-friendly text |
| Consistent navigation | ✅ Yes | Standard patterns |

---

## 7. Submission Process

### Step 1: Validate App Package

```powershell
# Run Teams Toolkit validation
npx teamsapp validate --manifest-path ./appPackage/manifest.json

# Run package validation
npx teamsapp package --env prod
npx teamsapp validate --app-package-file-path ./appPackage/build/appPackage.prod.zip
```

### Step 2: Test in Production Environment

```powershell
# Provision production resources
npx teamsapp provision --env prod

# Deploy to production
npx teamsapp deploy --env prod

# Install and test
npx teamsapp preview --env prod
```

### Step 3: Create Partner Center Listing

1. Go to https://partner.microsoft.com/dashboard
2. Navigate to **Marketplace offers** > **Teams apps**
3. Click **+ New offer** > **Teams app**
4. Fill in marketplace metadata from `MARKETPLACE-LISTING.md`
5. Upload app package (`appPackage.prod.zip`)
6. Upload screenshots and icons
7. Configure pricing and availability
8. Submit for certification

### Step 4: Respond to Certification Feedback

- Monitor Partner Center for certification status
- Address any feedback within 7 days
- Re-submit after fixes
- Expect 3-5 business days for review

### Step 5: Post-Publication

1. Monitor app performance in Partner Center analytics
2. Respond to user reviews
3. Plan update releases
4. Maintain support channels

---

## 8. Certification Timeline

| Phase | Duration | Notes |
|-------|----------|-------|
| Pre-submission prep | 1-2 weeks | Complete this checklist |
| Initial submission | 1 day | Upload to Partner Center |
| Certification review | 3-5 business days | Microsoft review |
| Feedback iteration | 1-2 weeks | Address any issues |
| Publication | 1-2 days | After approval |
| **Total** | **3-4 weeks** | From submission to live |

---

## 9. Common Rejection Reasons

| Reason | Prevention |
|--------|------------|
| Privacy policy not accessible | Test URL before submission |
| Icons wrong dimensions | Use exact 192x192 and 32x32 |
| App crashes on load | Thorough testing in prod |
| Missing functionality | Test all conversation starters |
| Security vulnerabilities | Follow OAuth best practices |
| Inappropriate content | Review all response text |
| Performance issues | Optimize API response times |

---

## 10. Support Resources

| Resource | URL |
|----------|-----|
| Teams App Certification Policies | https://aka.ms/teams-app-certification |
| Partner Center Documentation | https://aka.ms/partner-center-docs |
| Teams Toolkit Documentation | https://aka.ms/teams-toolkit |
| Microsoft Graph Permissions | https://aka.ms/graph-permissions |
| Adaptive Cards Designer | https://adaptivecards.io/designer |

---

## 11. Contacts

| Role | Contact |
|------|---------|
| Microsoft Partner Support | https://partner.microsoft.com/support |
| Acidni Technical Lead | jgill@acidni.net |
| Acidni Support | support@acidni.net |

---

## 12. Approval Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Developer | | | |
| QA Lead | | | |
| Product Owner | Jamieson Gill | | |
| Security Review | | | |

---

*Document maintained by Acidni AI SDO*
