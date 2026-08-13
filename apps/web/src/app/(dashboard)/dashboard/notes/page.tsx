"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  Plus, Search, FileText, Trash2, Edit2, Sparkles, Loader2,
  Save, ArrowLeft, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Note {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  summary?: string;
  updatedAt: string;
}

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");
  
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Fetch Notes
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["notes", search],
    queryFn: async () => {
      const qs = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await apiClient.get<any>(`/api/notes${qs}`);
      const items = res?.data ?? res;
      return Array.isArray(items) ? items : [];
    } });

  // Create Note Mutation
  const createMutation = useMutation({
    mutationFn: async (note: { title: string; content: string; tags: string[] }) => {
      const res = await apiClient.post<any>("/api/notes", note);
      return res.data || res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      const newNote = data.data || data;
      setSelectedNote(newNote);
      setIsEditing(true);
      setEditTitle(newNote.title);
      setEditContent(newNote.content);
      setEditTags(newNote.tags?.join(", ") || "");
    } });

  // Update Note Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: Partial<Note> }) => {
      const res = await apiClient.patch<any>(`/api/notes/${id}`, note);
      return res.data || res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      const updated = data.data || data;
      setSelectedNote(updated);
      setIsEditing(false);
    } });

  // Delete Note Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNote(null);
      setIsEditing(false);
    } });

  const handleCreateNote = () => {
    createMutation.mutate({
      title: "Untitled Note",
      content: "",
      tags: [] });
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags?.join(", ") || "");
  };

  const handleSave = () => {
    if (!selectedNote) return;
    const id = selectedNote._id || selectedNote.id || "";
    const tagsArr = editTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    updateMutation.mutate({
      id,
      note: {
        title: editTitle || "Untitled Note",
        content: editContent,
        tags: tagsArr } });
  };

  const handleSummarize = async () => {
    if (!selectedNote) return;
    const id = selectedNote._id || selectedNote.id || "";
    setIsSummarizing(true);
    try {
      const res = await apiClient.post<any>("/api/ai/notes/summarize", {
        title: selectedNote.title,
        content: selectedNote.content });
      const summaryText = res.data || res;
      updateMutation.mutate({
        id,
        note: {
          summary: summaryText } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    if (confirm("Are you sure you want to delete this note?")) {
      deleteMutation.mutate(selectedNote._id || selectedNote.id || "");
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-7xl mx-auto gap-6">
      {/* Sidebar List */}
      <div className={cn(
        "flex flex-col w-full md:w-80 shrink-0 border-r pr-2 h-full transition-all",
        selectedNote && "hidden md:flex"
      )}>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Notes
            </h1>
            <p className="text-muted-foreground text-xs">Your smart digital second brain</p>
          </div>
          <Button onClick={handleCreateNote} size="icon" className="h-9 w-9 rounded-xl shadow-md">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-0 shadow-sm ring-1 ring-black/10 dark:ring-white/10 bg-card/50 backdrop-blur-xl"
          />
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
          ) : notes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No notes found</p>
            </div>
          ) : (
            notes.map((note) => {
              const noteId = note._id || note.id;
              const isSelected = selectedNote && (selectedNote._id === noteId || selectedNote.id === noteId);
              return (
                <button
                  key={noteId}
                  onClick={() => handleSelectNote(note)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all border border-transparent",
                    isSelected
                      ? "bg-primary/10 border-primary/20 text-foreground"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <p className="font-semibold text-sm line-clamp-1 text-foreground">{note.title || "Untitled Note"}</p>
                  <p className="text-xs line-clamp-1 mt-1">{note.content || "Empty content"}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] opacity-70">
                      {formatDistanceToNow(new Date(note.updatedAt))} ago
                    </span>
                    {note.summary && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-primary/20 text-primary">
                        AI Summarized
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Editor/View Panel */}
      <div className={cn(
        "flex-1 flex flex-col h-full rounded-2xl border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/50 backdrop-blur-xl overflow-hidden",
        !selectedNote && "hidden md:flex justify-center items-center text-muted-foreground"
      )}>
        {selectedNote ? (
          <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-background/30">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden gap-1"
                onClick={() => setSelectedNote(null)}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSummarize}
                  disabled={isSummarizing || !selectedNote.content}
                  className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
                >
                  {isSummarizing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  AI Summarize
                </Button>
                {isEditing ? (
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="rounded-xl gap-1.5 shadow-md shadow-primary/10"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>

            {/* Note details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note Title"
                    className="text-2xl font-bold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-0 rounded-none shadow-none h-auto py-1"
                  />
                  <Input
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Tags (comma-separated)"
                    className="text-sm border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-0 rounded-none shadow-none"
                  />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Start writing..."
                    rows={12}
                    className="w-full text-base border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-0 rounded-none shadow-none resize-none focus:outline-none"
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Title & Tags */}
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">{selectedNote.title || "Untitled Note"}</h2>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selectedNote.tags?.map((t) => (
                        <Badge key={t} variant="secondary" className="rounded-md">
                          {t}
                        </Badge>
                      )) || <span className="text-xs text-muted-foreground italic">No tags</span>}
                    </div>
                  </div>

                  {/* AI Summary Banner */}
                  {selectedNote.summary && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                        <Sparkles className="h-4 w-4" />
                        AI Summary
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedNote.summary}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-base text-foreground leading-relaxed whitespace-pre-wrap pt-2">
                    {selectedNote.content || <p className="italic text-muted-foreground">No content yet. Click edit to begin writing.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-6 space-y-3">
            <BookOpen className="h-16 w-16 mx-auto text-primary/20" />
            <h3 className="text-xl font-bold tracking-tight">Select a note</h3>
            <p className="text-sm text-muted-foreground max-w-sm">Choose a note from the list or create a new one to access your Second Brain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
