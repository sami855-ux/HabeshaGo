import type { Express } from "express";
import { services, type ServiceRoute } from "../config/services";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { userRateLimit, strictAuthRateLimit } from "../middleware/rate-limit";
import { identityHeaders } from "../middleware/identity-headers";
import { createServiceProxy } from "./create-proxy";

type ServiceProxy = ReturnType<typeof createServiceProxy>["proxy"];

export interface WsRoute {
  route: ServiceRoute;
  proxy: ServiceProxy;
}

export const wsRoutes: WsRoute[] = [];

export function registerRoutes(app: Express) {
  for (const route of services) {
    const { guard, proxy } = createServiceProxy(route);

    const chain = [
      route.name === "auth" ? strictAuthRateLimit : (_req: any, _res: any, next: any) => next(),
      authenticate(route),
      authorize(route),
      userRateLimit,
      identityHeaders,
      guard,
      proxy,
    ];

    app.use(route.prefix, ...chain);

    if (route.websocket) wsRoutes.push({ route, proxy });
  }
}
