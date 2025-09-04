// client/src/pages/characters.tsx
import { useState } from "react";
import CharacterCard from "@/components/character/character-card";
import AddCharacterForm from "@/components/character/add-character-form";
import EditCharacterForm from "@/components/character/edit-character-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCharacters, createCharacter, deleteCharacter, updateCharacter } from "@/api/characters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { type Character, type InsertCharacter } from "@shared/schema";

export default function Characters() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const campaignId = "campaign-1";

  const { data: characters, isLoading, isError } = useQuery({
    queryKey: ["characters", campaignId],
    queryFn: () => getCharacters(campaignId),
  });

  const createMutation = useMutation({
    mutationFn: createCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters", campaignId] });
      toast({ title: "Success", description: "Character added." });
      setIsAddModalOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add character.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters", campaignId] });
      toast({ title: "Success", description: "Character deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete character.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<InsertCharacter> }) => updateCharacter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters", campaignId] });
      toast({ title: "Success", description: "Character updated." });
      setIsEditModalOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update character.", variant: "destructive" });
    },
  });

  const handleAddFormSubmit = (data: Omit<InsertCharacter, 'campaignId'>) => {
    createMutation.mutate({ ...data, campaignId });
  };
  
  const handleDeleteCharacter = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setIsEditModalOpen(true);
  };

  const handleEditFormSubmit = (data: Partial<InsertCharacter>) => {
    if (selectedCharacter) {
      updateMutation.mutate({ id: selectedCharacter.id, data });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      );
    }
  
    if (isError) {
      return <div className="p-4 text-red-500">Error fetching characters.</div>;
    }
  
    if (!characters || characters.length === 0) {
      return <div className="p-4 text-center text-gray-500">No characters found for this campaign yet.</div>;
    }
  
    return (
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <CharacterCard 
            key={character.id} 
            character={character} 
            onDelete={handleDeleteCharacter}
            onEdit={handleEditCharacter}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold">Characters</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Character</Button>
      </div>
      
      {renderContent()}

      <AddCharacterForm 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddFormSubmit}
        isSubmitting={createMutation.isPending}
      />

      <EditCharacterForm
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditFormSubmit}
        isSubmitting={updateMutation.isPending}
        character={selectedCharacter}
      />
    </div>
  );
}