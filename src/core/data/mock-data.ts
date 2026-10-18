import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { Cart } from '../models/cart.model';
import { AdvancedStatistics, DashboardKPIs } from '../models/statistics.model';
import { ForecastResponse } from '../models/forecast.model';

export interface ExtendedProduct extends Product {
  stock?: number;
  brand?: string;
  warranty?: string;
  warrantyMonths?: number;
  serialNumber?: string;
}

export interface ExtendedUser extends User {
  role?: string;
  department?: string;
}

export interface ExtendedCart extends Cart {
  status?: 'En attente' | 'Validé' | 'Livré' | 'En cours d\'affectation';
  notes?: string;
}

export const MOCK_PRODUCTS: ExtendedProduct[] = [
  {
    id: 1,
    title: 'Apple MacBook Pro 16" M3 Max (64 Go / 1 To SSD)',
    price: 3849.00,
    description: 'Station de développement haut de gamme pour ingénieurs et architectes cloud. Puce M3 Max 16 cœurs, écran Liquid Retina XDR 120Hz.',
    category: 'Laptops & Postes Dev',
    brand: 'Apple',
    stock: 14,
    warrantyMonths: 36,
    serialNumber: 'MBP-M3X-901',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    title: 'Lenovo ThinkPad X1 Carbon Gen 11 (Intel Core i7 / 32 Go)',
    price: 1899.50,
    description: 'Ultrabook professionnel ultra-léger pour développeurs mobiles et chefs de projet. Écran 14" OLED 2.8K, connectivité 5G intégrée.',
    category: 'Laptops & Postes Dev',
    brand: 'Lenovo',
    stock: 22,
    warrantyMonths: 36,
    serialNumber: 'TP-X1C-412',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    title: 'Dell XPS 15 9530 Developer Edition (i9 / 64 Go / RTX 4070)',
    price: 2690.00,
    description: 'Station portable de compilation lourde et modélisation. Écran tactile InfinityEdge 3.5K OLED, châssis aluminium usiné CNC.',
    category: 'Laptops & Postes Dev',
    brand: 'Dell',
    stock: 9,
    warrantyMonths: 36,
    serialNumber: 'DELL-XPS-887',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    title: 'HP ZBook Studio G10 Mobile Workstation (i7 / 32 Go / RTX A2000)',
    price: 2450.00,
    description: 'Workstation certifiée ISV conçue pour l\'ingénierie logicielle, le rendu 3D et les environnements de conteneurs Docker/K8s.',
    category: 'Laptops & Postes Dev',
    brand: 'HP',
    stock: 11,
    warrantyMonths: 36,
    serialNumber: 'HP-ZB-301',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    title: 'Dell PowerEdge R760 Rack Server (2x Intel Xeon Gold / 128 Go ECC)',
    price: 7490.00,
    description: 'Serveur rack 2U bi-socket taillé pour la virtualisation VMware ESXi, bases de données relationnelles à haut débit et clusters Kubernetes.',
    category: 'Serveurs & Cloud',
    brand: 'Dell Enterprise',
    stock: 5,
    warrantyMonths: 60,
    serialNumber: 'PE-R760-001',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 6,
    title: 'HPE ProLiant DL380 Gen11 (Xeon Silver 4410Y / 64 Go ECC / 8x SFF)',
    price: 5200.00,
    description: 'Serveur informatique résilient pour charges de travail critiques d\'entreprise avec gestion à distance sécurisée iLO 6.',
    category: 'Serveurs & Cloud',
    brand: 'HPE',
    stock: 7,
    warrantyMonths: 60,
    serialNumber: 'HPE-DL380-11',
    image: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 7,
    title: 'Supermicro 1U Edge Cloud Server (AMD EPYC 9124 / 64 Go DDR5)',
    price: 3650.00,
    description: 'Serveur 1U haute densité optimisé pour les nœuds de calcul edge, passerelles API et clusters de microservices haute disponibilité.',
    category: 'Serveurs & Cloud',
    brand: 'Supermicro',
    stock: 8,
    warrantyMonths: 36,
    serialNumber: 'SM-1U-EPYC',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 8,
    title: 'APC Smart-UPS On-Line SRT 3000VA RM 230V avec Carte Réseau',
    price: 1980.00,
    description: 'Onduleur haute protection électrique rackable avec double conversion en ligne et surveillance SNMP réseau pour salle serveurs.',
    category: 'Serveurs & Cloud',
    brand: 'APC Schneider',
    stock: 12,
    warrantyMonths: 36,
    serialNumber: 'APC-SRT-3000',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 9,
    title: 'Cisco Catalyst 9300 Switch 48 Ports Gigabit PoE+ (715W)',
    price: 4320.00,
    description: 'Commutateur réseau manageable d\'entreprise empilable, sécurisé Cisco DNA, routage de couche 3 et alimentation redondante.',
    category: 'Réseau & Cybersécurité',
    brand: 'Cisco Systems',
    stock: 9,
    warrantyMonths: 60,
    serialNumber: 'CSCO-C9300-48P',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 10,
    title: 'Fortinet FortiGate 60F Next-Generation Firewall Appliance',
    price: 1150.00,
    description: 'Pare-feu matériel UTM d\'entreprise avec inspection SSL en profondeur, prévention des intrusions (IPS), filtrage applicatif et SD-WAN.',
    category: 'Réseau & Cybersécurité',
    brand: 'Fortinet',
    stock: 16,
    warrantyMonths: 36,
    serialNumber: 'FG-60F-SEC',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 11,
    title: 'Ubiquiti UniFi Dream Machine Pro (Routeur 10G SFP+ / Switch)',
    price: 460.00,
    description: 'Passerelle réseau unifiée tout-en-un 10G SFP+ avec contrôleur UniFi OS, surveillance IPS/IDS et baie disque intégrée pour vidéosurveillance.',
    category: 'Réseau & Cybersécurité',
    brand: 'Ubiquiti',
    stock: 18,
    warrantyMonths: 24,
    serialNumber: 'UDM-PRO-410',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 12,
    title: 'Aruba CX 6200F 24G Class 4 PoE 4SFP+ Switch (R8828A)',
    price: 2150.00,
    description: 'Switch réseau campus haute performance 24 ports avec liaison montante 10G SFP+, télémétrie en temps réel et automatisation ArubaOS-CX.',
    category: 'Réseau & Cybersécurité',
    brand: 'Aruba HPE',
    stock: 10,
    warrantyMonths: 60,
    serialNumber: 'ARU-6200F-24',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 13,
    title: 'Synology DiskStation DS1621+ 6-Baies NAS Serveur',
    price: 1099.00,
    description: 'Solution de stockage centralisé d\'entreprise pour sauvegardes automatiques, cibles iSCSI de virtualisation et partage collaboratif.',
    category: 'Stockage & Composants',
    brand: 'Synology',
    stock: 13,
    warrantyMonths: 36,
    serialNumber: 'SYN-DS1621P',
    image: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 14,
    title: 'Samsung 990 PRO NVMe PCIe 4.0 SSD 4 To avec Dissipateur',
    price: 389.90,
    description: 'Disque SSD ultra-rapide jusqu\'à 7450 Mo/s en lecture séquentielle pour stations de développement intensif et bases de données locales.',
    category: 'Stockage & Composants',
    brand: 'Samsung',
    stock: 35,
    warrantyMonths: 60,
    serialNumber: 'SAM-990P-4TB',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 15,
    title: 'Seagate Exos X20 20 To SATA 6Gb/s Enterprise 7200 RPM',
    price: 420.00,
    description: 'Disque dur mécanique certifié Data Center pour stockage d\'archives volumineuses, pools ZFS et rétention de logs système.',
    category: 'Stockage & Composants',
    brand: 'Seagate',
    stock: 28,
    warrantyMonths: 60,
    serialNumber: 'SEA-EXOS-20T',
    image: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 16,
    title: 'NVIDIA GeForce RTX 4090 24 Go GDDR6X Workstation Edition',
    price: 2199.00,
    description: 'Accélérateur graphique de référence pour l\'entraînement et l\'inférence de modèles IA/LLM locaux, CUDA et traitement de vision par ordinateur.',
    category: 'Stockage & Composants',
    brand: 'NVIDIA',
    stock: 6,
    warrantyMonths: 36,
    serialNumber: 'NV-RTX4090-AI',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 17,
    title: 'LG UltraFine 34" Incurvé 5K Nano IPS Thunderbolt 4 (34BK95U)',
    price: 1199.00,
    description: 'Écran large panoramique pour développeurs avec hub Thunderbolt 4 intégré, délivrance d\'énergie 96W et profil colorimétrique DCI-P3 98%.',
    category: 'Moniteurs & Périphériques',
    brand: 'LG Electronics',
    stock: 15,
    warrantyMonths: 36,
    serialNumber: 'LG-34UF-5K',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 18,
    title: 'Dell UltraSharp 32" 4K USB-C Hub Monitor (U3223QE)',
    price: 849.00,
    description: 'Moniteur bureautique et programmation avec technologie IPS Black (contraste 2000:1), port Ethernet RJ45 et commutateur KVM intégré.',
    category: 'Moniteurs & Périphériques',
    brand: 'Dell',
    stock: 19,
    warrantyMonths: 36,
    serialNumber: 'DELL-U3223QE',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 19,
    title: 'Souris Sans Fil Logitech MX Master 3S Enterprise (8000 DPI Quiet)',
    price: 119.00,
    description: 'Souris ergonomique de précision pour les équipes techniques. Défilement électromagnétique MagSpeed et compatibilité multi-OS.',
    category: 'Moniteurs & Périphériques',
    brand: 'Logitech',
    stock: 45,
    warrantyMonths: 24,
    serialNumber: 'LOGI-MX3S-ENT',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 20,
    title: 'Pack de 2 Clés de Sécurité YubiKey 5C NFC FIPS (FIDO2 / U2F)',
    price: 155.00,
    description: 'Authentification forte matérielle pour conformité Zero Trust, accès serveurs SSH, consoles AWS/GCP/Azure et SSO entreprise.',
    category: 'Moniteurs & Périphériques',
    brand: 'Yubico',
    stock: 60,
    warrantyMonths: 24,
    serialNumber: 'YUBI-5C-FIPS',
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=80'
  }
];

