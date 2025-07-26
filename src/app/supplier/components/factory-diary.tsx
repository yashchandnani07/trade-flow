
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const FactoryDiary = () => {
  return (
    <Card className="bg-glass">
        <CardHeader>
            <CardTitle>Factory Diary</CardTitle>
            <CardDescription>Log daily notes, events, or production issues.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Textarea placeholder="Type your note for today..." />
            <Button>Save Note</Button>
        </CardContent>
    </Card>
  );
};

export default FactoryDiary;
