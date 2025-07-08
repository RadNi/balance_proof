'use server';

import { UltraHonkBackend } from "@aztec/bb.js";
import circuit from "../target/circuit.json";

export async function createUltraHonkBackend() {
  try {
    const backend = new UltraHonkBackend(circuit.bytecode, {}, { recursive: true });
    console.log("UltraHonkBackend created:", backend);
    return { success: true, message: "UltraHonkBackend created successfully" };
  } catch (error) {
    console.error("Error creating UltraHonkBackend:", error);
    return { 
      success: false, 
      message: "Failed to create UltraHonkBackend", 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}
