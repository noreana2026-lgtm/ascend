import { createClient } from '@supabase/supabase-js';

// URL y clave pública (anon). Son públicas por diseño; la seguridad va por RLS.
const SUPABASE_URL = 'https://gegsauzfwvfhzsemtszn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_buJTOsgFc-y3hKYnqgxWkg_oO8qiuvr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Devuelve los jugadores con el MISMO formato que usa la app:
// { eq, n, temp, part, pt, reb, ast, stl, blk, va, pos, liga, grupo }
export async function fetchPlayers() {
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('ascend_players')
      .select('*')
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows.map((r) => ({
    eq: r.equipo, n: r.jugador, temp: r.temporada, part: r.partidos,
    pt: Number(r.puntos), reb: Number(r.rebotes), ast: Number(r.asistencias),
    stl: Number(r.robos), blk: Number(r.tapones), va: Number(r.valoracion),
    pos: r.posiciones, liga: r.liga, grupo: r.grupo,
  }));
}
