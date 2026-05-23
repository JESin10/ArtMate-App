export interface Place {
  seq: string;

  title: string;

  place?: string;

  area?: string;
  sigungu?: string;

  gpsX?: string;
  gpsY?: string;

  startDate?: string;
  endDate?: string;

  thumbnail?: string;
}

export interface DetailPlace {
  seq: string;

  title: string;

  addr1?: string;
  addr2?: string;

  zipcode?: string;

  tel?: string;

  homepage?: string;

  overview?: string;

  firstimage?: string;
  firstimage2?: string;
}
