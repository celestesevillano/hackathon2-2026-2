// --- ENUMS & UNION TYPES ---

export type WantedStatus = 'AT_LARGE' | 'CAPTURED' | 'MISSING';

export type FruitType = 'PARAMECIA' | 'ZOAN' | 'LOGIA';

export type FruitFilter = 'PARAMECIA' | 'ZOAN' | 'LOGIA' | 'NONE';

export type CrewRole =
  | 'CAPTAIN'
  | 'FIRST_MATE'
  | 'NAVIGATOR'
  | 'SNIPER'
  | 'COOK'
  | 'DOCTOR'
  | 'SHIPWRIGHT'
  | 'MUSICIAN'
  | 'ARCHAEOLOGIST'
  | 'HELMSMAN'
  | 'FIGHTER';

export type NewsType =
  | 'BOUNTY_UPDATE'
  | 'BATTLE'
  | 'MARINE_OPERATION'
  | 'WORLD_GOVERNMENT'
  | 'DISCOVERY';

export type NewsPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type NewsStatus = 'RUMOR' | 'CONFIRMED' | 'DEBUNKED';

export type LogPoseStatus = 'LOCKED' | 'UNLOCKED';

export type WantedSort = 'bounty,desc' | 'name,asc' | 'updatedAt,desc';

// --- AUTH & TEAM ---

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Team {
  code: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  teamName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: 'Bearer';
  expiresAt: string;
  user: User;
  team: Team;
}

export interface MeResponse {
  user: User;
  team: Team;
  expiresAt: string;
}

// --- CREWS ---

export interface CrewRef {
  id: string;
  name: string;
}

export interface Crew {
  id: string;
  name: string;
  shipName: string;
  jollyRogerColor: string;
  memberCount: number;
  totalBounty: number;
}

// --- WANTED ---

export interface DevilFruit {
  name: string;
  type: FruitType;
}

export interface WantedSummary {
  id: string;
  name: string;
  epithet: string;
  bounty: number;
  status: WantedStatus;
  crew: CrewRef;
  role: CrewRole;
  devilFruit: DevilFruit | null;
  threatLevel: number;
  lastSeenIsland: string;
  updatedAt: string;
}

export interface BountyHistoryItem {
  amount: number;
  issuedAt: string;
}

export interface LastSeen {
  island: string;
  seenAt: string;
}

export interface WantedDetail extends WantedSummary {
  age: number;
  heightCm: number;
  bio: string;
  lastSeen: LastSeen;
  bountyHistory: BountyHistoryItem[];
}

export interface WantedPage {
  content: WantedSummary[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface WantedQueryParams {
  page?: number;
  size?: number;
  status?: WantedStatus;
  crewId?: string;
  fruit?: FruitFilter;
  q?: string;
  sort?: WantedSort;
}

// --- DASHBOARD & LOG POSE ---

export interface DashboardWantedStats {
  total: number;
  totalBounty: number;
  averageBounty: number;
  byStatus: Record<WantedStatus, number>;
  byFruit: Record<FruitFilter, number>;
}

export interface DashboardCrewsStats {
  total: number;
  mostWanted: Crew | null;
}

export interface DashboardSummary {
  team: Team;
  wanted: DashboardWantedStats;
  crews: DashboardCrewsStats;
  topBounties: WantedSummary[];
  generatedAt: string;
}

export interface LogPose {
  status: LogPoseStatus;
  grandLineUnlocked: boolean;
  unlockedAt: string | null;
  message: string;
}

// --- NEWS (GRAND LINE) ---

export interface NewsRelatedWanted {
  id: string;
  name: string;
}

export interface NewsItem {
  id: string;
  type: NewsType;
  priority: NewsPriority;
  status: NewsStatus;
  title: string;
  summary: string;
  source: string;
  island: string;
  relatedWanted: NewsRelatedWanted | null;
  publishedAt: string;
  updatedAt: string;
  verifiedAt: string | null;
}

export interface NewsDetail extends NewsItem {
  body: string[];
}

export interface NewsFeed {
  items: NewsItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface NewsFeedParams {
  cursor?: string;
  limit?: number;
  type?: NewsType;
  priority?: NewsPriority;
  status?: NewsStatus;
}

export interface NewsStatusUpdate {
  status: 'CONFIRMED' | 'DEBUNKED';
}

// --- SAGAS (GRAND LINE) ---

export interface Palette {
  background: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
}

export interface SagaSummary {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  synopsis: string;
  stageCount: number;
  totalDistanceNm: number;
  firstIsland: string;
  lastIsland: string;
  palette: Palette;
}

export interface StageMetric {
  key: string;
  label: string;
  value: number;
  unit: string;
}

export interface StageIsland {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface SagaStage {
  id: string;
  order: number;
  slug: string;
  title: string;
  narrative: string[];
  island: StageIsland;
  palette: Palette;
  metrics: StageMetric[];
}

export interface SagaStoryMap {
  width: number;
  height: number;
}

export interface SagaStorySaga {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  synopsis: string;
  stageCount: number;
  totalDistanceNm: number;
  firstIsland: string;
  lastIsland: string;
  palette: Palette;
  intro: string;
}

export interface SagaStory {
  saga: SagaStorySaga;
  map: SagaStoryMap;
  stages: SagaStage[];
}

// --- ERROR FORMAT ---

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  traceId: string;
  details?: ApiValidationErrorDetail[];
  retryAfterSeconds?: number;
  current?: NewsDetail;
}
