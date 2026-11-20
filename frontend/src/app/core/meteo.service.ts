import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { REGIONS, Region } from './models';

export const COORDONNEES: Record<Region, { lat: number; lon: number }> = {
  Sfax: { lat: 34.74, lon: 10.76 },
  Sousse: { lat: 35.83, lon: 10.64 },
  Monastir: { lat: 35.78, lon: 10.83 },
  Mahdia: { lat: 35.5, lon: 11.06 },
  Kairouan: { lat: 35.68, lon: 10.1 },
};

export interface JourMeteo {
  date: string;
  code: number;
  tMax: number;
  tMin: number;
  pluieMm: number;
  probaPluie: number;
  ventMax: number;
}

export interface Meteo {
  region: Region;
  maintenant: { temperature: number; humidite: number; vent: number; code: number };
  jours: JourMeteo[];
}

export interface Conseil {
  ton: 'info' | 'ok' | 'warn' | 'danger';
  icone: string;
  titre: string;
  texte: string;
}

interface ReponseOpenMeteo {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: (number | null)[];
    wind_speed_10m_max: number[];
  };
}

const URL_METEO = 'https://api.open-meteo.com/v1/forecast';
const DUREE_CACHE_MS = 30 * 60 * 1000;

/** Traduit le code météo WMO renvoyé par Open-Meteo en libellé et en icône. */
export function decrireTemps(code: number): { libelle: string; icone: string } {
  if (code === 0) return { libelle: 'Ensoleillé', icone: 'soleil' };
  if (code <= 2) return { libelle: 'Éclaircies', icone: 'eclaircie' };
  if (code === 3) return { libelle: 'Couvert', icone: 'nuage' };
  if (code === 45 || code === 48) return { libelle: 'Brouillard', icone: 'brouillard' };
  if (code >= 95) return { libelle: 'Orage', icone: 'orage' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return { libelle: 'Neige', icone: 'flocon' };
  if (code >= 51 && code <= 57) return { libelle: 'Bruine', icone: 'pluie' };
  return { libelle: 'Pluie', icone: 'pluie' };
}

export function regionValide(region: string | null | undefined): Region {
  return (REGIONS as readonly string[]).includes(region ?? '') ? (region as Region) : 'Sfax';
}

function versDate(iso: string): Date {
  const [a, m, j] = iso.split('-').map(Number);
  return new Date(a, m - 1, j);
}

export function nomDuJour(iso: string, index: number): string {
  if (index === 0) return 'Aujourd’hui';
  if (index === 1) return 'Demain';
  const nom = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(versDate(iso));
  return nom.charAt(0).toUpperCase() + nom.slice(1);
}

/** Jour favorable à la récolte : sec (moins de 1 mm, pluie peu probable) et peu de vent. */
export function estFavorable(j: JourMeteo): boolean {
  return j.pluieMm < 1 && j.probaPluie < 40 && j.ventMax < 30;
}

/** Conseils agricoles déduits des prévisions : gel, pluie, vent fort, chaleur et jours favorables. */
export function conseils(m: Meteo): Conseil[] {
  const liste: Conseil[] = [];
  const jours = m.jours;
  const nom = (i: number) => nomDuJour(jours[i].date, i).toLowerCase();

  const gel = jours.findIndex((j) => j.tMin <= 2);
  if (gel >= 0) {
    liste.push({
      ton: 'danger',
      icone: 'flocon',
      titre: `Risque de gel ${nom(gel)}`,
      texte: `Minimum prévu : ${Math.round(jours[gel].tMin)} °C. Protégez les jeunes plants et reportez la taille.`,
    });
  }

  const pluie = jours.slice(0, 3).findIndex((j) => j.pluieMm >= 5 || j.probaPluie >= 70);
  if (pluie >= 0) {
    liste.push({
      ton: 'warn',
      icone: 'pluie',
      titre: `Pluie prévue ${nom(pluie)}`,
      texte:
        'Évitez de récolter et de traiter ce jour-là : les olives mouillées se conservent mal et le traitement serait lessivé.',
    });
  }

  const vent = jours.slice(0, 3).findIndex((j) => j.ventMax >= 40);
  if (vent >= 0) {
    liste.push({
      ton: 'warn',
      icone: 'vent',
      titre: `Vent fort ${nom(vent)}`,
      texte: `Rafales jusqu’à ${Math.round(jours[vent].ventMax)} km/h : ne pulvérisez pas de traitement ce jour-là.`,
    });
  }

  const chaleur = jours.findIndex((j) => j.tMax >= 35);
  if (chaleur >= 0) {
    liste.push({
      ton: 'warn',
      icone: 'thermometre',
      titre: `Forte chaleur ${nom(chaleur)}`,
      texte: `Jusqu’à ${Math.round(jours[chaleur].tMax)} °C : arrosez tôt le matin ou en fin de journée.`,
    });
  }

  const favorables = jours
    .map((j, i) => (estFavorable(j) ? nom(i) : null))
    .filter((x): x is string => x !== null);
  if (favorables.length) {
    liste.push({
      ton: 'ok',
      icone: 'succes',
      titre: 'Jours favorables à la récolte',
      texte: `Temps sec et peu de vent : ${favorables.join(', ')}.`,
    });
  } else {
    liste.push({
      ton: 'info',
      icone: 'info',
      titre: 'Pas de journée idéale cette semaine',
      texte:
        'Pluie ou vent sont prévus chaque jour : surveillez les prévisions avant d’organiser la cueillette.',
    });
  }
  return liste;
}

@Injectable({ providedIn: 'root' })
/** Appelle l’API publique Open-Meteo (sans clé) et garde chaque réponse 30 minutes en cache. */
export class MeteoService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<Region, { meteo: Meteo; heure: number }>();

  charger(region: Region): Observable<Meteo> {
    const enCache = this.cache.get(region);
    if (enCache && Date.now() - enCache.heure < DUREE_CACHE_MS) return of(enCache.meteo);

    const { lat, lon } = COORDONNEES[region];
    const params = {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
      daily:
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      timezone: 'Africa/Tunis',
      forecast_days: 7,
    };

    return this.http.get<ReponseOpenMeteo>(URL_METEO, { params }).pipe(
      map((r) => ({
        region,
        maintenant: {
          temperature: r.current.temperature_2m,
          humidite: r.current.relative_humidity_2m,
          vent: r.current.wind_speed_10m,
          code: r.current.weather_code,
        },
        jours: r.daily.time.map((date, i) => ({
          date,
          code: r.daily.weather_code[i],
          tMax: r.daily.temperature_2m_max[i],
          tMin: r.daily.temperature_2m_min[i],
          pluieMm: r.daily.precipitation_sum[i] ?? 0,
          probaPluie: r.daily.precipitation_probability_max[i] ?? 0,
          ventMax: r.daily.wind_speed_10m_max[i],
        })),
      })),
      tap((meteo) => this.cache.set(region, { meteo, heure: Date.now() })),
    );
  }
}
