/**
 * Augment Vitest's ProvidedContext so that `provide`/`inject` are typed for
 * our TEST_DATABASE_URL key.
 */
import "vitest";

declare module "vitest" {
  export interface ProvidedContext {
    TEST_DATABASE_URL: string;
  }
}
