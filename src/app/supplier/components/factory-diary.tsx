import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const FactoryDiary = () => {
  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-white">Factory Diary</CardTitle>
        <CardDescription>Production Batch Tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Batch #F-228</p>
          <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
            <li className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Materials Received
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
              In Production (Day 3/7)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></span>
              Quality Control
            </li>
             <li className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></span>
              Ready for Dispatch
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FactoryDiary;