export const MOCK_USERS: ExtendedUser[] = [
  {
    id: 1,
    username: 'alex.devops',
    email: 'alex.moreau@enterprise-it.net',
    name: { firstname: 'Alexandre', lastname: 'Moreau' },
    role: 'Lead Cloud & DevOps Engineer',
    department: 'Infrastructure Cloud',
    phone: '06-89-12-34-56',
    address: { city: 'Paris', street: '12 Avenue des Champs', zipcode: '75008' }
  },
  {
    id: 2,
    username: 'sarah.secops',
    email: 'sarah.benali@enterprise-it.net',
    name: { firstname: 'Sarah', lastname: 'Benali' },
    role: 'Responsable Cybersécurité & RSSI',
    department: 'Sécurité & Réseaux',
    phone: '06-44-21-98-76',
    address: { city: 'Lyon', street: '45 Rue de la République', zipcode: '69002' }
  },
  {
    id: 3,
    username: 'thomas.fullstack',
    email: 'thomas.leroy@enterprise-it.net',
    name: { firstname: 'Thomas', lastname: 'Leroy' },
    role: 'Senior Fullstack Tech Lead',
    department: 'Développement Web & API',
    phone: '07-55-33-88-12',
    address: { city: 'Nantes', street: '8 Boulevard des Martyrs', zipcode: '44000' }
  },
  {
    id: 4,
    username: 'claire.datascience',
    email: 'claire.dubois@enterprise-it.net',
    name: { firstname: 'Claire', lastname: 'Dubois' },
    role: 'Data Scientist & Ingénieure MLOps',
    department: 'Intelligence Artificielle',
    phone: '06-11-77-99-44',
    address: { city: 'Toulouse', street: '14 Allée des Sciences', zipcode: '31000' }
  },
  {
    id: 5,
    username: 'kevin.sysadmin',
    email: 'kevin.marchand@enterprise-it.net',
    name: { firstname: 'Kevin', lastname: 'Marchand' },
    role: 'Administrateur Systèmes & Stockage',
    department: 'Exploitation IT',
    phone: '07-88-66-22-11',
    address: { city: 'Lille', street: '22 Rue Faidherbe', zipcode: '59000' }
  },
  {
    id: 6,
    username: 'elena.product',
    email: 'elena.vidal@enterprise-it.net',
    name: { firstname: 'Elena', lastname: 'Vidal' },
    role: 'Directrice Technique & DSI',
    department: 'Direction Informatique',
    phone: '06-99-88-77-66',
    address: { city: 'Bordeaux', street: '5 Quai des Chartrons', zipcode: '33000' }
  }
];

