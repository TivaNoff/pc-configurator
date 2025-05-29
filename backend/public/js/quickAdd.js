import {
  setupSearchInput,
  setupCpuFiltersHTML,
  setupGpuFiltersHTML,
  setupMbFiltersHTML,
  setupCaseFiltersHTML,
  setupCoolerFiltersHTML,
  setupRamFiltersHTML, // ← импорт для RAM
  setupStorageFiltersHTML,
  setupPsuFiltersHTML,
  setupMonitorFiltersHTML,
} from "./quickAdd/uiSetup.js";
import { setupListeners } from "./quickAdd/listeners.js"; // ✅ правильно

// Подготовка UI
setupCpuFiltersHTML();
setupGpuFiltersHTML();
setupMbFiltersHTML();
setupCaseFiltersHTML(); // ← вызов новой функции
setupCoolerFiltersHTML();
setupRamFiltersHTML();
setupStorageFiltersHTML();
setupPsuFiltersHTML();
setupMonitorFiltersHTML();
setupSearchInput();

// Навешиваем события
setupListeners();
