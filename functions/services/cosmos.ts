// Compatibility shim — re-export the Azure SQL implementations so existing imports
// that reference `services/cosmos` continue to work while the codebase migrates.
export * from "./sql";
