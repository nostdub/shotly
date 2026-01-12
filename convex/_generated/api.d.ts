/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as debug from "../debug.js";
import type * as generations from "../generations.js";
import type * as http from "../http.js";
import type * as me from "../me.js";
import type * as media from "../media.js";
import type * as myFunctions from "../myFunctions.js";
import type * as profiles from "../profiles.js";
import type * as seedStyles from "../seedStyles.js";
import type * as styles from "../styles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  debug: typeof debug;
  generations: typeof generations;
  http: typeof http;
  me: typeof me;
  media: typeof media;
  myFunctions: typeof myFunctions;
  profiles: typeof profiles;
  seedStyles: typeof seedStyles;
  styles: typeof styles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