export const MOCK_CARTS: ExtendedCart[] = [
  {
    id: 1,
    userId: 1,
    date: '2026-09-15',
    status: 'Livré',
    notes: 'Pack onboarding Lead DevOps : MacBook Pro M3 Max + Écran LG 5K',
    products: [
      { productId: 1, quantity: 1 },
      { productId: 17, quantity: 1 },
      { productId: 19, quantity: 1 }
    ]
  },
  {
    id: 2,
    userId: 2,
    date: '2026-09-22',
    status: 'Validé',
    notes: 'Renouvellement passerelle sécurité campus : FortiGate 60F + Pack YubiKeys',
    products: [
      { productId: 10, quantity: 2 },
      { productId: 20, quantity: 5 }
    ]
  },
  {
    id: 3,
    userId: 3,
    date: '2026-10-02',
    status: 'Livré',
    notes: 'Poste dev ThinkPad X1 + Écran Dell 4K USB-C Hub',
    products: [
      { productId: 2, quantity: 1 },
      { productId: 18, quantity: 1 }
    ]
  },
  {
    id: 4,
    userId: 4,
    date: '2026-10-08',
    status: 'En cours d\'affectation',
    notes: 'Station apprentissage GPU IA local : Dell XPS i9 + GPU RTX 4090 + SSD 4To',
    products: [
      { productId: 3, quantity: 1 },
      { productId: 16, quantity: 1 },
      { productId: 14, quantity: 2 }
    ]
  },
  {
    id: 5,
    userId: 5,
    date: '2026-10-14',
    status: 'Validé',
    notes: 'Extension baie serveurs Datacenter : Serveur Dell R760 + Switch Cisco Catalyst + Onduleur APC',
    products: [
      { productId: 5, quantity: 1 },
      { productId: 9, quantity: 1 },
      { productId: 8, quantity: 1 }
    ]
  },
  {
    id: 6,
    userId: 1,
    date: '2026-10-16',
    status: 'En attente',
    notes: 'Ajout stockage de sauvegarde secondaire : NAS Synology 6 Baies + Disques Exos 20To',
    products: [
      { productId: 13, quantity: 1 },
      { productId: 15, quantity: 4 }
    ]
  }
];

