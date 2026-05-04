// Stub - Google Sheets integration disabled in self-hosted deployment
// Leads are stored in MySQL database and viewable via Railway dashboard

export async function appendLeadToSheet(_lead: any): Promise<void> {
  // No-op in self-hosted version
  return;
}

export async function appendLeadScoreUpdate(_id: number, _score: number, _recommendation: string): Promise<void> {
  return;
}

export async function appendMetricToSheet(_event: any): Promise<void> {
  return;
}
