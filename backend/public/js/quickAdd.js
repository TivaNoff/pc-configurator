import {
  setupSearchInput,
  setupCpuFiltersHTML,
  setupGpuFiltersHTML,
} from "./quickAdd/uiSetup.js";
import { setupListeners } from "./quickAdd/listeners.js"; // ✅ правильно

// Подготовка UI
setupCpuFiltersHTML();
setupGpuFiltersHTML();
setupSearchInput();

// Навешиваем события
setupListeners();