export const MOCK_ADVANCED_STATS: AdvancedStatistics = {
  totalInventoryValue: 462363.50,
  catalogBasePriceSum: 43718.40,
  averageCartValue: 5538.05,
  averageItemsPerCart: 4.0,
  medianPrice: 1939.75,
  stdDevPrice: 1869.05,
  minPrice: 119.00,
  maxPrice: 7490.00,
  categories: [
    {
      category: 'Laptops & Postes Dev',
      productCount: 4,
      percentage: 20.0,
      averagePrice: 2722.13,
      totalValue: 10888.50,
      totalStockValuation: 146835.00
    },
    {
      category: 'Serveurs & Cloud',
      productCount: 4,
      percentage: 20.0,
      averagePrice: 4580.00,
      totalValue: 18320.00,
      totalStockValuation: 126810.00
    },
    {
      category: 'Réseau & Cybersécurité',
      productCount: 4,
      percentage: 20.0,
      averagePrice: 2020.00,
      totalValue: 8080.00,
      totalStockValuation: 87060.00
    },
    {
      category: 'Stockage & Composants',
      productCount: 4,
      percentage: 20.0,
      averagePrice: 1026.97,
      totalValue: 4107.90,
      totalStockValuation: 52887.50
    },
    {
      category: 'Moniteurs & Périphériques',
      productCount: 4,
      percentage: 20.0,
      averagePrice: 580.50,
      totalValue: 2322.00,
      totalStockValuation: 48771.00
    }
  ]
};

