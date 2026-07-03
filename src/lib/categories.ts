// Comprehensive category system for university lost and found items

export enum ItemCategory {
  // Electronics
  PHONES = 'Phones',
  LAPTOPS = 'Laptops',
  TABLETS = 'Tablets',
  CHARGERS = 'Chargers',
  POWER_BANKS = 'Power Banks',
  EARBUDS = 'Earbuds',
  HEADPHONES = 'Headphones',
  USB_DRIVES = 'USB Drives',
  HARD_DRIVES = 'Hard Drives',
  SCIENTIFIC_CALCULATORS = 'Scientific Calculators',
  GRAPHING_CALCULATORS = 'Graphing Calculators',

  // Academics
  BOOKS = 'Books',
  LECTURE_NOTES = 'Lecture Notes',
  ASSIGNMENTS = 'Assignments',
  PROJECT_REPORTS = 'Project Reports',
  LAB_MANUALS = 'Lab Manuals',
  DRAWING_BOARDS = 'Drawing Boards',

  // Identification & Cards
  STUDENT_IDS = 'Student IDs',
  NATIONAL_IDS = 'National IDs',
  PASSPORTS = 'Passports',
  DRIVER_LICENSES = 'Driver Licenses',
  ATM_CARDS = 'ATM Cards',

  // Bags & Wallets
  WALLETS = 'Wallets',
  PURSES = 'Purses',
  BACKPACKS = 'Backpacks',
  LAPTOP_BAGS = 'Laptop Bags',
  HANDBAGS = 'Handbags',
  TRAVEL_BAGS = 'Travel Bags',

  // Keys & Security
  KEYS = 'Keys',
  ROOM_KEYS = 'Room Keys',
  CAR_KEYS = 'Car Keys',
  PADLOCKS = 'Padlocks',

  // Personal & Clothing
  UMBRELLAS = 'Umbrellas',
  WATER_BOTTLES = 'Water Bottles',
  JACKETS = 'Jackets',
  HOODIES = 'Hoodies',
  LAB_COATS = 'Lab Coats',
  SHOES = 'Shoes',
  SLIPPERS = 'Slippers',
  CAPS = 'Caps',
  WATCHES = 'Watches',
  JEWELRY = 'Jewelry',

  // Hostel & Living
  COOKING_POTS = 'Cooking Pots',
  ELECTRIC_KETTLES = 'Electric Kettles',
  EXTENSION_BOARDS = 'Extension Boards',
  REMOTE_CONTROLS = 'Remote Controls',

  // Sports
  SPORTS_EQUIPMENT = 'Sports Equipment',
  FOOTBALL_BOOTS = 'Football Boots',
  JERSEYS = 'Jerseys',

  // Miscellaneous
  MISCELLANEOUS = 'Miscellaneous',
}

// Database-ready structures grouped by high-level category
export const CATEGORY_GROUPS = {
  'Electronics': [
    ItemCategory.PHONES,
    ItemCategory.LAPTOPS,
    ItemCategory.TABLETS,
    ItemCategory.CHARGERS,
    ItemCategory.POWER_BANKS,
    ItemCategory.EARBUDS,
    ItemCategory.HEADPHONES,
    ItemCategory.USB_DRIVES,
    ItemCategory.HARD_DRIVES,
    ItemCategory.SCIENTIFIC_CALCULATORS,
    ItemCategory.GRAPHING_CALCULATORS,
  ],
  'Academics': [
    ItemCategory.BOOKS,
    ItemCategory.LECTURE_NOTES,
    ItemCategory.ASSIGNMENTS,
    ItemCategory.PROJECT_REPORTS,
    ItemCategory.LAB_MANUALS,
    ItemCategory.DRAWING_BOARDS,
  ],
  'IDs & Cards': [
    ItemCategory.STUDENT_IDS,
    ItemCategory.NATIONAL_IDS,
    ItemCategory.PASSPORTS,
    ItemCategory.DRIVER_LICENSES,
    ItemCategory.ATM_CARDS,
  ],
  'Bags & Wallets': [
    ItemCategory.WALLETS,
    ItemCategory.PURSES,
    ItemCategory.BACKPACKS,
    ItemCategory.LAPTOP_BAGS,
    ItemCategory.HANDBAGS,
    ItemCategory.TRAVEL_BAGS,
  ],
  'Keys & Security': [
    ItemCategory.KEYS,
    ItemCategory.ROOM_KEYS,
    ItemCategory.CAR_KEYS,
    ItemCategory.PADLOCKS,
  ],
  'Personal & Clothing': [
    ItemCategory.UMBRELLAS,
    ItemCategory.WATER_BOTTLES,
    ItemCategory.JACKETS,
    ItemCategory.HOODIES,
    ItemCategory.LAB_COATS,
    ItemCategory.SHOES,
    ItemCategory.SLIPPERS,
    ItemCategory.CAPS,
    ItemCategory.WATCHES,
    ItemCategory.JEWELRY,
  ],
  'Hostel & Living': [
    ItemCategory.COOKING_POTS,
    ItemCategory.ELECTRIC_KETTLES,
    ItemCategory.EXTENSION_BOARDS,
    ItemCategory.REMOTE_CONTROLS,
  ],
  'Sports': [
    ItemCategory.SPORTS_EQUIPMENT,
    ItemCategory.FOOTBALL_BOOTS,
    ItemCategory.JERSEYS,
  ],
  'Other': [
    ItemCategory.MISCELLANEOUS,
  ]
}

export const ALL_CATEGORIES = Object.values(ItemCategory)

// High-value categories that trigger security recommendation
export const HIGH_VALUE_CATEGORIES = new Set([
  ItemCategory.PHONES,
  ItemCategory.LAPTOPS,
  ItemCategory.TABLETS,
  ItemCategory.WALLETS,
  ItemCategory.STUDENT_IDS,
  ItemCategory.NATIONAL_IDS,
  ItemCategory.PASSPORTS,
  ItemCategory.ATM_CARDS,
  ItemCategory.JEWELRY,
])

// Meeting locations for item return coordination (via chat)
export const MEETING_LOCATIONS = [
  'Library Entrance',
  'Engineering Block Entrance',
  'Administration Block',
  'SRC Office',
  'Security Office',
  'Cafeteria',
  'Other Public Location',
]

// Custody holder options
export const HOLDER_OPTIONS = [
  {
    value: 'finder' as const,
    label: 'I am keeping it safely',
    description: 'I will keep the item safely until ownership has been verified.',
    icon: '🙋',
    color: 'blue',
  },
  {
    value: 'security' as const,
    label: 'Security Office',
    description: 'The item has been handed over to campus security.',
    icon: '🛡️',
    color: 'amber',
  },
  {
    value: 'student_affairs' as const,
    label: 'Student Affairs',
    description: 'The item has been handed to Student Affairs.',
    icon: '🏛️',
    color: 'purple',
  },
  {
    value: 'other' as const,
    label: 'Other Trusted Location',
    description: 'The item is with another trusted office or authority.',
    icon: '📍',
    color: 'slate',
  },
]
