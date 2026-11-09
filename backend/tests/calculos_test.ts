// Testes base: só funções puras, sem banco nem rede.
import { assert, assertEquals } from "https://deno.land/std/assert/mod.ts";
import {
  calcularGMD,
  getGMDStatus,
  getDiasParaAbate,
} from "../src/services/calculos.ts";

Deno.test("calcularGMD base", () => {
  assertEquals(calcularGMD(280, 340, "2026-01-01", "2026-02-01"), 1.94);
  assertEquals(calcularGMD(280, 340, "2026-01-01", "2026-01-01"), 0);
});

Deno.test("getGMDStatus base", () => {
  assertEquals(getGMDStatus(1.2, 1.0), "ok");
  assertEquals(getGMDStatus(0.8, 1.0), "warn");
  assertEquals(getGMDStatus(0.5, 1.0), "crit");
});

Deno.test("getDiasParaAbate base", () => {
  assertEquals(getDiasParaAbate(460, 1.0, 480), 20);
  assertEquals(getDiasParaAbate(480, 1.0, 480), 0);
  assertEquals(getDiasParaAbate(460, 0, 480), null);
  assert(true);
});
