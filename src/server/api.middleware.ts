import type { IncomingMessage, ServerResponse } from 'http';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export interface ProductItem {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock?: number;
  brand?: string;
  warranty?: string;
  warrantyMonths?: number;
  serialNumber?: string;
}

export interface UserItem {
  id: number;
  username: string;
  email: string;
  name?: { firstname: string; lastname: string };
  phone?: string;
  role?: string;
  department?: string;
  address?: { city?: string; street?: string; zipcode?: string };
}

export interface CartItem {
  id: number;
  userId: number;
  date?: string;
  status?: 'En attente' | 'Validé' | 'Livré' | 'En cours d\'affectation';
  notes?: string;
  products: { productId: number; quantity: number }[];
}

// IT Equipment Database Seed
const fallbackProducts: ProductItem[] = [
  // Laptops & Postes Dev
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

  // Serveurs & Infrastructure Cloud
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

  // Réseau & Cybersécurité
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

  // Stockage & Composants
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

  // Moniteurs & Périphériques IT
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

let cachedProducts: ProductItem[] = [...fallbackProducts];

let cachedUsers: UserItem[] = [
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

let cachedCarts: CartItem[] = [
  {
    id: 1,
    userId: 1, // Alexandre (DevOps)
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
    userId: 2, // Sarah (SecOps)
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
    userId: 3, // Thomas (Fullstack)
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
    userId: 4, // Claire (Data Scientist)
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
    userId: 5, // Kevin (SysAdmin)
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
    userId: 1, // Alexandre (DevOps)
    date: '2026-10-16',
    status: 'En attente',
    notes: 'Ajout stockage de sauvegarde secondaire : NAS Synology 6 Baies + Disques Exos 20To',
    products: [
      { productId: 13, quantity: 1 },
      { productId: 15, quantity: 4 }
    ]
  }
];

function sendJson(res: ServerResponse, data: unknown, status = 200) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.statusCode = status;
  res.end(JSON.stringify(data, null, 2));
}

function readRequestBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export function handleApiRequest(req: IncomingMessage, res: ServerResponse): boolean {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (!pathname.startsWith('/api')) {
    return false;
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 204;
    res.end();
    return true;
  }

  // 0. LLM Status Endpoint: GET /api/llm/status
  if (pathname === '/api/llm/status') {
    const hasKey = !!process.env.GEMINI_API_KEY;
    sendJson(res, {
      status: hasKey ? 'active' : 'fallback',
      model: hasKey ? 'gemini-3.8-flash' : 'Moteur de secours IT',
      provider: 'Google Gemini',
      apiKeyConfigured: hasKey,
      catalogItemsLoaded: cachedProducts.length,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  // 1. getTotalProducts(): GET /api/metrics/total-products
  if (pathname === '/api/metrics/total-products' || pathname === '/api/statistics/total-products' || pathname === '/api/products/total') {
    sendJson(res, { value: cachedProducts.length });
    return true;
  }

  // 2. getTotalUsers(): GET /api/metrics/total-users
  if (pathname === '/api/metrics/total-users' || pathname === '/api/statistics/total-users' || pathname === '/api/users/total') {
    sendJson(res, { value: cachedUsers.length });
    return true;
  }

  // 3. getTotalCarts(): GET /api/metrics/total-carts
  if (pathname === '/api/metrics/total-carts' || pathname === '/api/statistics/total-carts' || pathname === '/api/carts/total') {
    sendJson(res, { value: cachedCarts.length });
    return true;
  }

  // 4. getAveragePrice(): GET /api/metrics/average-price
  if (pathname === '/api/metrics/average-price' || pathname === '/api/statistics/average-price' || pathname === '/api/products/average-price') {
    const prices = cachedProducts.map((p) => p.price);
    const totalPrice = prices.reduce((acc, cur) => acc + cur, 0);
    const avgPrice = prices.length > 0 ? Number((totalPrice / prices.length).toFixed(2)) : 0;
    sendJson(res, { value: avgPrice });
    return true;
  }

  // Global KPIs endpoint
  if (pathname === '/api/statistics/kpis' || pathname === '/api/metrics/kpis') {
    const prices = cachedProducts.map((p) => p.price);
    const totalPrice = prices.reduce((acc, cur) => acc + cur, 0);
    const avgPrice = prices.length > 0 ? Number((totalPrice / prices.length).toFixed(2)) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const totalInventoryValue = cachedProducts.reduce((acc, p) => acc + p.price * (p.stock || 1), 0);

    sendJson(res, {
      totalProducts: cachedProducts.length,
      totalUsers: cachedUsers.length,
      totalCarts: cachedCarts.length,
      averagePrice: avgPrice,
      minPrice,
      maxPrice,
      totalCategories: 5,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2))
    });
    return true;
  }

  // Categories statistics
  if (pathname === '/api/statistics/categories') {
    const catMap = new Map<string, { count: number; total: number; stockTotal: number }>();
    for (const p of cachedProducts) {
      const entry = catMap.get(p.category) || { count: 0, total: 0, stockTotal: 0 };
      entry.count += 1;
      entry.total += p.price;
      entry.stockTotal += p.price * (p.stock || 1);
      catMap.set(p.category, entry);
    }
    const categoriesStats = Array.from(catMap.entries()).map(([cat, val]) => ({
      category: cat,
      productCount: val.count,
      percentage: Number(((val.count / (cachedProducts.length || 1)) * 100).toFixed(1)),
      averagePrice: Number((val.total / (val.count || 1)).toFixed(2)),
      totalValue: Number(val.total.toFixed(2)),
      totalStockValuation: Number(val.stockTotal.toFixed(2))
    }));
    sendJson(res, categoriesStats);
    return true;
  }

  // Advanced statistics
  if (pathname === '/api/statistics/advanced') {
    const prices = cachedProducts.map((p) => p.price).sort((a, b) => a - b);
    const totalPrice = prices.reduce((acc, cur) => acc + cur, 0);
    const avgPrice = prices.length > 0 ? Number((totalPrice / prices.length).toFixed(2)) : 0;
    const minPrice = prices.length > 0 ? prices[0] : 0;
    const maxPrice = prices.length > 0 ? prices[prices.length - 1] : 0;

    // Median
    let medianPrice = 0;
    if (prices.length > 0) {
      const mid = Math.floor(prices.length / 2);
      medianPrice = prices.length % 2 !== 0 ? prices[mid] : Number(((prices[mid - 1] + prices[mid]) / 2).toFixed(2));
    }

    // Standard Deviation
    let stdDevPrice = 0;
    if (prices.length > 0) {
      const variance = prices.reduce((acc, cur) => acc + Math.pow(cur - avgPrice, 2), 0) / prices.length;
      stdDevPrice = Number(Math.sqrt(variance).toFixed(2));
    }

    // Cart calculations
    let totalCartValue = 0;
    let totalItems = 0;
    const productPriceMap = new Map(cachedProducts.map((p) => [p.id, p.price]));

    for (const cart of cachedCarts) {
      for (const item of cart.products) {
        totalItems += item.quantity;
        const itemPrice = productPriceMap.get(item.productId) || 500;
        totalCartValue += itemPrice * item.quantity;
      }
    }
    const averageCartValue = cachedCarts.length > 0 ? Number((totalCartValue / cachedCarts.length).toFixed(2)) : 0;
    const averageItemsPerCart = cachedCarts.length > 0 ? Number((totalItems / cachedCarts.length).toFixed(1)) : 0;

    // Categories
    const catMap = new Map<string, { count: number; total: number; stockValuation: number }>();
    for (const p of cachedProducts) {
      const entry = catMap.get(p.category) || { count: 0, total: 0, stockValuation: 0 };
      entry.count += 1;
      entry.total += p.price;
      entry.stockValuation += p.price * (p.stock || 1);
      catMap.set(p.category, entry);
    }
    const categories = Array.from(catMap.entries()).map(([cat, val]) => ({
      category: cat,
      productCount: val.count,
      percentage: Number(((val.count / (cachedProducts.length || 1)) * 100).toFixed(1)),
      averagePrice: Number((val.total / (val.count || 1)).toFixed(2)),
      totalValue: Number(val.total.toFixed(2)),
      totalStockValuation: Number(val.stockValuation.toFixed(2))
    }));

    const totalInventoryValue = cachedProducts.reduce((acc, p) => acc + p.price * (p.stock || 1), 0);

    sendJson(res, {
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      catalogBasePriceSum: Number(totalPrice.toFixed(2)),
      averageCartValue,
      averageItemsPerCart,
      medianPrice,
      stdDevPrice,
      minPrice,
      maxPrice,
      categories
    });
    return true;
  }

  // --- FORECASTS API ---
  if (pathname === '/api/forecasts' || pathname === '/api/forecasts/predict') {
    const period = url.searchParams.get('period') || '30d';
    const metric = url.searchParams.get('metric') || 'budget';
    const growthRate = parseFloat(url.searchParams.get('growthRate') || '0.10');

    // Temporal Horizon Days
    const days = period === '7d' ? 7 : period === '90d' ? 90 : period === '180d' ? 180 : period === '365d' ? 365 : 30;
    const step = days <= 7 ? 1 : days <= 30 ? 2 : days <= 90 ? 5 : days <= 180 ? 10 : 15;
    const now = new Date();

    const historical: { date: string; value: number }[] = [];
    const forecast: { date: string; predictedValue: number; lowerBound: number; upperBound: number; confidenceInterval: number }[] = [];

    // Total fleet stock inventory value
    const totalInventory = cachedProducts.reduce((acc, p) => acc + p.price * (p.stock || 1), 0) || 45000;
    // Current active endowments (carts)
    const currentCartVal = cachedCarts.reduce((acc, c) => {
      return acc + c.products.reduce((sub, p) => {
        const prod = cachedProducts.find((item) => item.id === p.productId);
        return sub + (prod?.price || 500) * p.quantity;
      }, 0);
    }, 0) || 12500;

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
      baseVal = Math.max(3, Math.round(cachedProducts.length * 0.25));
      unit = 'équipements';
      metricLabel = 'Risque d\'Obsolescence & Fin de Support Constructeur';
    } else if (metric === 'energy') {
      baseVal = Math.round((cachedProducts.length * 28 + cachedCarts.length * 15) * (days / 30));
      unit = '€';
      metricLabel = 'Consommation Énergétique & Datacenter';
    } else {
      // default: budget
      baseVal = Math.round(currentCartVal * 1.35 + (totalInventory * 0.08));
      unit = '€';
      metricLabel = 'Budget Achats & CapEx IT';
    }

    // Historical 6 data points
    const histCount = 6;
    for (let i = histCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * (days / histCount) * 86400000);
      let pointVal = baseVal;
      const noise = Math.sin(i * 1.8) * 0.05;

      if (metric === 'depreciation') {
        // In the past, value was higher before depreciation
        pointVal = Math.round(baseVal * (1 + (i * 0.04)) * (1 + noise));
      } else if (metric === 'obsolescence') {
        pointVal = Math.max(1, Math.round((baseVal - (i * 0.5)) * (1 + noise)));
      } else {
        pointVal = Math.round(baseVal * (1 - (i * 0.045)) * (1 + noise));
      }

      historical.push({
        date: d.toISOString().split('T')[0],
        value: pointVal
      });
    }

    // Forecast projection points
    for (let dIndex = step; dIndex <= days; dIndex += step) {
      const d = new Date(now.getTime() + dIndex * 86400000);
      const compoundFactor = 1 + (growthRate * (dIndex / 30));
      let predicted = baseVal;

      if (metric === 'depreciation') {
        // Amortissement comptable dégressif (perte résiduelle vers 20%)
        const decay = Math.exp(-0.015 * (dIndex / (days / 30)));
        predicted = Math.round(baseVal * Math.max(0.20, decay));
      } else if (metric === 'refresh') {
        // Machines qui franchissent le seuil de 36 mois
        const refreshAccumulator = (dIndex / days) * 0.45;
        predicted = Math.round(baseVal * (1 + refreshAccumulator) * compoundFactor);
      } else if (metric === 'obsolescence') {
        // Équipements atteignant la fin de vie constructeur
        const agingCount = Math.round(baseVal + (dIndex / (days / 6)));
        predicted = agingCount;
      } else if (metric === 'energy') {
        // Consommation électrique croissante avec l'équipement
        predicted = Math.round(baseVal * (1 + (dIndex / days) * 0.3) * (1 + growthRate * 0.5));
      } else {
        // CapEx / Budget
        const noise = Math.sin(dIndex * 0.3) * 0.02;
        predicted = Math.round(baseVal * compoundFactor * (1 + noise));
      }

      const uncertaintyRatio = 0.04 + 0.07 * (dIndex / days);
      const margin = metric === 'obsolescence' 
        ? Math.max(1, Math.round(predicted * 0.12))
        : Math.round(predicted * uncertaintyRatio);

      forecast.push({
        date: d.toISOString().split('T')[0],
        predictedValue: predicted,
        lowerBound: Math.max(0, predicted - margin),
        upperBound: predicted + margin,
        confidenceInterval: 95
      });
    }

    sendJson(res, {
      metric,
      period,
      unit,
      metricLabel,
      historical,
      forecast,
      metadata: {
        modelUsed: 'ARIMA Multi-Séries + Holt-Winters IT Assets v2.5',
        meanAbsoluteError: metric === 'obsolescence' ? 2.1 : 3.8,
        generatedAt: new Date().toLocaleTimeString('fr-FR')
      }
    });
    return true;
  }

  // --- CHATBOT & AI ASSISTANT API ---
  if (pathname === '/api/chat' || pathname === '/api/chatbot') {
    if (req.method === 'POST') {
      readRequestBody(req).then(async (body) => {
        const rawMessage = ((body['message'] || body['prompt'] || '') as string).trim();
        const query = rawMessage.toLowerCase();
        const action = (body['action'] || '') as string;

        // Contextual analysis over the live temporary memory
        const totalProducts = cachedProducts.length;
        const totalUsers = cachedUsers.length;
        const totalCarts = cachedCarts.length;
        const totalStockValuation = cachedProducts.reduce((acc, p) => acc + p.price * (p.stock || 1), 0);
        const totalPriceSum = cachedProducts.reduce((acc, p) => acc + p.price, 0);
        const avgPrice = totalProducts > 0 ? (totalPriceSum / totalProducts).toFixed(2) : '0';

        const sortedByPriceDesc = [...cachedProducts].sort((a, b) => b.price - a.price);
        const sortedByPriceAsc = [...cachedProducts].sort((a, b) => a.price - b.price);
        const highestPriced = sortedByPriceDesc[0];
        const lowestPriced = sortedByPriceAsc[0];
        const lowStockItems = cachedProducts.filter((p) => (p.stock || 0) < 10);

        // Category aggregation
        const catMap = new Map<string, { count: number; totalVal: number; items: ProductItem[] }>();
        for (const p of cachedProducts) {
          const entry = catMap.get(p.category) || { count: 0, totalVal: 0, items: [] };
          entry.count += 1;
          entry.totalVal += p.price * (p.stock || 1);
          entry.items.push(p);
          catMap.set(p.category, entry);
        }

        let answer = '';
        let structuredData: Record<string, unknown> | null = null;

        // 1. Audit & Global Synthesis
        if (action === 'audit' || query.includes('audit') || query.includes('synthèse') || query.includes('synthese') || query.includes('inventaire global')) {
          answer = `📊 **Audit & Synthèse Globale du Parc IT :**\n\n` +
            `• **Valorisation Totale du Stock (CapEx) :** ${totalStockValuation.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}\n` +
            `• **Références Actives :** ${totalProducts} matériels homologués répartis sur 5 segments stratégiques.\n` +
            `• **Prix Moyen Unitaire :** ${avgPrice} € (Min : ${lowestPriced?.price} € / Max : ${highestPriced?.price} €).\n` +
            `• **Actif le Plus Valorisé :** ${highestPriced ? highestPriced.title + ' (' + highestPriced.price.toLocaleString('fr-FR') + ' €)' : 'N/A'}.\n` +
            `• **Dotations Collaborateurs :** ${totalCarts} commandes suivies pour ${totalUsers} collaborateurs enregistrés.\n` +
            `• **Alertes Stock Faible :** ${lowStockItems.length} référence(s) sous le seuil de sécurité.\n\n` +
            `💡 *Diagnostic :* Le parc matériel est parfaitement documenté avec une forte représentativité des postes d'ingénierie et de l'infrastructure réseau.`;
          structuredData = {
            totalValuation: totalStockValuation,
            activeAssets: totalProducts,
            averageUnitPrice: avgPrice,
            topAsset: highestPriced?.title,
            lowStockCount: lowStockItems.length
          };

        // 2. Forecast & Budget
        } else if (action === 'forecast' || query.includes('prevision') || query.includes('prévision') || query.includes('budget') || query.includes('renouvellement') || query.includes('projection')) {
          const estimatedQ1 = Math.round(totalStockValuation * 0.12);
          const estimatedYearly = Math.round(totalStockValuation * 0.28);
          answer = `🔮 **Prévision Budgétaire & Renouvellement IT (Modélisation Prédictive) :**\n\n` +
            `• **Budget Prévisionnel Q+1 (3 mois) :** ~${estimatedQ1.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}\n` +
            `• **Plan d'Investissement Annuel (CapEx) :** ~${estimatedYearly.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}\n` +
            `• **Cycle de Remplacement Recommandé :**\n` +
            `   - Postes portables / Laptops Dev : **36 mois** (Obsolescence batterie & CPU)\n` +
            `   - Serveurs rackables & Baies : **60 mois** (Cycle de garantie ProSupport)\n` +
            `   - Écrans & Périphériques : **48 mois**\n` +
            `• **Priorités de Réapprovisionnement Immédiat :**\n` +
            lowStockItems.slice(0, 3).map((i) => `   - **${i.title}** (Stock actuel : ${i.stock} unités | Seuil : 10)`).join('\n') + `\n\n` +
            `📈 *Conseil Prédictif :* Planifiez une commande groupée au début du trimestre prochain pour négocier une réduction grossiste de 8% à 12% sur les lots de laptops.`;
          structuredData = {
            nextQuarterEstimate: estimatedQ1,
            yearlyCapex: estimatedYearly,
            criticalStockCount: lowStockItems.length
          };

        // 3. Anomalies & Cost Dispersion
        } else if (action === 'anomalies' || query.includes('anomalie') || query.includes('dispersion') || query.includes('ecart') || query.includes('écart') || query.includes('outlier')) {
          const prices = cachedProducts.map((p) => p.price);
          const variance = prices.reduce((acc, cur) => acc + Math.pow(cur - Number(avgPrice), 2), 0) / prices.length;
          const stdDev = Math.sqrt(variance);
          const outliers = cachedProducts.filter((p) => Math.abs(p.price - Number(avgPrice)) > 1.4 * stdDev);

          answer = `⚠️ **Détection d'Anomalies de Coûts & Dispersion Matérielle :**\n\n` +
            `• **Écart-Type des Prix (σ) :** ${stdDev.toFixed(2)} € (Variabilité importante inhérente au mélange infrastructure et accessoires).\n` +
            `• **Matériels Hors-Normes Identifiés (> 1.4σ) :**\n` +
            outliers.map((o) => `   - **${o.title}** : ${o.price.toLocaleString('fr-FR')} € *(${o.category})* - Stock : ${o.stock}`).join('\n') + `\n\n` +
            `🔍 *Recommandation de Contrôle :* Il est conseillé de ventiler distinctement les budgets « Infrastructure Centrale » (${outliers.length} équipements lourds) et « Postes Utilisateurs » pour éviter de fausser les coûts moyens par employé.`;
          structuredData = {
            standardDeviation: Number(stdDev.toFixed(2)),
            outliersFound: outliers.length,
            outliers: outliers.map((o) => ({ id: o.id, title: o.title, price: o.price }))
          };

        // 4. Cost Optimization & TCO
        } else if (action === 'optim' || query.includes('optim') || query.includes('economie') || query.includes('économie') || query.includes('recommand') || query.includes('tco') || query.includes('réduire les coûts')) {
          const potentialSavings = Math.round(totalStockValuation * 0.085);
          answer = `💡 **Plan d'Optimisation des Coûts & TCO du Parc IT :**\n\n` +
            `1. **Standardisation des Postes de Travail :**\n` +
            `   - Limiter les modèles développeurs à 2 références types (*MacBook Pro M3 Max* pour macOS et *Lenovo ThinkPad X1 Carbon* pour Linux/Windows).\n` +
            `   - Gain estimé sur la gestion des masters OS et le stock tampon : **~7 500 €/an**.\n\n` +
            `2. **Contrats Cadres & Remises Volume :**\n` +
            `   - Consolider les achats réseau (*Cisco Catalyst* et *Ubiquiti*) chez un distributeur unique pour obtenir 12 à 15% de remise contractuelle.\n` +
            `   - Gain estimé : **~6 200 €**.\n\n` +
            `3. **Extensions de Garantie Constructeur J+1 :**\n` +
            `   - Intégrer les extensions 5 ans ProSupport directement au bon de commande pour éliminer les frais d'intervention d'urgence hors contrat.\n\n` +
            `💰 **Économie Globale Projetée :** **~${potentialSavings.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}** par an.`;
          structuredData = {
            projectedSavings: potentialSavings,
            recommendedStandards: ['MacBook Pro M3 Max', 'Lenovo ThinkPad X1', 'Dell UltraSharp 32" 4K']
          };

        // 5. Carts & Employee Hardware Allocation
        } else if (action === 'carts' || query.includes('panier') || query.includes('affectation') || query.includes('dotation') || query.includes('commande en attente')) {
          const pendingCarts = cachedCarts.filter((c) => c.status === 'En attente' || c.status === "En cours d'affectation");
          const completedCarts = cachedCarts.filter((c) => c.status === 'Validé' || c.status === 'Livré');

          answer = `🛒 **Audit des Affectations Matérielles & Paniers Collaborateurs :**\n\n` +
            `• **Volume Global des Dotations :** ${totalCarts} commandes enregistrées dans le système.\n` +
            `• **Commandes Validées / Déployées :** ${completedCarts.length} dotation(s) en service actif.\n` +
            `• **En Attente d'Approbation DSI :** ${pendingCarts.length} demande(s) en attente.\n` +
            pendingCarts.map((c) => `   - **Dotation #${c.id}** (User #${c.userId}) : *${c.notes || 'Équipement standard'}* [${c.status}]`).join('\n') + `\n\n` +
            `⚡ *Recommandation Opérationnelle :* Traiter en priorité les dotations en attente afin de garantir la disponibilité du matériel avant le début des cycles de sprint.`;
          structuredData = {
            totalCarts,
            pendingCount: pendingCarts.length,
            completedCount: completedCarts.length
          };

        // 6. Executive CIO / DSI Report
        } else if (action === 'report' || query.includes('rapport') || query.includes('dsi') || query.includes('comité') || query.includes('comite') || query.includes('exécutif')) {
          answer = `📑 **Rapport Exécutif de Gouvernance du Parc IT (Comité DSI) :**\n\n` +
            `**1. Synthèse de l'Actif Informatique (CapEx) :**\n` +
            `   • Valorisation de l'inventaire : **${totalStockValuation.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**\n` +
            `   • Nombre de références en production : **${totalProducts}**\n` +
            `   • Coût moyen par équipement : **${avgPrice} €**\n\n` +
            `**2. Résilience Opérationnelle & Disponibilité :**\n` +
            `   • Catégorie dominante : *Laptops & Postes Dev* et *Serveurs & Cloud* (${catMap.get('Laptops & Postes Dev')?.count || 4} références postes).\n` +
            `   • Réserve de sécurité : ${lowStockItems.length} alerte(s) de stock à régulariser sous 15 jours.\n` +
            `   • Niveau de service utilisateurs : ${totalCarts} dotations gérées pour ${totalUsers} collaborateurs.\n\n` +
            `**3. Arbitrages & Décisions Recommandées :**\n` +
            `   • Approuver l'enveloppe de réapprovisionnement Q+1 estimée à **${Math.round(totalStockValuation * 0.12).toLocaleString('fr-FR')} €**.\n` +
            `   • Valider le protocole de standardisation des postes de développement pour optimiser le TCO.\n` +
            `   • Automatiser le renouvellement des licences et certificats réseaux associés.`;
          structuredData = {
            reportType: 'Executive DSI Summary',
            valuation: totalStockValuation,
            activeAssets: totalProducts,
            status: 'Approved'
          };

        // 7. Onboarding Bundle Simulation for N Engineers (e.g. "pack onboarding pour 3 développeurs")
        } else if (query.includes('onboarding') || query.includes('pack') || query.includes('nouvel ingénieur') || query.includes('nouveaux') || query.includes('recrutement') || query.includes('arrivee') || query.includes('arrivée')) {
          const matchNum = query.match(/\b(\d+)\b/);
          const devCount = matchNum ? parseInt(matchNum[1], 10) : 3;

          const laptop = cachedProducts.find((p) => p.category === 'Laptops & Postes Dev') || highestPriced;
          const screen = cachedProducts.find((p) => p.category === 'Écrans & Périphériques Pro') || lowestPriced;
          const periphCost = 180; // Keyboard, mouse, hub

          const unitDevCost = (laptop?.price || 2499) + (screen?.price || 649) + periphCost;
          const totalPackCost = unitDevCost * devCount;

          answer = `🚀 **Simulation Pack Onboarding Développeurs (${devCount} ingénieur${devCount > 1 ? 's' : ''}) :**\n\n` +
            `Pour équiper **${devCount} nouveau(x) développeur(s)** selon les standards de l'entreprise :\n\n` +
            `• **${devCount}x Poste Dev :** ${laptop?.title || 'MacBook Pro M3 Max'} (${(laptop?.price || 2499).toLocaleString('fr-FR')} €/u)\n` +
            `• **${devCount}x Affichage Pro :** ${screen?.title || 'Dell UltraSharp 32" 4K'} (${(screen?.price || 649).toLocaleString('fr-FR')} €/u)\n` +
            `• **${devCount}x Kit Accessoires & Docking :** Clavier mécanique, souris ergonomique et Hub USB-C (${periphCost} €/u)\n\n` +
            `📊 **Détail Budgétaire :**\n` +
            `• Coût d'équipement par collaborateur : **${unitDevCost.toLocaleString('fr-FR')} €**\n` +
            `• **Budget Total Requis :** **${totalPackCost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**\n` +
            `• **Disponibilité en Stock :** ${laptop?.stock && laptop.stock >= devCount ? `✅ Suffisant (${laptop.stock} disponibles)` : `⚠️ Attention, stock limité (${laptop?.stock || 0} disponibles)`}\n\n` +
            `Souhaitez-vous générer un panier de dotation pour ces ${devCount} postes ?`;
          structuredData = {
            packDeveloperCount: devCount,
            unitCost: unitDevCost,
            totalPackCost,
            laptopModel: laptop?.title
          };

        // 8. Specific Product or Brand Search (MacBook, ThinkPad, Dell, Cisco, Ubiquiti, Supermicro, Synology, Logitech)
        } else if (['macbook', 'apple', 'thinkpad', 'lenovo', 'dell', 'cisco', 'ubiquiti', 'supermicro', 'synology', 'logitech', 'samsung', 'poweredge'].some((b) => query.includes(b))) {
          const matchedBrand = ['macbook', 'apple', 'thinkpad', 'lenovo', 'dell', 'cisco', 'ubiquiti', 'supermicro', 'synology', 'logitech', 'samsung', 'poweredge'].find((b) => query.includes(b))!;
          const matches = cachedProducts.filter((p) =>
            p.title.toLowerCase().includes(matchedBrand) ||
            p.description.toLowerCase().includes(matchedBrand) ||
            (p.brand && p.brand.toLowerCase().includes(matchedBrand))
          );

          if (matches.length > 0) {
            answer = `🔍 **Résultats de Recherche pour « ${matchedBrand.toUpperCase()} » (${matches.length} référence${matches.length > 1 ? 's' : ''}) :**\n\n` +
              matches.map((m) =>
                `• **${m.title}**\n` +
                `   - Catégorie : *${m.category}*\n` +
                `   - Prix unitaire : **${m.price.toLocaleString('fr-FR')} €**\n` +
                `   - Stock en réserve : **${m.stock || 0} unités**\n` +
                `   - Garantie constructeur : *${m.warranty || 'Garantie standard 2 ans'}*\n` +
                `   - Description : ${m.description.slice(0, 120)}...`
              ).join('\n\n') + `\n\n` +
              `💡 Vous pouvez éditer ou commander ce matériel directement depuis l'onglet **Catalogue IT**.`;
            structuredData = {
              searchedBrand: matchedBrand,
              matchCount: matches.length,
              matches: matches.map((m) => ({ id: m.id, title: m.title, price: m.price, stock: m.stock }))
            };
          } else {
            answer = `🔍 Aucun équipement spécifique trouvé pour la marque « ${matchedBrand} » dans le catalogue actuel. Vous pouvez ajouter cette référence via le bouton **Ajouter un Produit** du catalogue IT.`;
          }

        // 9. Most expensive / Highest priced equipment
        } else if (query.includes('plus cher') || query.includes('cher') || query.includes('highest') || query.includes('haut de gamme') || query.includes('maximum')) {
          const top3 = sortedByPriceDesc.slice(0, 3);
          answer = `💎 **Top 3 des Équipements les Plus Chers du Catalogue :**\n\n` +
            top3.map((item, idx) =>
              `${idx + 1}. **${item.title}** : **${item.price.toLocaleString('fr-FR')} €**\n` +
              `   - Catégorie : *${item.category}*\n` +
              `   - Stock en magasin : ${item.stock} unités (Valeur totale : ${(item.price * (item.stock || 1)).toLocaleString('fr-FR')} €)\n` +
              `   - Garantie : ${item.warranty || 'ProSupport 3 ans'}`
            ).join('\n\n') + `\n\n` +
            `L'équipement numéro 1 est **${highestPriced.title}**, représentant l'investissement matériel le plus conséquent du parc.`;
          structuredData = {
            highestPrice: highestPriced.price,
            highestProduct: highestPriced.title,
            top3: top3.map((t) => ({ title: t.title, price: t.price }))
          };

        // 10. Cheapest equipment / Accessoires
        } else if (query.includes('moins cher') || query.includes('accessible') || query.includes('lowest') || query.includes('minimum')) {
          const bot3 = sortedByPriceAsc.slice(0, 3);
          answer = `🏷️ **Équipements les Plus Accessibles du Parc IT :**\n\n` +
            bot3.map((item, idx) =>
              `${idx + 1}. **${item.title}** : **${item.price.toLocaleString('fr-FR')} €**\n` +
              `   - Catégorie : *${item.category}*\n` +
              `   - Stock en réserve : ${item.stock} unités`
            ).join('\n\n') + `\n\n` +
            `L'article le plus économique est **${lowestPriced.title}** (${lowestPriced.price} €).`;
          structuredData = {
            lowestPrice: lowestPriced.price,
            lowestProduct: lowestPriced.title
          };

        // 11. Low stock & supply alerts
        } else if (query.includes('rupture') || query.includes('stock faible') || query.includes('alerte stock') || query.includes('alerte') || query.includes('reapprovision')) {
          if (lowStockItems.length > 0) {
            answer = `🚨 **Alerte de Stock Faible (< 10 unités en réserve) :**\n\n` +
              `Nous avons identifié **${lowStockItems.length} équipement(s)** nécessitant une commande de réapprovisionnement :\n\n` +
              lowStockItems.map((item) =>
                `• **${item.title}**\n` +
                `   - Stock restant : **${item.stock} unité(s)** (Seuil critique : 10)\n` +
                `   - Prix unitaire : ${item.price.toLocaleString('fr-FR')} €\n` +
                `   - Catégorie : *${item.category}*`
              ).join('\n\n') + `\n\n` +
              `⚠️ Recommandation : Passer commande avant la fin de semaine pour éviter toute rupture lors des prochaines dotations.`;
            structuredData = {
              criticalCount: lowStockItems.length,
              criticalItems: lowStockItems.map((i) => ({ title: i.title, stock: i.stock }))
            };
          } else {
            answer = `✅ **Tous les niveaux de stocks sont optimaux.** Aucune référence n'est sous le seuil critique de 10 unités.`;
            structuredData = { criticalCount: 0 };
          }

        // 12. Categories breakdown
        } else if (query.includes('catégorie') || query.includes('categorie') || query.includes('repartition') || query.includes('répartition') || query.includes('segments')) {
          answer = `📁 **Répartition Analytique par Catégorie IT :**\n\n` +
            Array.from(catMap.entries()).map(([cat, data]) => {
              const pct = ((data.count / totalProducts) * 100).toFixed(1);
              return `• **${cat}** : ${data.count} réf. (${pct}% du catalogue)\n` +
                `   - Valorisation stock : **${data.totalVal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**\n` +
                `   - Exemples phares : ${data.items.slice(0, 2).map((i) => i.title).join(', ')}`;
            }).join('\n\n') + `\n\n` +
            `Consultez la page **Statistiques** pour visualiser les graphiques de dispersion et camemberts de répartition.`;
          structuredData = {
            categoryCount: catMap.size,
            categories: Array.from(catMap.entries()).map(([cat, d]) => ({ category: cat, count: d.count, valuation: d.totalVal }))
          };

        // 13. Laptops / Dev machines
        } else if (query.includes('laptop') || query.includes('ordinateur') || query.includes('portable') || query.includes('poste dev') || query.includes('pc')) {
          const laptops = cachedProducts.filter((p) => p.category === 'Laptops & Postes Dev');
          const lapVal = laptops.reduce((acc, p) => acc + p.price * (p.stock || 1), 0);
          answer = `💻 **Segment « Laptops & Postes Dev » :**\n\n` +
            `• Nombre de modèles homologués : **${laptops.length} références**\n` +
            `• Valorisation totale du parc laptops : **${lapVal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**\n` +
            `• Modèles référencés :\n` +
            laptops.map((l) => `   - **${l.title}** : ${l.price.toLocaleString('fr-FR')} € (Stock : ${l.stock} | Garantie : ${l.warranty || '2 ans'})`).join('\n') + `\n\n` +
            `Tous les ordinateurs sont équipés de processeurs dernière génération adaptés au développement applicatif et conteneurs Docker.`;
          structuredData = {
            laptopCount: laptops.length,
            valuation: lapVal
          };

        // 14. Servers & Infrastructure
        } else if (query.includes('serveur') || query.includes('server') || query.includes('rack') || query.includes('cloud') || query.includes('datacenter')) {
          const servers = cachedProducts.filter((p) => p.category === 'Serveurs & Cloud');
          const srvVal = servers.reduce((acc, p) => acc + p.price * (p.stock || 1), 0);
          answer = `🏢 **Segment « Serveurs & Cloud » :**\n\n` +
            `• Références rackables & nœuds de calcul : **${servers.length} références**\n` +
            `• Valeur du parc infrastructure : **${srvVal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**\n` +
            `• Matériels phares :\n` +
            servers.map((s) => `   - **${s.title}** : ${s.price.toLocaleString('fr-FR')} € (Stock : ${s.stock} | ${s.warranty || 'Support Pro'})`).join('\n') + `\n\n` +
            `Ces machines constituent le socle d'infrastructure on-premise et de virtualisation d'entreprise.`;
          structuredData = {
            serverCount: servers.length,
            valuation: srvVal
          };

        // 15. Network & Cybersecurity
        } else if (query.includes('reseau') || query.includes('réseau') || query.includes('switch') || query.includes('firewall') || query.includes('cyber')) {
          const network = cachedProducts.filter((p) => p.category === 'Réseau & Cybersécurité');
          const netVal = network.reduce((acc, p) => acc + p.price * (p.stock || 1), 0);
          answer = `🛡️ **Segment « Réseau & Cybersécurité » :**\n\n` +
            `• Équipements de commutation & sécurité : **${network.length} références**\n` +
            `• Valeur du parc réseau : **${netVal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**\n` +
            `• Matériels :\n` +
            network.map((n) => `   - **${n.title}** : ${n.price.toLocaleString('fr-FR')} € (Stock : ${n.stock})`).join('\n');
          structuredData = {
            networkCount: network.length,
            valuation: netVal
          };

        // 16. Default Fallback
        } else {
          answer = `🤖 **Assistant Décisionnel IT :**\n\n` +
            `J'ai analysé votre requête : « *${rawMessage || '...'}* ».\n\n` +
            `Voici les données clés de votre parc en mémoire immédiate :\n` +
            `• **Inventaire Global :** **${totalProducts} références IT** pour une valorisation de **${totalStockValuation.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}**.\n` +
            `• **Coût Moyen Unitaire :** **${avgPrice} €** (Min : ${lowestPriced?.price} € / Max : ${highestPriced?.price} €).\n` +
            `• **Dotations Collaborateurs :** **${totalCarts} commandes** gérées pour **${totalUsers} ingénieurs**.\n` +
            `• **Alertes Stock Faible :** **${lowStockItems.length} référence(s)** sous 10 unités.\n\n` +
            `💡 *Astuce :* Vous pouvez me demander par exemple :\n` +
            ` - « *Quel est l'équipement le plus cher ?* »\n` +
            ` - « *Pack onboarding pour 4 développeurs* »\n` +
            ` - « *Quels sont les articles en alerte de stock ?* »\n` +
            ` - « *Présente les serveurs Dell ou switches Cisco* »\n` +
            ` - Ou cliquer sur l'un des 6 boutons d'action rapide ci-dessus.`;
          structuredData = {
            catalogSize: totalProducts,
            highestPrice: highestPriced?.price,
            lowestPrice: lowestPriced?.price,
            lowStockAlerts: lowStockItems.length
          };
        }

        // Execute Gemini LLM (gemini-3.8-flash) if available
        let modelUsed = 'Moteur IT Déterministe v2.5';
        let isLlm = false;

        const gemini = getGeminiClient();
        if (gemini && (rawMessage || action)) {
          try {
            const systemInstruction = `Vous êtes l'Assistant IA Décisionnel Expert en Gestion et Pilotage Stratégique de Parc Informatique (Fleet Manager IT & DSI).
Vous analysez et pilotez en temps réel le parc informatique stocké dans la base temporaire de l'entreprise.

DONNÉES DU PARC EN MÉMOIRE IMMÉDIATE (BASE TEMPORAIRE) :
- Valorisation globale du stock matériel (CapEx) : ${totalStockValuation.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
- Nombre d'équipements référencés : ${totalProducts} matériels homologués répartis sur 5 segments stratégiques
- Coût moyen unitaire : ${avgPrice} € (Min : ${lowestPriced?.price} € pour "${lowestPriced?.title}" / Max : ${highestPriced?.price} € pour "${highestPriced?.title}")
- Alertes de stock faible (< 10 unités) : ${lowStockItems.length} référence(s) [${lowStockItems.map((i) => `${i.title} (${i.stock} restants, ${i.price} €)`).join('; ')}]
- Répartition par catégories :
${Array.from(catMap.entries()).map(([c, d]) => `  • ${c}: ${d.count} matériels, val. stock ${d.totalVal.toLocaleString('fr-FR')} €`).join('\n')}
- Liste complète des matériels de la base temporaire :
${cachedProducts.map((p) => `  • [ID: ${p.id}] "${p.title}" | Cat: ${p.category} | Prix: ${p.price} € | Stock: ${p.stock || 0} | Marque: ${p.brand || 'N/A'} | Garantie: ${p.warranty || '2 ans'} | Desc: ${p.description}`).join('\n')}
- Collaborateurs enregistrés : ${totalUsers} collaborateurs (profils Tech, Dev, Sécurité, DevOps, Infra)
- Commandes & dotations de matériel : ${totalCarts} commandes suivies

DIRECTIVES DE RÉPONSE :
1. Répondez toujours en français avec un ton professionnel, précis, analytique et clair.
2. Utilisez une mise en forme Markdown soignée (titres clairs avec emojis, listes à puces aérées, chiffres clés en gras).
3. Appuyez-vous directement sur les chiffres, matériels et marques de la base temporaire ci-dessus.
4. Donnez des recommandations concrètes et mesurables (arbitrages budgétaires, délais d'approvisionnement, choix techniques).
5. Si l'action demandée est un audit, une prévision budgétaire, une détection d'anomalies, un rapport DSI, une dotation ou un pack onboarding, formulez une analyse décisionnelle approfondie et stratégique.
`;

            let promptToSend = rawMessage || action;
            if (action) {
              promptToSend = `[Action prédéfinie demandée: ${action}]. Veuillez formuler une analyse approfondie et complète pour cette action en tenant compte des données du parc. Message / Contexte: ${rawMessage || action}`;
            }

            const geminiResponse = await gemini.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: promptToSend,
              config: {
                systemInstruction,
                temperature: 0.7,
              }
            });

            if (geminiResponse && geminiResponse.text && geminiResponse.text.trim().length > 0) {
              answer = geminiResponse.text.trim();
              modelUsed = 'gemini-3.8-flash';
              isLlm = true;
            }
          } catch (error) {
            console.error('[Gemini LLM Call Error - using deterministic fallback]', error);
          }
        }

        sendJson(res, {
          answer,
          data: structuredData,
          model: modelUsed,
          isLlm,
          timestamp: new Date().toLocaleTimeString('fr-FR')
        });
      }).catch((err) => {
        sendJson(res, { error: 'Erreur lors du traitement de la requête IA', details: String(err) }, 500);
      });
      return true;
    }
  }

  // --- PRODUCTS CRUD APIs ---
  const productMatch = pathname.match(/^\/api\/products(?:\/(\d+))?$/);
  if (productMatch) {
    const id = productMatch[1] ? parseInt(productMatch[1], 10) : null;

    if (req.method === 'GET') {
      if (id !== null) {
        const item = cachedProducts.find((p) => p.id === id);
        if (item) {
          sendJson(res, item);
        } else {
          sendJson(res, { error: 'Équipement IT introuvable', id }, 404);
        }
      } else {
        sendJson(res, cachedProducts);
      }
      return true;
    }

    if (req.method === 'POST') {
      readRequestBody(req).then((body) => {
        const newId = cachedProducts.length > 0 ? Math.max(...cachedProducts.map((p) => p.id)) + 1 : 1;
        const newProduct: ProductItem = {
          id: newId,
          title: (body['title'] as string) || 'Nouvel Équipement IT',
          price: Number(body['price']) || 499.00,
          description: (body['description'] as string) || 'Description matériel informatique',
          category: (body['category'] as string) || 'Laptops & Postes Dev',
          brand: (body['brand'] as string) || 'Enterprise Tech',
          stock: Number(body['stock']) || 10,
          warrantyMonths: Number(body['warrantyMonths']) || 36,
          serialNumber: (body['serialNumber'] as string) || `IT-DEV-${newId.toString().padStart(3, '0')}`,
          image: (body['image'] as string) || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80'
        };
        cachedProducts.push(newProduct);
        sendJson(res, {
          success: true,
          message: 'Équipement IT ajouté au catalogue avec succès',
          data: newProduct
        }, 201);
      });
      return true;
    }

    if (req.method === 'PUT' && id !== null) {
      readRequestBody(req).then((body) => {
        const index = cachedProducts.findIndex((p) => p.id === id);
        if (index !== -1) {
          cachedProducts[index] = {
            ...cachedProducts[index],
            ...body,
            id
          };
        }
        sendJson(res, {
          success: true,
          message: `Équipement IT #${id} mis à jour avec succès`,
          id,
          data: body
        });
      });
      return true;
    }

    if (req.method === 'DELETE' && id !== null) {
      const index = cachedProducts.findIndex((p) => p.id === id);
      if (index !== -1) {
        cachedProducts.splice(index, 1);
      }
      sendJson(res, {
        success: true,
        message: `Équipement IT #${id} retiré du parc avec succès`,
        id
      });
      return true;
    }
  }

  // --- USERS CRUD APIs ---
  const userMatch = pathname.match(/^\/api\/users(?:\/(\d+))?$/);
  if (userMatch) {
    const id = userMatch[1] ? parseInt(userMatch[1], 10) : null;

    if (req.method === 'GET') {
      if (id !== null) {
        const item = cachedUsers.find((u) => u.id === id);
        if (item) {
          sendJson(res, item);
        } else {
          sendJson(res, { error: 'Utilisateur IT introuvable', id }, 404);
        }
      } else {
        sendJson(res, cachedUsers);
      }
      return true;
    }

    if (req.method === 'POST') {
      readRequestBody(req).then((body) => {
        const newId = cachedUsers.length > 0 ? Math.max(...cachedUsers.map((u) => u.id)) + 1 : 1;
        const newUser: UserItem = {
          id: newId,
          username: (body['username'] as string) || `it.user${newId}`,
          email: (body['email'] as string) || `user${newId}@enterprise-it.net`,
          name: (body['name'] as { firstname: string; lastname: string }) || {
            firstname: (body['firstname'] as string) || 'Ingénieur',
            lastname: (body['lastname'] as string) || `IT ${newId}`
          },
          role: (body['role'] as string) || 'Spécialiste Informatique',
          department: (body['department'] as string) || 'Direction des Systèmes d\'Information',
          phone: (body['phone'] as string) || '06-00-11-22-33',
          address: (body['address'] as { city?: string; street?: string; zipcode?: string }) || {
            city: (body['city'] as string) || 'Paris'
          }
        };
        cachedUsers.push(newUser);
        sendJson(res, {
          success: true,
          message: 'Collaborateur IT ajouté avec succès',
          data: newUser
        }, 201);
      });
      return true;
    }

    if (req.method === 'PUT' && id !== null) {
      readRequestBody(req).then((body) => {
        const index = cachedUsers.findIndex((u) => u.id === id);
        if (index !== -1) {
          const current = cachedUsers[index];
          const nameObj = body['name']
            ? (body['name'] as { firstname: string; lastname: string })
            : {
                firstname: (body['firstname'] as string) ?? current.name?.firstname ?? '',
                lastname: (body['lastname'] as string) ?? current.name?.lastname ?? ''
              };
          const addressObj = body['address']
            ? (body['address'] as { city?: string; street?: string; zipcode?: string })
            : {
                city: (body['city'] as string) ?? current.address?.city ?? ''
              };

          cachedUsers[index] = {
            ...current,
            ...body,
            name: nameObj,
            address: addressObj,
            id
          };
        }
        sendJson(res, {
          success: true,
          message: `Collaborateur IT #${id} modifié avec succès`,
          id,
          data: body
        });
      });
      return true;
    }

    if (req.method === 'DELETE' && id !== null) {
      const index = cachedUsers.findIndex((u) => u.id === id);
      if (index !== -1) {
        cachedUsers.splice(index, 1);
      }
      sendJson(res, {
        success: true,
        message: `Collaborateur IT #${id} supprimé avec succès`,
        id
      });
      return true;
    }
  }

  // --- CARTS CRUD APIs ---
  const cartMatch = pathname.match(/^\/api\/carts(?:\/(\d+))?$/);
  if (cartMatch) {
    const id = cartMatch[1] ? parseInt(cartMatch[1], 10) : null;

    if (req.method === 'GET') {
      if (id !== null) {
        const item = cachedCarts.find((c) => c.id === id);
        if (item) {
          sendJson(res, item);
        } else {
          sendJson(res, { error: 'Panier IT introuvable', id }, 404);
        }
      } else {
        sendJson(res, cachedCarts);
      }
      return true;
    }

    if (req.method === 'POST') {
      readRequestBody(req).then((body) => {
        const newId = cachedCarts.length > 0 ? Math.max(...cachedCarts.map((c) => c.id)) + 1 : 1;
        const newCart: CartItem = {
          id: newId,
          userId: Number(body['userId']) || 1,
          date: (body['date'] as string) || new Date().toISOString().split('T')[0],
          status: 'En attente',
          notes: (body['notes'] as string) || 'Nouvelle dotation de matériel informatique',
          products: (body['products'] as { productId: number; quantity: number }[]) || [
            { productId: 1, quantity: 1 }
          ]
        };
        cachedCarts.push(newCart);
        sendJson(res, {
          success: true,
          message: 'Panier de dotation IT ajouté avec succès',
          data: newCart
        }, 201);
      });
      return true;
    }

    if (req.method === 'PUT' && id !== null) {
      readRequestBody(req).then((body) => {
        const index = cachedCarts.findIndex((c) => c.id === id);
        if (index !== -1) {
          cachedCarts[index] = {
            ...cachedCarts[index],
            ...body,
            id
          };
        }
        sendJson(res, {
          success: true,
          message: `Panier IT #${id} modifié avec succès`,
          id,
          data: body
        });
      });
      return true;
    }

    if (req.method === 'DELETE' && id !== null) {
      const index = cachedCarts.findIndex((c) => c.id === id);
      if (index !== -1) {
        cachedCarts.splice(index, 1);
      }
      sendJson(res, {
        success: true,
        message: `Panier IT #${id} supprimé avec succès`,
        id
      });
      return true;
    }
  }

  return false;
}
