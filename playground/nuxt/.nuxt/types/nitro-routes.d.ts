// Generated by nitro
import type { Serialize, Simplify } from "nitropack/types";
declare module "nitropack/types" {
  type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
  interface InternalApi {
    '/__nuxt_error': {
      'default': Simplify<Serialize<Awaited<ReturnType<typeof import('../../../../node_modules/.pnpm/nuxt@3.14.159_@parcel+watcher@2.5.0_@types+node@20.14.10_eslint@8.48.0_ioredis@5.4.1_less@4.2_ifr4wlohtfmdsjepffr3ywcicu/node_modules/nuxt/dist/core/runtime/nitro/renderer').default>>>>
    }
  }
}
export {}