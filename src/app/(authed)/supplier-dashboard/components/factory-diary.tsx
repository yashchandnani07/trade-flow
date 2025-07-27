
'use client';
import { useState, useMemo, FormEvent, useEffect } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import type { DiaryEntry } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';

function DeleteConfirmationDialog({ entry, onConfirm, isDeleting }: { entry: DiaryEntry, onConfirm: () => void, isDeleting: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-glass">
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete this diary entry.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="button" onClick={handleConfirm} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function EditEntryDialog({ entry, onUpdate }: { entry: DiaryEntry, onUpdate: (id: string, newContent: string) => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [content, setContent] = useState(entry.content);

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onUpdate(entry.id, content);
            setIsOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    }

     return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-glass">
                <DialogHeader>
                    <DialogTitle>Edit Diary Entry</DialogTitle>
                    <DialogDescription>Update the content of your diary entry.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdate}>
                    <div className="space-y-4 py-4">
                       <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function FactoryDiary() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [newEntry, setNewEntry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const entriesCollection = useMemo(() => collection(db, 'diaryEntries'), []);
    const entriesQuery = useMemo(() => {
        if (!user) return null;
        return query(entriesCollection, where("ownerId", "==", user.uid), orderBy("createdAt", "desc"));
    }, [entriesCollection, user]);

    const [entries, loading, error] = useCollectionData(entriesQuery, { idField: 'id' });

    const handleSaveEntry = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || newEntry.trim() === '') return;

        setIsSubmitting(true);
        try {
            await addDoc(entriesCollection, {
                ownerId: user.uid,
                content: newEntry,
                createdAt: serverTimestamp(),
            });
            toast({ title: "Entry Saved", description: "Your factory diary has been updated." });
            setNewEntry('');
        } catch (err) {
            console.error("Error saving diary entry:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save your entry.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateEntry = async (id: string, newContent: string) => {
        setProcessingId(id);
        try {
            const entryRef = doc(db, 'diaryEntries', id);
            await updateDoc(entryRef, { content: newContent });
            toast({ title: "Entry Updated", description: "Your diary entry has been successfully updated." });
        } catch (err) {
            console.error("Error updating diary entry:", err);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update your entry.' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        setProcessingId(id);
        try {
            await deleteDoc(doc(db, 'diaryEntries', id));
            toast({ title: "Entry Deleted", description: "The diary entry has been removed." });
        } catch (err) {
            console.error("Error deleting diary entry:", err);
            toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete your entry.' });
        } finally {
            setProcessingId(null);
        }
    }

    const renderContent = () => {
        if (loading) {
            return <Skeleton className="h-24 w-full" />;
        }
        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error Loading Entries</AlertTitle>
                    <AlertDescription>
                        There was a problem fetching your diary entries. This might be due to a missing Firestore index or a permissions issue.
                        <pre className="mt-2 p-2 bg-muted rounded-md text-xs whitespace-pre-wrap">{error.message}</pre>
                    </AlertDescription>
                </Alert>
            );
        }
        if (entries && entries.length > 0) {
            return (
                <div className="space-y-3">
                    {entries.map(entryData => {
                        const entry = entryData as DiaryEntry;
                        const isProcessing = processingId === entry.id;
                        return (
                            <div key={entry.id} className="text-sm p-3 bg-muted/50 rounded-md group relative">
                                <p className="text-muted-foreground text-xs mb-1">
                                    {entry.createdAt ? format(entry.createdAt.toDate(), 'PPP p') : 'Just now'}
                                </p>
                                <p className="whitespace-pre-wrap pr-20">{entry.content}</p>
                                <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <EditEntryDialog entry={entry} onUpdate={handleUpdateEntry} />
                                    <DeleteConfirmationDialog 
                                        entry={entry}
                                        onConfirm={() => handleDeleteEntry(entry.id)}
                                        isDeleting={isProcessing}
                                    />
                                    {isProcessing && <Loader2 className="h-4 w-4 animate-spin"/>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return (
            <p className="text-muted-foreground text-center py-4">No entries yet. Write one below!</p>
        );
    };

    return (
        <Card className="glassmorphic flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen />
                    Factory Diary
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 overflow-y-auto max-h-60">
                {renderContent()}
            </CardContent>
            <CardFooter>
                <form onSubmit={handleSaveEntry} className="w-full space-y-2">
                    <Textarea
                        placeholder="Type your notes here..."
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        rows={3}
                    />
                    <Button type="submit" disabled={isSubmitting || newEntry.trim() === ''} className="w-full">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Entry
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
