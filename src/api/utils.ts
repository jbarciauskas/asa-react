export async function fetchAllPlayers(baseUrl: string, initialResponse: any[]): Promise<any[]> {
  if (initialResponse.length < 1000) {
    return initialResponse;
  }

  const allPlayers = [...initialResponse];
  let offset = 1000;

  while (true) {
    const nextPage = await fetch(`${baseUrl}/players?offset=${offset}`).then(res => res.json());
    if (nextPage.length === 0) break;
    allPlayers.push(...nextPage);
    if (nextPage.length < 1000) break;
    offset += 1000;
  }

  return allPlayers;
} 