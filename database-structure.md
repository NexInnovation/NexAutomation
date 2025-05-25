/
├── NexInnovation-config/
│   ├── lastNumber: "0001"               # Last assigned home number
│   └── lastDeviceNumber: "0001"         # (optional) for device count
│
├── users/
│   └── {uid}/
│       ├── homeId: home0001-<pushKey>   # Links user to home
│       └── role: "admin" or "member"    # User's role
│
├── automation/
│   └── {homeId}/                        # Example: home0001-xyz123
│       ├── user/
│       │   └── {uid}/
│       │       ├── uid
│       │       ├── email
│       │       ├── role
│       │       ├── isAdmin: true/false
│       │       ├── firstName
│       │       ├── lastName
│       │       ├── mobile
│       │       ├── city
│       │       └── createdAt
│       │
│       ├── home-config/
│       │   └── wifi-config/
│       │       ├── ssid
│       │       └── password
│       │
│       ├── user-list/
│       │   └── {uid}/
│       │       ├── homeId
│       │       └── role
│       │
│       └── automation/
│           └── device1/
│               ├── deviceData/
│               │   ├── chNumber: 4
│               │   └── roomName: "Living Room"
│               ├── R1/
│               │   ├── state: 0
│               │   └── name: "Fan"
│               └── R2/
│                   ├── state: 1
│                   └── name: "Light"
