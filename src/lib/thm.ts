export type ThmStats = {
  rank: number | null;
  points: number | null;
};

const THM_USERNAME = 'asmitdesai02';

/**
 * Fetches public TryHackMe rank/points. THM's public endpoints are unauthenticated
 * but occasionally change shape or rate-limit, so this fails soft — returning nulls
 * rather than throwing, so /about always renders.
 */
export async function getThmStats(): Promise<ThmStats> {
  try {
    const res = await fetch(
      `https://tryhackme.com/api/user/rank/${THM_USERNAME}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return { rank: null, points: null };

    const data = (await res.json()) as { userRank?: number; points?: number | string };
    const points =
      typeof data.points === 'string' ? Number(data.points) : data.points ?? null;

    return {
      rank: data.userRank ?? null,
      points: Number.isFinite(points) ? (points as number) : null,
    };
  } catch {
    return { rank: null, points: null };
  }
}

export { THM_USERNAME };
