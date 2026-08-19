import { RiderItem } from '@/lib/types';

export const RIDER_OVERRIDES_KEY = 'urban-spice-rider-overrides';

export function getRiderOverrides(): Record<string, RiderItem | null> {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(localStorage.getItem(RIDER_OVERRIDES_KEY) || '{}');
  } catch {
    return {};
  }
}

export function mergeRiderOverrides(riders: RiderItem[]): RiderItem[] {
  const overrides = getRiderOverrides();
  const serverRiders = riders.filter((rider) => !(rider.id in overrides));
  const overriddenRiders = Object.values(overrides).filter(
    (rider): rider is RiderItem => rider !== null && rider.active !== false
  );

  return [...serverRiders, ...overriddenRiders].sort((first, second) =>
    first.name.localeCompare(second.name)
  );
}

export function saveRiderOverride(id: string, rider: RiderItem | null) {
  const overrides = getRiderOverrides();
  overrides[id] = rider;
  localStorage.setItem(RIDER_OVERRIDES_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event('riders-updated'));
}