export const MOCK_KPIS: DashboardKPIs = {
  totalProducts: 20,
  totalUsers: 6,
  totalCarts: 6,
  totalCategories: 5,
  averagePrice: 2185.92,
  minPrice: 119.00,
  maxPrice: 7490.00,
  totalInventoryValue: 462363.50,
  productGrowthRate: 14.8
};

export function generateMockForecast(
  period = '30d',
  metric = 'budget',
  growthRate = 0.15
): ForecastResponse {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '180d' ? 180 : period === '365d' ? 365 : 30;
  const step = days <= 7 ? 1 : days <= 30 ? 2 : days <= 90 ? 5 : days <= 180 ? 10 : 15;
  const now = new Date();

  const totalInventory = 462363.50;
  const currentCartVal = 33228.30;

  let baseVal = currentCartVal;
  let unit = '€';
  let metricLabel = 'Budget Achats & CapEx IT';

  if (metric === 'depreciation') {
    baseVal = totalInventory;
    unit = '€';
    metricLabel = 'Dépréciation & Amortissement Cumulé';
  } else if (metric === 'refresh') {
    baseVal = Math.round(totalInventory * 0.28);
    unit = '€';
    metricLabel = 'Renouvellement & Fin de Cycle (36m+)';
  } else if (metric === 'obsolescence') {
    baseVal = 5;
    unit = 'équipements';
    metricLabel = 'Risque d\'Obsolescence & Fin de Support Constructeur';
  } else if (metric === 'energy') {
    baseVal = Math.round((20 * 28 + 6 * 15) * (days / 30));
    unit = '€';
    metricLabel = 'Consommation Énergétique & Datacenter';
  } else {
    baseVal = Math.round(currentCartVal * 1.35 + totalInventory * 0.08);
    unit = '€';
    metricLabel = 'Budget Achats & CapEx IT';
  }

  const historical: { date: string; value: number }[] = [];
  const histCount = 6;
  for (let i = histCount - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * (days / histCount) * 86400000);
    let pointVal = baseVal;
    const noise = Math.sin(i * 1.8) * 0.05;

    if (metric === 'depreciation') {
      pointVal = Math.round(baseVal * (1 + i * 0.04) * (1 + noise));
    } else if (metric === 'obsolescence') {
      pointVal = Math.max(1, Math.round((baseVal - i * 0.5) * (1 + noise)));
    } else {
      pointVal = Math.round(baseVal * (1 - i * 0.045) * (1 + noise));
    }

    historical.push({
      date: d.toISOString().split('T')[0],
      value: pointVal
    });
  }

  const forecast: {
    date: string;
    predictedValue: number;
    lowerBound: number;
    upperBound: number;
    confidenceInterval: number;
  }[] = [];

  for (let dIndex = step; dIndex <= days; dIndex += step) {
    const d = new Date(now.getTime() + dIndex * 86400000);
    const compoundFactor = 1 + growthRate * (dIndex / 30);
    let predicted = baseVal;

    if (metric === 'depreciation') {
      const decay = Math.exp(-0.015 * (dIndex / (days / 30)));
      predicted = Math.round(baseVal * Math.max(0.2, decay));
    } else if (metric === 'refresh') {
      predicted = Math.round(baseVal * (1 + 0.08 * (dIndex / 30)));
    } else if (metric === 'obsolescence') {
      predicted = Math.round(baseVal + 1.2 * (dIndex / 30));
    } else {
      predicted = Math.round(baseVal * compoundFactor);
    }

    const uncertainty = Math.min(0.25, 0.05 + 0.04 * (dIndex / days));
    const lower = Math.round(predicted * (1 - uncertainty));
    const upper = Math.round(predicted * (1 + uncertainty));
    const confidence = Math.max(80, Math.round(98 - (dIndex / days) * 16));

    forecast.push({
      date: d.toISOString().split('T')[0],
      predictedValue: predicted,
      lowerBound: lower,
      upperBound: upper,
      confidenceInterval: confidence
    });
  }

  return {
    metric,
    period,
    unit,
    metricLabel,
    historical,
    forecast,
    metadata: {
      modelUsed: 'Régression Polynomiale Temporelle + Lissage Exponentiel Holt-Winters',
      meanAbsoluteError: 4.85,
      generatedAt: now.toISOString()
    }
  };
}
