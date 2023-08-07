export interface Dashboard {
  userEntityId: number;
  userFirstName: number;
  userLastName: string;
  progTitle: string;
  prapStatus: string;
  prapModifiedDate: Date;
  latestProgress: string;
}

export function mapDashboard(resultsQuery: any[]): Dashboard[] {
  const mapped: Dashboard[] = resultsQuery.map((result) => {
    const dashboard: Dashboard = {
      userEntityId: result.userEntityId || 0,
      userFirstName: result.userFirstName || 'null',
      userLastName: result.userLastName || 'null',
      progTitle: result.progTitle || 'null',
      prapStatus: result.prapStatus || 'null',
      prapModifiedDate: result.prapModifiedDate || null,
      latestProgress: result.latestProgress || 'null',
    };

    return dashboard;
  });

  return mapped;
}
