// Shape of the /health response — used by the api to build it and the web to read it.
export type HealthResponse = {
  status: "ok";
  service: string;
  time: string;
};
