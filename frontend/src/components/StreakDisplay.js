import { Card, CardContent } from '@/components/ui/card';
import { Flame } from 'lucide-react';

function StreakDisplay({ streak, motivationalMessage }) {
  return (
    <Card className="glass border-emerald-100 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden relative">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-orange-700 mb-1">Current Streak</p>
            <div className="flex items-center gap-3">
              <p className="text-5xl font-bold text-orange-900" data-testid="streak-count">{streak}</p>
              <div>
                <p className="text-2xl text-orange-800">days</p>
                <Flame className="w-8 h-8 text-orange-500 animate-pulse" fill="currentColor" />
              </div>
            </div>
          </div>
          <div className="hidden md:block text-6xl opacity-20">
            🔥
          </div>
        </div>
        <p className="text-sm font-medium text-orange-800 mt-4" data-testid="motivational-message">
          {motivationalMessage}
        </p>
      </CardContent>
    </Card>
  );
}

export default StreakDisplay;
