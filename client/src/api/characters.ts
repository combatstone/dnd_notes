// client/src/api/characters.ts
import { type Character, type InsertCharacter } from "@shared/schema";

export const getCharacters = async (campaignId: string): Promise<Character[]> => {
  const response = await fetch(`/api/characters/${campaignId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch characters');
  }

  return response.json();
};

export const createCharacter = async (characterData: InsertCharacter): Promise<Character> => {
  const response = await fetch('/api/characters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(characterData),
  });

  if (!response.ok) {
    throw new Error('Failed to create character');
  }

  return response.json();
};

export const deleteCharacter = async (characterId: string): Promise<void> => {
  const response = await fetch(`/api/characters/${characterId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete character');
  }
};

export const updateCharacter = async (
  characterId: string, 
  characterData: Partial<InsertCharacter>
): Promise<Character> => {
  const response = await fetch(`/api/characters/${characterId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(characterData),
  });

  if (!response.ok) {
    throw new Error('Failed to update character');
  }

  return response.json();
};