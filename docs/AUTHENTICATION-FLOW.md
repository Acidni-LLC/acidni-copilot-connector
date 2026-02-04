# Terprint Copilot Connector - Authentication Flow

## Overview

This document describes the OAuth 2.0 authentication flow for the Terprint Copilot Connector, enabling user-specific experiences like favorites, personalized recommendations, and purchase history.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│  Microsoft 365  │────▶│  Terprint AI    │────▶│  Azure APIM     │────▶│  Terprint       │
│  Copilot        │     │  Declarative    │     │  (JWT Validate) │     │  Backend APIs   │
│                 │     │  Agent          │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │                       │
        │ 1. User Request       │                       │                       │
        │───────────────────────▶                       │                       │
        │                       │ 2. Get Token (SSO)    │                       │
        │                       │───────────────────────▶                       │
        │                       │                       │ 3. Validate JWT       │
        │                       │                       │ Extract User Context  │
        │                       │                       │───────────────────────▶
        │                       │                       │                       │
        │                       │                       │ 4. X-User-Id Header   │
        │                       │                       │    X-User-Email       │
        │                       │                       │    X-User-Name        │
        │                       │                       │───────────────────────▶
        │                       │                       │                       │
        │                       │                       │ 5. Personalized       │
        │                       │                       │    Response           │
        │◀──────────────────────│◀──────────────────────│◀──────────────────────│
```

## Components

### 1. Microsoft Entra ID (Azure AD) App Registration

**Application ID**: `${{AAD_APP_CLIENT_ID}}`  
**Identifier URI**: `api://${{AAD_APP_CLIENT_ID}}`

#### Exposed API Scopes
| Scope | Description |
|-------|-------------|
| `Terprint.Access` | Access Terprint API on behalf of the user |

#### Pre-Authorized Applications
| App | App ID | Purpose |
|-----|--------|---------|
| Microsoft Teams | `ab3be6b7-f5df-413d-ac2d-abf1e3fd9c0b` | Teams client SSO |
| Microsoft Copilot | `27922004-5251-4030-b22d-91ecd9a37ea4` | Copilot SSO |

#### Required Permissions
| API | Permission | Type | Description |
|-----|------------|------|-------------|
| Microsoft Graph | `User.Read` | Delegated | Sign in and read user profile |
| Microsoft Graph | `email` | Delegated | View user's email address |
| Microsoft Graph | `profile` | Delegated | View user's basic profile |

### 2. Teams Toolkit OAuth Registration

The `teamsapp.yml` registers an OAuth connection that:
- Links the AAD app to the Teams app
- Configures authorization code flow
- Enables token exchange for SSO

```yaml
- uses: oauth/register
  with:
    name: TerprintOAuth
    flow: authorizationCode
    clientId: ${{AAD_APP_CLIENT_ID}}
    tokenExchangeUrl: api://${{AAD_APP_CLIENT_ID}}
```

### 3. AI Plugin Configuration

The `ai-plugin.json` references the OAuth connection:

```json
{
  "runtimes": [{
    "auth": {
      "type": "OAuthPluginVault",
      "reference_id": "${{OAUTH_CONNECTION_ID}}"
    }
  }]
}
```

### 4. Azure APIM JWT Validation

The APIM policy (`infra/apim-jwt-policy.xml`) performs:

1. **JWT Validation**
   - Validates token signature via OpenID Connect discovery
   - Checks audience matches `api://${{AAD_APP_CLIENT_ID}}`
   - Verifies issuer is Azure AD tenant
   - Confirms `Terprint.Access` scope is present

2. **User Context Extraction**
   - Extracts `oid` (object ID) as user identifier
   - Extracts `email` or `upn` for user email
   - Extracts `name` for display purposes

3. **Header Injection**
   - `X-User-Id`: Unique user identifier
   - `X-User-Email`: User's email address
   - `X-User-Name`: User's display name
   - `X-Correlation-Id`: Request tracing ID

4. **Rate Limiting**
   - 100 requests per minute per user

## Token Claims

### Access Token Structure
```json
{
  "aud": "api://{{client-id}}",
  "iss": "https://login.microsoftonline.com/{{tenant-id}}/v2.0",
  "oid": "user-object-id",
  "sub": "user-subject-id",
  "email": "user@example.com",
  "name": "User Name",
  "scp": "Terprint.Access",
  "idtyp": "user",
  "exp": 1234567890,
  "iat": 1234567890
}
```

## User Features Enabled

| Feature | API Endpoint | Required Header |
|---------|--------------|-----------------|
| View Favorites | `GET /user/favorites` | `X-User-Id` |
| Save Favorite | `POST /user/favorites` | `X-User-Id` |
| Recommendation History | `GET /user/recommendations` | `X-User-Id` |
| Purchase History | `GET /user/purchases` | `X-User-Id` |
| Price Alerts | `GET /user/alerts` | `X-User-Id` |

## Deployment

### Prerequisites
1. Azure subscription with APIM instance
2. Microsoft 365 tenant with Copilot licenses
3. Admin consent for required Graph permissions

### Steps

1. **Provision Teams App**
   ```bash
   npx teamsapp provision --env dev
   ```
   This creates/updates:
   - AAD app registration
   - OAuth connection registration
   - Teams app registration

2. **Apply APIM Policy**
   - Navigate to Azure Portal → API Management → `apim-terprint-dev`
   - Select the Terprint API
   - Go to Design → All Operations → Inbound processing
   - Apply the policy from `infra/apim-jwt-policy.xml`
   - Replace `{{AAD_TENANT_ID}}` and `{{AAD_APP_CLIENT_ID}}` with actual values

3. **Grant Admin Consent**
   - Azure Portal → App registrations → Terprint AI SSO
   - API permissions → Grant admin consent

4. **Test Authentication**
   ```bash
   npx teamsapp preview --env dev
   ```

## Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/expired token | Check token audience and issuer |
| 403 Forbidden | Missing scope | Verify `Terprint.Access` scope granted |
| Token not found | SSO not configured | Check pre-authorized apps list |
| Consent required | Admin consent missing | Run admin consent flow |

### Debug Headers
APIM can return debug headers in non-production:
- `X-JWT-Validation-Result`: Token validation status
- `X-User-Context`: Extracted user info (dev only)

## Security Considerations

1. **Token Storage**: Tokens are managed by Microsoft 365 platform, never stored by Terprint
2. **Scope Limitation**: Only `Terprint.Access` scope requested, minimal permissions
3. **User Privacy**: Backend receives only user ID, not full profile
4. **Rate Limiting**: Per-user limits prevent abuse
5. **Audit Logging**: All authenticated requests logged with correlation ID
