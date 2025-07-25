import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const FactoryDiary = () => {
  return (
    <Card className="bg-card-gradient">
      <CardHeader>
        <CardTitle>Factory Diary</CardTitle>
        <CardDescription>Production Batch Tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm font-semibold">Batch #F-228</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Materials Received
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
              In Production (Day 3/7)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-muted-foreground mr-2"></span>
              Quality Control
            </li>
             <li className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-muted-foreground mr-2"></span>
              Ready for Dispatch
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FactoryDiary;
