
'use client';
import { useState, useMemo, FormEvent } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import type { DiaryEntry } from '@/lib/types';

export default function FactoryDiary() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [newEntry, setNewEntry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <Card className="glassmorphic flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen />
                    Factory Diary
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 overflow-y-auto max-h-60">
                {loading && <Skeleton className="h-24 w-full" />}
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                )}
                {!loading && entries && entries.length > 0 ? (
                    <div className="space-y-3">
                        {entries.map(entryData => {
                            const entry = entryData as DiaryEntry;
                            return (
                                <div key={entry.id} className="text-sm p-3 bg-muted/50 rounded-md">
                                    <p className="text-muted-foreground text-xs mb-1">
                                        {entry.createdAt ? format(entry.createdAt.toDate(), 'PPP p') : 'Just now'}
                                    </p>
                                    <p>{entry.content}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    !loading && <p className="text-muted-foreground text-center py-4">No entries yet. Write one below!</p>
                )}
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
