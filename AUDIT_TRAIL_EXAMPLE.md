# Audit Trail Feature - Example Data

This document provides example data structures for the audit trail feature added to the user-card component.

## Overview

The audit trail displays a history of changes made to a user's event registration. It shows up as an expandable/collapsible section in the user-card component, collapsed by default.

## Data Structure

### ChangeHistoryEntry Model

```typescript
export class ChangeHistoryEntry {
  timestamp: Date | undefined;
  action: string = "";
  description: string = "";
}
```

### Metadata Model (updated)

```typescript
export class Metadata {
  vehicle: Vehicle = new Vehicle();
  people: People[] = [];
  phoneNumber: string = "";
  registeredAt: Date | undefined;
  paidAt: Date | undefined;
  checkIn: CheckIn = new CheckIn();
  paymentInfo: PaymentInfo = new PaymentInfo();
  comment: string | undefined;
  changeHistory: ChangeHistoryEntry[] = [];  // New field
}
```

## Example JSON Data

### User with Change History

```json
{
  "eventName": "ttamigosnatal2026",
  "userEmail": "user@example.com",
  "paid": true,
  "checkedIn": true,
  "vehicleType": "car",
  "metadata": {
    "vehicle": {
      "plate": "AA-00-BB",
      "make": "Toyota",
      "model": "Corolla"
    },
    "people": [
      {
        "type": "driver",
        "name": "João Silva",
        "phoneNumber": "+351912345678",
        "driversLicense": "12345678",
        "cc": "98765432"
      }
    ],
    "phoneNumber": "+351912345678",
    "registeredAt": "2024-01-01T10:00:00Z",
    "paidAt": "2024-01-02T14:30:00Z",
    "checkIn": {
      "checkInAt": "2024-01-05T09:15:00Z",
      "byWho": "admin@example.com"
    },
    "paymentInfo": {
      "amount": 50,
      "byWho": "João Silva",
      "confirmedAt": "2024-01-02T14:30:00Z",
      "paymentFile": "payment_receipt.pdf"
    },
    "comment": "",
    "changeHistory": [
      {
        "timestamp": "2024-01-01T10:00:00Z",
        "action": "created",
        "description": "Utilizador registado para o evento"
      },
      {
        "timestamp": "2024-01-02T14:30:00Z",
        "action": "payment-confirmed",
        "description": "Pagamento confirmado - €50.00"
      },
      {
        "timestamp": "2024-01-03T16:45:00Z",
        "action": "updated",
        "description": "Atualizado número de telemóvel"
      },
      {
        "timestamp": "2024-01-05T09:15:00Z",
        "action": "checked-in",
        "description": "Check-in efetuado por admin@example.com"
      }
    ]
  }
}
```

### User without Change History (graceful degradation)

```json
{
  "eventName": "ttamigosnatal2026",
  "userEmail": "user2@example.com",
  "paid": false,
  "checkedIn": false,
  "vehicleType": "motorcycle",
  "metadata": {
    "vehicle": {
      "plate": "BB-11-CC",
      "make": "Honda",
      "model": "CBR"
    },
    "people": [
      {
        "type": "driver",
        "name": "Maria Santos",
        "phoneNumber": "+351923456789",
        "driversLicense": "87654321",
        "cc": "12345678"
      }
    ],
    "phoneNumber": "+351923456789",
    "registeredAt": "2024-01-04T11:00:00Z",
    "checkIn": {},
    "paymentInfo": {},
    "changeHistory": []  // Empty array - audit trail won't be displayed
  }
}
```

## Supported Action Types

The following action types have Portuguese translations and color coding:

| Action | Portuguese Label | Color |
|--------|------------------|-------|
| `created` | Criado | Primary (blue) |
| `updated` | Atualizado | Accent (purple) |
| `checked-in` | Check-in | Primary (blue) |
| `checked-out` | Check-out | Warn (orange/red) |
| `payment-confirmed` | Pagamento Confirmado | Primary (blue) |
| `payment-pending` | Pagamento Pendente | Warn (orange/red) |
| `cancelled` | Cancelado | Warn (orange/red) |

Any unrecognized action will be displayed as-is without translation or color coding.

## UI Features

1. **Collapsible Panel**: The audit trail is displayed in an Angular Material Expansion Panel, collapsed by default
2. **Entry Count**: Shows the number of entries in the panel description
3. **Timestamp Formatting**: Uses Angular's date pipe with 'short' format for local time display
4. **Action Chips**: Each action is displayed as a colored chip with friendly labels
5. **Responsive Design**: Works on desktop and mobile devices
6. **Graceful Degradation**: If changeHistory is missing or empty, the section is not displayed at all

## Testing

To test the UI with sample data, you can modify the API response or create a mock in the component for development purposes. Example:

```typescript
// In search.component.ts, after getting the user data:
if (data !== null) {
  this.currentUser = { ...data };
  
  // Add sample change history for testing (remove in production)
  this.currentUser.metadata.changeHistory = [
    {
      timestamp: new Date('2024-01-01T10:00:00Z'),
      action: 'created',
      description: 'Utilizador registado para o evento'
    },
    {
      timestamp: new Date('2024-01-02T14:30:00Z'),
      action: 'payment-confirmed',
      description: 'Pagamento confirmado - €50.00'
    },
    {
      timestamp: new Date('2024-01-05T09:15:00Z'),
      action: 'checked-in',
      description: 'Check-in efetuado por admin@example.com'
    }
  ];
}
```

## Internationalization (i18n)

The current implementation uses Portuguese strings directly in the code. If the application implements i18n in the future, the following strings should be externalized:

- "Histórico de Alterações" (panel title)
- "entrada" / "entradas" (entry count)
- All action labels in the `getActionLabel()` method

The timestamp formatting uses Angular's date pipe which already respects the application's locale settings.
