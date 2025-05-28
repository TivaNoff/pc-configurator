import { setupSearchInput, setupCpuFiltersHTML } from "./quickAdd/uiSetup.js";
import { setupListeners } from "./quickAdd/listeners.js"; // ✅ правильно

// Подготовка UI
setupCpuFiltersHTML();
setupSearchInput();

// Навешиваем события
setupListeners();
