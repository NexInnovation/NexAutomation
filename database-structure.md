/
├── NexInnovation-config/
│   └── lastNumber: "0001"               # Last assigned home number
│
├── users/
│   └── {uid}/
│       ├── homeId: home0001-<pushKey>   # Links user to home
│       └── role: "admin" or "member"    # User's role
│
├── automation/
│   └── {homeId}/                        # Example: home0001-xyz123
│       ├── home-data/
│       │   ├── total member
│       │   └── total device
│       │
│       ├── user-list/
│       │   └── uid: true/false
│       │
│       ├── user/
│       │   ├── admin/
│       │   │   └── {uid}/
│       │   │       ├── uid
│       │   │       ├── email
│       │   │       ├── role
│       │   │       ├── isAdmin: true/false
│       │   │       ├── firstName
│       │   │       ├── lastName
│       │   │       ├── mobile
│       │   │       ├── city
│       │   │       └── createdAt
│       │   │
│       │   └── member/
│       │       ├── {uid}/
│       │       │   ├── uid
│       │       │   ├── email
│       │       │   ├── role
│       │       │   ├── isAdmin: true/false
│       │       │   ├── firstName
│       │       │   ├── lastName
│       │       │   ├── mobile
│       │       │   ├── city
│       │       │   └── createdAt
│       │       │
│       │       └── {uid}/
│       │           ├── uid
│       │           ├── email
│       │           ├── role
│       │           ├── isAdmin: true/false
│       │           ├── firstName
│       │           ├── lastName
│       │           ├── mobile
│       │           ├── city
│       │           └── createdAt
│       │
│       └── automation/
│           ├── device1/
│           │   ├── wifi-config/
│           │   │   ├── ssid: "DeviceWiFi1"
│           │   │   └── password: "password1"
│           │   ├── deviceData/
│           │   │   ├── chNumber: 4
│           │   │   └── roomName: "Living Room"
│           │   ├── R1/
│           │   │   ├── state: 0
│           │   │   ├── type: 2
│           │   │   └── name: "Fan"
│           │   └── R2/
│           │       ├── state: 1
│           │       ├── type: 1
│           │       └── name: "Light"
│           │
│           ├── device2/
│           │   ├── wifi-config/
│           │   │   ├── ssid: "DeviceWiFi2"
│           │   │   └── password: "password2"
│           │   ├── deviceData/
│           │   │   ├── chNumber: 4
│           │   │   └── roomName: "Office"
│           │   ├── R1/
│           │   │   ├── state: 0
│           │   │   ├── type: 2
│           │   │   └── name: "Fan"
│           │   └── R2/
│           │       ├── state: 1
│           │       ├── type: 1
│           │       └── name: "Light"
